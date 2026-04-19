import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomGradientButton from "../components/CustomGradientButton";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { contestApi } from "../services/api";

// Types matching API response
interface Contest {
  id: string;
  title: string;
  description: string;
  rules: string;
  reward: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  participantCount: number;
  submissionCount: number;
  isActive: boolean;
  organizer?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  pollOptions?: Array<{
    id: string;
    label: string;
    voteCount: number;
  }>;
  tasks?: Array<{
    id: string;
    taskType: string;
    label: string;
    required: boolean;
  }>;
  mySubmission?: {
    id: string;
    status: string;
    submittedAt: string;
    rejectionReason?: string;
  } | null;
}

const Contest_Detail_Screen = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const searchParams = useLocalSearchParams();

  // Get contest ID from URL params
  const contestId = searchParams.id as string;

  // State
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  // Fetch contest data
  const fetchContest = useCallback(async (showLoading = true) => {
    if (!contestId) {
      setError("No contest ID provided");
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log("Fetching contest:", contestId);
      const response = await contestApi.getContestById(contestId);

      if (response.success && response.data) {
        setContest((response as any).data);
      } else {
        setError(response.error?.title || "Failed to load contest");
      }
    } catch (err) {
      console.error("Error fetching contest:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contestId]);

  // Initial fetch
  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  // Calculate time left
  useEffect(() => {
    if (!contest?.endDate) return;

    const calculateTimeLeft = () => {
      const end = new Date(contest.endDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [contest?.endDate]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContest(false);
  }, [fetchContest]);

  // Handle join contest
  const handleJoinContest = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to join this contest", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login" as any) },
      ]);
      return;
    }

    if (!contest) return;

    // Navigate to entry form
    router.push({
      pathname: "/entry-form",
      params: { contestId: contest.id, title: contest.title },
    } as any);
  }, [contest, isAuthenticated, router]);

  // Handle view entries
  const handleViewEntries = useCallback(() => {
    if (!contest) return;
    router.push({
      pathname: "/all-contestants",
      params: { contestId: contest.id, title: contest.title },
    } as any);
  }, [contest, router]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header backgroundColor="transparent" title="Contest Detail" showLeftIcon />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF7BA9" />
          <Text style={styles.loadingText}>Loading contest...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !contest) {
    return (
      <SafeAreaView style={styles.container}>
        <Header backgroundColor="transparent" title="Contest Detail" showLeftIcon />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || "Contest not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchContest()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const submissionStatus = contest.mySubmission?.status;
  const rejectionReason = contest.mySubmission?.rejectionReason;

  return (
    <SafeAreaView style={styles.container}>
      <Header backgroundColor="transparent" title="Contest Detail" showLeftIcon />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Hero Image */}
          <Image
            source={{ uri: contest.coverImageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Title */}
          <Text style={styles.title}>{contest.title}</Text>

          {/* Organizer Info */}
          {contest.organizer && (
            <View style={styles.organizerRow}>
              {contest.organizer.avatarUrl ? (
                <Image source={{ uri: contest.organizer.avatarUrl }} style={styles.organizerAvatar} />
              ) : (
                <View style={styles.organizerAvatarPlaceholder}>
                  <Text style={styles.organizerAvatarText}>
                    {contest.organizer.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.organizerName}>by {contest.organizer.displayName}</Text>
            </View>
          )}

          {/* About Section */}
          <Text style={styles.sectionTitle}>About this Contest</Text>
          <Text style={styles.description}>{contest.description}</Text>

          {/* Rules Section */}
          {contest.rules && (
            <>
              <Text style={styles.sectionTitle}>Rules & Requirements</Text>
              <Text style={styles.description}>{contest.rules}</Text>
            </>
          )}

          {/* Reward Section */}
          {contest.reward && (
            <View style={styles.prizeCard}>
              <View style={styles.prizeIconContainer}>
                <Text style={styles.prizeIcon}>🏆</Text>
              </View>
              <View style={styles.prizeInfo}>
                <Text style={styles.prizeLabel}>Grand Prize</Text>
                <Text style={styles.prizeDescription}>
                  {contest.reward}
                </Text>
              </View>
            </View>
          )}

          {/* Contest Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsIcon}>📊</Text>
              <Text style={styles.statsTitle}>Contest Stats</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>👥 Participants</Text>
                <Text style={styles.statValue}>
                  {contest.participantCount}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>🕒 Time Left</Text>
                <View style={styles.timeContainer}>
                  {timeLeft ? (
                    <>
                      <TimeBox value={timeLeft.days} label="D" />
                      <Text style={styles.timeSeparator}>:</Text>
                      <TimeBox value={timeLeft.hours} label="H" />
                      <Text style={styles.timeSeparator}>:</Text>
                      <TimeBox value={timeLeft.minutes} label="M" />
                    </>
                  ) : (
                    <Text style={styles.statValue}>Ended</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Status Banner - Winner Declared */}
          {contest.status === "winner_declared" && (
            <View style={styles.winnerBanner}>
              <View style={styles.winnerIconContainer}>
                <Text style={styles.winnerIcon}>🏆</Text>
              </View>
              <View>
                <Text style={styles.winnerTitle}>Winner Declared!</Text>
                <Text style={styles.winnerSubtitle}>
                  Results have been published by the organizer
                </Text>
              </View>
            </View>
          )}

          {/* My Submission Status */}
          {submissionStatus === "Approved" && (
            <View style={styles.approvedBanner}>
              <View style={styles.approvedIconContainer}>
                <Text style={styles.approvedIcon}>✓</Text>
              </View>
              <View>
                <Text style={styles.approvedTitle}>Entry Approved!</Text>
                <Text style={styles.approvedSubtitle}>
                  Your submission has been approved
                </Text>
              </View>
            </View>
          )}

          {submissionStatus === "Rejected" && (
            <View style={styles.rejectedCard}>
              <Text style={styles.rejectedTitle}>Submission Rejected</Text>
              <Text style={styles.rejectedText}>
                We're sorry — your submission did not meet the organizer's requirements.
              </Text>
              {rejectionReason && (
                <View style={styles.rejectionReasonBox}>
                  <Text style={styles.rejectionReasonLabel}>Reason</Text>
                  <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
                </View>
              )}
            </View>
          )}

          {/* Join / Enter Button */}
          {contest.isActive && !submissionStatus && (
            <CustomGradientButton
              containerStyle={{ borderRadius: 12, marginTop: 8 }}
              borderRadius={12}
              title="Join Contest"
              onPress={handleJoinContest}
            />
          )}

          {submissionStatus === "pending" && (
            <CustomGradientButton
              containerStyle={{ borderRadius: 12, marginTop: 8 }}
              backgroundColor="#9CA3AF"
              borderRadius={12}
              title="Pending Approval"
              onPress={() => { }}
            />
          )}

          {/* View Entries Button */}
          <CustomGradientButton
            containerStyle={{ borderRadius: 12, marginTop: 12 }}
            backgroundColor="#000"
            textColor="#FFF"
            borderRadius={12}
            title={`View Entries (${contest.submissionCount})`}
            onPress={handleViewEntries}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Time Box Component
const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeValue}>{value.toString().padStart(2, "0")}</Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FF7BA90A",
  },
  content: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667085",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A2E4C",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF7BA9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2E4C",
    marginBottom: 8,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  organizerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF7BA9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  organizerAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  organizerName: {
    fontSize: 14,
    color: "#667085",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475467",
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: "#667085",
    lineHeight: 20,
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E6FFF4",
    borderWidth: 1,
    borderColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkText: {
    color: "#00C853",
    fontSize: 12,
    fontWeight: "bold",
  },
  ruleText: {
    fontSize: 14,
    color: "#344054",
    flex: 1,
  },
  prizeCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  prizeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  prizeIcon: {
    fontSize: 24,
  },
  prizeInfo: {
    flex: 1,
  },
  prizeLabel: {
    fontSize: 14,
    color: "#667085",
  },
  prizeDescription: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2E4C",
    marginTop: 2,
  },
  prizeValue: {
    fontSize: 12,
    color: "#98A2B3",
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2E4C",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: "#667085",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
    marginTop: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeBox: {
    backgroundColor: "#FFF",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EAECF0",
    alignItems: "center",
    minWidth: 32,
  },
  timeValue: {
    color: "#A30000",
    fontWeight: "700",
    fontSize: 12,
  },
  timeLabel: {
    color: "#A30000",
    fontSize: 8,
    marginTop: 2,
  },
  timeSeparator: {
    alignSelf: "center",
    marginHorizontal: 2,
    color: "#A30000",
    fontWeight: "700",
  },
  winnerBanner: {
    backgroundColor: "#FEFCE8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  winnerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  winnerIcon: {
    color: "#FFF",
    fontSize: 20,
  },
  winnerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E2AA1B",
  },
  winnerSubtitle: {
    fontSize: 13,
    color: "#B45309",
  },
  approvedBanner: {
    backgroundColor: "#E6FFF4",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#00C853",
  },
  approvedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  approvedIcon: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  approvedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00C853",
  },
  approvedSubtitle: {
    fontSize: 13,
    color: "#667085",
  },
  rejectedCard: {
    backgroundColor: "#FFF6F6",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(240, 68, 56, 0.12)",
    marginBottom: 12,
  },
  rejectedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C53030",
    marginBottom: 6,
  },
  rejectedText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  rejectionReasonBox: {
    backgroundColor: "#FFF1F0",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  rejectionReasonLabel: {
    fontSize: 14,
    color: "#B45309",
    fontWeight: "600",
    marginBottom: 6,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});

export default Contest_Detail_Screen;
