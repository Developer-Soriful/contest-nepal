import * as Location from 'expo-location';
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from '../../src/components/ContestCard';
import ContestCardSkeleton from '../../src/components/ContestCardSkeleton';
import EmptyState from '../../src/components/EmptyState';
import HomeHeader from '../../src/components/HomeHeader';
import PromotionalBanner from '../../src/components/PromotionalBanner';
import SectionHeader from '../../src/components/SectionHeader';
import { useAuth } from '../../src/contexts/AuthContext';
import { authApi, Contest } from '../../src/services/api';

// Local UI Types
interface LocalContest {
  id: string;
  title: string;
  reward: string;
  endDate: string;
  participantCount: number;
  coverImageUrl?: string;
  category?: string;
  location?: string;
  isActive: boolean;
}

interface LocalActivity {
  id: string;
  contestId: string;
  contestTitle: string;
  reward: string;
  endDate: string;
  participantCount: number;
  status: 'active' | 'submitted' | 'in_progress' | 'completed';
  coverImageUrl?: string;
}

const HomePage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [activities, setActivities] = useState<LocalActivity[]>([]);
  const [trendingContests, setTrendingContests] = useState<LocalContest[]>([]);
  const [nearbyContests, setNearbyContests] = useState<LocalContest[]>([]);

  // Loading states per section
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const { refreshUser, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  // Get user location for nearby contests
  const getUserLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[HomePage] Location permission denied');
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('[HomePage] User location:', latitude, longitude);
      return { lat: latitude, lng: longitude };
    } catch (error) {
      console.log('[HomePage] Error getting location:', error);
      return null;
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async (showLoading = false) => {
    console.log('[HomePage] Fetching all data...');

    if (showLoading) {
      setLoadingActivities(true);
      setLoadingTrending(true);
      setLoadingNearby(true);
    }

    try {
      // Get user location first (for nearby contests)
      const userLocation = await getUserLocation();

      // Fetch all APIs in parallel
      const [submissionsRes, trendingRes, nearbyRes] = await Promise.all([
        authApi.getMySubmissions(),
        authApi.getTrendingContests(),
        userLocation
          ? authApi.getNearbyContests(userLocation.lat, userLocation.lng)
          : Promise.resolve({ success: false, data: { items: [] as Contest[], nextCursor: null }, error: { title: 'Location not available', status: 0 } }),
      ]);

      // Update activities from submissions - API returns { items: [...], nextCursor: null }
      if (submissionsRes.success && submissionsRes.data?.items) {
        const submissionItems = submissionsRes.data.items;
        console.log('[HomePage] Submissions loaded for activities:', submissionItems.length);
        // Map submissions to activities format
        const mappedActivities: LocalActivity[] = submissionItems.map(sub => ({
          id: sub._id,
          contestId: sub.contestId?._id || '',
          contestTitle: sub.contestId?.title || 'Unknown Contest',
          reward: sub.contestId?.prizeDescription || '',
          endDate: sub.createdAt,
          participantCount: sub.contestId?.stats?.participantCount || 0,
          status: (sub.status === 'approved' ? 'completed' : sub.status === 'rejected' ? 'completed' : 'submitted') as LocalActivity['status'],
          coverImageUrl: sub.contestId?.coverImageUrl,
        }));
        setActivities(mappedActivities);
      } else {
        console.log('[HomePage] Failed to load activities:', submissionsRes.error);
        setActivities([]); // Default to empty array to prevent crash
      }
      if (trendingRes.success && trendingRes.data?.items) {
        console.log('[HomePage] Trending contests loaded:', trendingRes.data.items.length);
        const mappedTrending: LocalContest[] = trendingRes.data.items.map((c: any) => ({
          id: c._id,
          title: c.title,
          reward: c.prizeDescription || "Reward",
          endDate: c.endsAt ? new Date(c.endsAt).toLocaleDateString() : "Active",
          participantCount: c.stats?.participantCount || 0,
          coverImageUrl: c.coverImageUrl,
          isActive: c.status === "active",
          category: c.type === "SUBMISSION_VOTING" ? "Voting" : "Featured"
        }));
        setTrendingContests(mappedTrending);
      } else {
        console.log('[HomePage] Failed to load trending contests:', trendingRes.error);
        setTrendingContests([]);
      }

      // Update nearby contests
      if (nearbyRes.success && (nearbyRes as any).data?.items) {
        const items = (nearbyRes as any).data.items;
        console.log('[HomePage] Nearby contests loaded:', items.length);
        const mappedNearby: LocalContest[] = items.map((c: any) => ({
          id: c._id,
          title: c.title,
          reward: c.prizeDescription || "Reward",
          endDate: c.endsAt ? new Date(c.endsAt).toLocaleDateString() : "Active",
          participantCount: c.stats?.participantCount || 0,
          coverImageUrl: c.coverImageUrl,
          isActive: c.status === "active",
          location: "Nearby"
        }));
        setNearbyContests(mappedNearby);
      } else {
        setNearbyContests([]);
      }
    } catch (error) {
      console.log('[HomePage] Error fetching data:', error);
    } finally {
      setLoadingActivities(false);
      setLoadingTrending(false);
      setLoadingNearby(false);
      setLoading(false);
    }
  }, [getUserLocation]);

  // Initial data fetch - wait for auth to initialize first
  useEffect(() => {
    if (!isAuthLoading) {
      console.log('[HomePage] Auth initialized, fetching data...');
      fetchAllData(true);
    }
  }, [fetchAllData, isAuthLoading]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    console.log('[HomePage] Pull to refresh triggered');
    setRefreshing(true);
    try {
      await Promise.all([
        refreshUser(),
        fetchAllData(false),
      ]);
      console.log('[HomePage] Refresh completed');
    } catch (error) {
      console.log('[HomePage] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, fetchAllData]);

  const { width: screenWidth } = Dimensions.get('window');
  const horizontalPadding = 36;

  // Show loading while auth is initializing
  if (isAuthLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ebf3f4", justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#990009" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ebf3f4", marginBottom: 30 }}
    >
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#990009']}
            tintColor="#990009"
            title="Pull to refresh"
            titleColor="#990009"
          />
        }
      >
        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* Your Activity Section */}
        <View style={{ marginTop: 20 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Your Activity"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-activities")}
            />
          </View>
          {loadingActivities ? (
            <View style={{ paddingLeft: 18, paddingVertical: 8 }}>
              <ContestCardSkeleton
                count={2}
                containerWidth={activities.length === 1 ? screenWidth - horizontalPadding : 300}
              />
            </View>
          ) : activities.length === 0 ? (
            <EmptyState
              icon="trophy-outline"
              title="No Activities"
              message="Join a contest to see your progress here!"
              style={{ marginTop: 0, padding: 20 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
            >
              {activities.map((activity, index) => (
                <ContestCard
                  key={activity.id || `activity-${index}`}
                  title={activity.contestTitle}
                  reward={activity.reward}
                  date={activity.endDate}
                  joined={activity.participantCount?.toString() || '0'}
                  imageSource={activity.coverImageUrl && activity.coverImageUrl.trim() !== '' ? { uri: activity.coverImageUrl } : undefined}
                  badgeText={activity.status}
                  isActive={activity.status === 'active'}
                  onPress={() => {
                    if (!activity.contestId) {
                      console.log('[HomePage] Cannot navigate - contestId is missing');
                      return;
                    }
                    console.log('[HomePage] Activity clicked, navigating to contest:', activity.contestId);
                    router.push(`/contest-detail?contestId=${activity.contestId}`);
                  }}
                  containerStyle={{
                    width: activities.length === 1 ? screenWidth - horizontalPadding : 300,
                    marginRight: activities.length === 1 ? 0 : 16,
                    marginBottom: 0
                  }} />
              ))}
            </ScrollView>
          )}
        </View>
        {/* Promotional Banner */}
        {/* <PromotionalBanner marginBottom={32} /> */}
        {/* Featured Contest Section */}
        <View style={{ marginTop: 10 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Featured Contest"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-contests?section=featured")}
            />
          </View>
          {loadingTrending ? (
            <View style={{ paddingLeft: 18, paddingVertical: 8 }}>
              <ContestCardSkeleton
                count={2}
                containerWidth={trendingContests.length === 1 ? screenWidth - horizontalPadding : 300}
              />
            </View>
          ) : trendingContests.length === 0 ? (
            <EmptyState
              icon="star-outline"
              title="Nothing Featured"
              message="New premium contests are coming soon!"
              style={{ marginTop: 0, padding: 20 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
            >
              {trendingContests.map((contest, index) => (
                <ContestCard
                  key={contest.id || `trending-${index}`}
                  title={contest.title}
                  reward={contest.reward}
                  date={contest.endDate}
                  joined={contest.participantCount?.toString() || '0'}
                  imageSource={contest.coverImageUrl && contest.coverImageUrl.trim() !== '' ? { uri: contest.coverImageUrl } : undefined}
                  isActive={contest.isActive}
                  badgeText={contest.category || 'Featured'}
                  onPress={() =>
                    router.push(`/contest-detail?contestId=${contest.id}`)
                  }
                  containerStyle={{
                    width: trendingContests.length === 1 ? screenWidth - horizontalPadding : 300,
                    marginRight: trendingContests.length === 1 ? 0 : 16,
                    marginBottom: 0
                  }} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Contest nearby Section */}
        <View style={{ marginTop: 10 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Contest nearby"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-contests?section=nearby")}
            />
          </View>
          {loadingNearby ? (
            <View style={{ paddingLeft: 18, paddingVertical: 8 }}>
              <ContestCardSkeleton
                count={2}
                containerWidth={nearbyContests.length === 1 ? screenWidth - horizontalPadding : 300}
              />
            </View>
          ) : nearbyContests.length === 0 ? (
            <EmptyState
              icon="map-outline"
              title="None Nearby"
              message="Try expanding your search radius later!"
              style={{ marginTop: 0, padding: 20 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
            >
              {nearbyContests.map((contest, index) => (
                <ContestCard
                  key={contest.id || `nearby-${index}`}
                  title={contest.title}
                  reward={contest.reward}
                  date={contest.endDate}
                  joined={contest.participantCount?.toString() || '0'}
                  imageSource={contest.coverImageUrl && contest.coverImageUrl.trim() !== '' ? { uri: contest.coverImageUrl } : undefined}
                  isActive={contest.isActive}
                  badgeText={contest.location || 'Nearby'}
                  containerStyle={{
                    width: nearbyContests.length === 1 ? screenWidth - horizontalPadding : 300,
                    marginRight: nearbyContests.length === 1 ? 0 : 16,
                    marginBottom: 0
                  }} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
