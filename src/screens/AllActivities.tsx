import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { authApi } from "../services/api";

const COLORS = {
  primary: "#990000",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

type FeedAction =
  | "USER_LOGIN"
  | "USER_REGISTERED"
  | "PROFILE_UPDATE"
  | "CONTEST_JOINED"
  | "SUBMISSION_CREATED"
  | "SUBMISSION_APPROVED"
  | "SUBMISSION_REJECTED"
  | "VOTE_CAST"
  | "WINNER_DECLARED"
  | "CONTEST_WINNER_DECLARED"
  | "PASSWORD_CHANGED"
  | "ORGANIZER_APPROVED"
  | "ORGANIZER_REJECTED"
  | "BULK_MODERATION";

interface FeedCard {
  id: string;
  action: FeedAction;
  createdAt: string;
  description: string;
  category: "account" | "contest" | "security" | "system";
}

const activityMeta: Record<string, { icon: any; color: string; bg: string; title: string; category: FeedCard["category"] }> = {
  USER_LOGIN: { icon: "log-in-outline", color: "#4B5563", bg: "#F3F4F6", title: "Logged in", category: "account" },
  USER_REGISTERED: { icon: "person-add-outline", color: "#990000", bg: "#FEE2E2", title: "Welcome", category: "account" },
  PROFILE_UPDATE: { icon: "person-circle-outline", color: "#4B5563", bg: "#F3F4F6", title: "Profile Update", category: "account" },
  CONTEST_JOINED: { icon: "checkmark-circle-outline", color: "#990000", bg: "#FEE2E2", title: "Contest Joined", category: "contest" },
  SUBMISSION_CREATED: { icon: "document-text-outline", color: "#990000", bg: "#FEE2E2", title: "Entry Submitted", category: "contest" },
  SUBMISSION_APPROVED: { icon: "shield-checkmark-outline", color: "#10B981", bg: "#D1FAE5", title: "Entry Approved", category: "contest" },
  SUBMISSION_REJECTED: { icon: "close-circle-outline", color: "#EF4444", bg: "#FEE2E2", title: "Entry Rejected", category: "contest" },
  VOTE_CAST: { icon: "heart-outline", color: "#990000", bg: "#FEE2E2", title: "Vote Cast", category: "contest" },
  WINNER_DECLARED: { icon: "trophy-outline", color: "#F59E0B", bg: "#FEF3C7", title: "Winners Declared", category: "contest" },
  CONTEST_WINNER_DECLARED: { icon: "trophy-outline", color: "#F59E0B", bg: "#FEF3C7", title: "Winners Declared", category: "contest" },
  PASSWORD_CHANGED: { icon: "lock-closed-outline", color: "#990000", bg: "#FEE2E2", title: "Security Update", category: "security" },
  ORGANIZER_APPROVED: { icon: "shield-checkmark-outline", color: "#990000", bg: "#FEE2E2", title: "Organizer Approved", category: "account" },
  ORGANIZER_REJECTED: { icon: "warning-outline", color: "#EF4444", bg: "#FEE2E2", title: "Organizer Rejected", category: "account" },
  BULK_MODERATION: { icon: "layers-outline", color: "#4B5563", bg: "#F3F4F6", title: "Bulk Action", category: "system" },
};

function buildActivityDescription(activity: any) {
  const meta = activity.metadata || {};
  const contestTitle = meta.contestTitle || meta.title;

  switch (activity.action.toUpperCase()) {
    case "USER_LOGIN": return `Signed in successfully${meta.provider ? ` via ${meta.provider}` : ""}.`;
    case "USER_REGISTERED": return "Successfully registered your account. Welcome to Contest Nepal!";
    case "PROFILE_UPDATE": return "You updated your profile information.";
    case "CONTEST_JOINED": return contestTitle ? `Joined the contest "${contestTitle}".` : "Joined a new contest.";
    case "SUBMISSION_CREATED": return contestTitle ? `Submitted a new entry for "${contestTitle}".` : "Submitted a contest entry.";
    case "SUBMISSION_APPROVED": return contestTitle ? `Your entry for "${contestTitle}" was approved and is now public.` : "Your submission was approved.";
    case "SUBMISSION_REJECTED": return contestTitle ? `Your entry for "${contestTitle}" was rejected by the organizer.` : "Your submission was rejected.";
    case "VOTE_CAST": return contestTitle ? `Cast a vote in "${contestTitle}".` : "Your vote was recorded.";
    case "CONTEST_WINNER_DECLARED":
    case "WINNER_DECLARED": return contestTitle ? `Winners have been declared for "${contestTitle}"!` : "Winners have been declared for a contest.";
    case "PASSWORD_CHANGED": return "Your account password was successfully updated.";
    case "ORGANIZER_APPROVED": return "Your organizer account application has been approved.";
    case "ORGANIZER_REJECTED": return "Your organizer account application was rejected.";
    case "BULK_MODERATION": return "Multiple submissions were processed in a batch operation.";
    default: return activity.message || "An activity was recorded.";
  }
}

const AllActivities = () => {
  const [activities, setActivities] = useState<FeedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "contest" | "account" | "security">("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  const fetchActivities = async (cursor?: string) => {
    if (!cursor) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const response = await authApi.getMyActivities({ limit: 15, cursor });
      if (response.success && response.data?.items) {
        const mappedData = response.data.items.map((item: any) => {
          const action = item.action.toUpperCase();
          return {
            id: item.id || item._id,
            action: action as FeedAction,
            createdAt: item.createdAt,
            description: buildActivityDescription(item),
            category: activityMeta[action]?.category || "system",
          };
        });
        if (cursor) {
          setActivities(prev => [...prev, ...mappedData]);
        } else {
          setActivities(mappedData);
        }
        setNextCursor(response.data.nextCursor || null);
      }
    } catch (error) {
      console.log("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchActivities(nextCursor);
    }
  };

  const filteredActivities = activeTab === "all" ? activities : activities.filter(a => a.category === activeTab);

  const renderItem = ({ item }: { item: FeedCard }) => {
    const meta = activityMeta[item.action] || { icon: "notifications-outline", color: "#6B7280", bg: "#F3F4F6", title: "Notification" };
    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{meta.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Activity Log" />
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["all", "contest", "account", "security"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading activities...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No Activities Yet"
              message="Your activity log is empty. Actions you take on the app will appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.bgLight,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.textDark,
  },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  cardTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default AllActivities;
