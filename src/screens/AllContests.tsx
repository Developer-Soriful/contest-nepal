import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageSourcePropType,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from "../components/ContestCard";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { authApi, Contest } from "../services/api";

type LocalContest = {
  id: string;
  title: string;
  reward: string;
  date: string;
  joined: string;
  image: string;
  badge?: string;
  isActive?: boolean;
  section?: "featured" | "nearby" | "all";
};

const AllContests = () => {
  const { section = "all" } = useLocalSearchParams<{ section: "featured" | "nearby" | "all" }>();
  const [contests, setContests] = useState<LocalContest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchContests = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      let response;
      if (section === "featured") {
        response = await authApi.getTrendingContests();
      } else if (section === "nearby") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          setIsLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        response = await authApi.getNearbyContests(location.coords.latitude, location.coords.longitude);
      } else {
        response = await authApi.getContests();
      }

      if (response.success && response.data?.items) {
        const mappedData: LocalContest[] = response.data.items.map((c: Contest) => ({
          id: c._id,
          title: c.title,
          reward: c.prizeDescription || "Trophy / Reward",
          date: c.endsAt ? `Ends ${new Date(c.endsAt).toLocaleDateString()}` : "Active",
          joined: c.stats?.participantCount?.toLocaleString() || "0",
          image: c.coverImageUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420",
          badge: c.status === "active" ? (c.type === "SUBMISSION_VOTING" ? "Voting" : "Active") : c.status,
          isActive: c.status === "active",
        }));
        setContests(mappedData);
        setLocationError(null);
      }
    } catch (error) {
      console.log("Error fetching contests:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [section]);

  useFocusEffect(
    useCallback(() => {
      fetchContests();
    }, [fetchContests])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchContests(false);
  };

  const handlePress = (id: string) => {
    router.push({
      pathname: "/contest-detail",
      params: { contestId: id }
    });
  };

  const renderItem: ListRenderItem<LocalContest> = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ContestCard
        type="full"
        title={item.title}
        reward={item.reward}
        date={item.date}
        joined={item.joined}
        imageSource={{ uri: item.image } as ImageSourcePropType}
        badgeText={item.badge}
        isActive={item.isActive}
        onPress={() => handlePress(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          section === "featured"
            ? "Featured Contests"
            : section === "nearby"
              ? "Contests Nearby"
              : "All Contests"
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#990009" />
          <Text style={{ marginTop: 10, color: "#667085" }}>Loading contests...</Text>
        </View>
      ) : locationError ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 16, color: "#667085", textAlign: "center" }}>{locationError}</Text>
          <Text style={{ fontSize: 14, color: "#98A2B3", marginTop: 8, textAlign: "center" }}>
            Enable location in your settings to see contests near you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#990009"]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={
                section === "featured"
                  ? "star-outline"
                  : section === "nearby"
                    ? "map-outline"
                    : "search-outline"
              }
              title={
                section === "featured"
                  ? "No Featured Contests"
                  : section === "nearby"
                    ? "No Contests Nearby"
                    : "No Contests Found"
              }
              message={
                section === "featured"
                  ? "We're currently selecting our next batch of premium contests. Check back soon!"
                  : section === "nearby"
                    ? "It looks like there aren't any active contests in your area right now. Try expanding your search!"
                    : "We couldn't find any contests matching your criteria. Try a different filter!"
              }
              buttonText={section !== "all" ? "View All Contests" : undefined}
              onButtonPress={() => router.push({ pathname: "/" })}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  listContent: { padding: 16, paddingBottom: 40 },
  cardWrapper: { marginBottom: 8 },
});

export default AllContests;
