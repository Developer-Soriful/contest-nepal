import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageSourcePropType,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from "../components/ContestCard";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { authApi } from "../services/api";

type Activity = {
  id: string;
  title: string;
  reward: string;
  date: string;
  joined: string;
  image: string;
  badge?: string;
  isActive?: boolean;
  status?: "Active" | "In Progress" | "Submitted" | "Completed";
};

const AllActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getMySubmissions();
      if (response.success && response.data?.items) {
        const mappedData = response.data.items.map((item: any) => {
          const contest = item.contestId || {};

          let badge = "Submitted";
          let isActive = true;
          let statusLabel: any = "Submitted";

          if (item.status === "approved") {
            badge = "Active";
            statusLabel = "Active";
          } else if (item.status === "rejected") {
            badge = "Rejected";
            isActive = false;
            statusLabel = "Completed"; // Using Completed style for finality
          }

          return {
            id: item._id,
            contestId: contest._id, // Save for navigation
            title: contest.title || "Unknown Contest",
            reward: contest.prizeDescription || "Trophy / Reward",
            date: contest.endsAt ? new Date(contest.endsAt).toLocaleDateString() : "TBD",
            joined: contest.stats?.participantCount?.toString() || "0",
            image: contest.coverImageUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420",
            badge,
            isActive,
            status: statusLabel,
          };
        });
        setActivities(mappedData);
      }
    } catch (error) {
      console.log("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = (contestId: string) => {
    if (!contestId) return;
    router.push({
      pathname: "/contest-detail",
      params: { contestId }
    });
  };

  const renderItem: ListRenderItem<Activity & { contestId: string }> = ({ item }) => (
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
        buttonTitle={item.status === "Completed" ? "View Results" : "View Details"}
        onPress={() => handlePress(item.contestId)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="All Activities" />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#990009" />
          <Text style={{ marginTop: 10, color: "#667085" }}>Loading your activities...</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem as any}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <EmptyState
              icon="trophy-outline"
              title="No Activities Yet"
              message="Your contest history is empty. Join a contest and showcase your skills to see your activities here!"
              buttonText="Explore Contests"
              onButtonPress={() => router.push("/")}
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

export default AllActivities;
