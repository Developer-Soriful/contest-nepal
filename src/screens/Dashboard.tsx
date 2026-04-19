import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { authApi } from "../services/api";

interface Submission {
  _id: string;
  contestId: {
    _id: string;
    title: string;
    description?: string;
    coverImageUrl?: string;
    status?: string;
    prizeDescription?: string;
    stats?: {
      participantCount?: number;
      submissionCount?: number;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  bodyText?: string;
  mediaUrls: string[];
  createdAt: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Joined Contests");
  const [submissionFilter, setSubmissionFilter] = useState("Approved");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from submissions
  const uniqueContestIds = new Set(submissions.map(s => s.contestId._id));
  const contestsJoined = uniqueContestIds.size;
  const pendingReview = submissions.filter(s => s.status === 'pending').length;
  const submissionsApproved = submissions.filter(s => s.status === 'approved').length;

  const stats = [
    { label: "Contests Joined", value: contestsJoined.toString().padStart(2, '0') },
    { label: "Pending Review", value: pendingReview.toString().padStart(2, '0') },
    { label: "Submissions Approved", value: submissionsApproved.toString().padStart(2, '0') },
  ];

  // Fetch submissions from API
  const fetchSubmissions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      console.log('[Dashboard] Fetching submissions...');
      const response = await authApi.getMySubmissions();
      
      if (response.success && response.data) {
        // Backend returns { items: [...], nextCursor }
        const items = response.data.items || [];
        console.log('[Dashboard] Submissions loaded:', items.length);
        setSubmissions(items);
      } else {
        console.log('[Dashboard] Failed to fetch submissions:', response.error);
        setError(response.error?.title || 'Failed to load submissions');
      }
    } catch (err) {
      console.log('[Dashboard] Error fetching submissions:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSubmissions(false);
  };

  // Get unique contests from submissions (for Joined Contests tab)
  const joinedContests = submissions.reduce((acc: any[], submission) => {
    const contest = submission.contestId;
    if (!contest) return acc;
    if (!acc.find(c => c.id === contest._id)) {
      acc.push({
        id: contest._id,
        title: contest.title,
        description: contest.description || '',
        image: contest.coverImageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500',
        status: contest.status === 'active' ? 'Active' : 'Ended',
        statusColor: contest.status === 'active' ? '#00FF88' : '#FF6B6B',
        statusBg: contest.status === 'active' ? '#E6FFF4' : '#FFF0F0',
        participantCount: contest.stats?.participantCount || 0,
      });
    }
    return acc;
  }, []);

  // For now, use static contests if no submissions
  const contests = joinedContests.length > 0 ? joinedContests : [
    {
      id: 'placeholder',
      title: "No contests joined yet",
      description: "Join a contest to see it here",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500",
      status: "Active",
      statusColor: "#00FF88",
      statusBg: "#E6FFF4",
      participantCount: 0,
    },
  ];
  // Generate notifications from submissions
  const notificationsData = submissions.slice(0, 5).map(submission => {
    const contestTitle = submission.contestId?.title || 'Unknown Contest';
    const date = new Date(submission.createdAt).toISOString().split('T')[0];
    if (submission.status === 'approved') {
      return {
        id: submission._id,
        type: 'entry_approved',
        title: 'Entry Approved',
        message: `Your entry for "${contestTitle}" has been approved!`,
        date,
      };
    } else if (submission.status === 'rejected') {
      return {
        id: submission._id,
        type: 'entry_rejected',
        title: 'Entry Rejected',
        message: `Your submission for '${contestTitle}' was rejected.`,
        date,
      };
    } else {
      return {
        id: submission._id,
        type: 'new_contest',
        title: 'Entry Submitted',
        message: `You submitted an entry for "${contestTitle}"`,
        date,
      };
    }
  });

  // Notification item component
  const NotificationItem = ({
    title,
    message,
    date,
    type,
  }: {
    title: string;
    message: string;
    date: string;
    type: string;
  }) => {
    const getIcon = () => {
      switch (type) {
        case "prize_claimed":
          return {
            icon: <MaterialIcons name="card-giftcard" size={18} color="#fff" />,
            bg: "#34D399",
          };
        case "new_contest":
          return {
            icon: <Feather name="bell" size={18} color="#fff" />,
            bg: "#60A5FA",
          };
        case "entry_approved":
          return {
            icon: <Ionicons name="checkmark-circle" size={18} color="#fff" />,
            bg: "#10B981",
          };
        case "entry_rejected":
          return {
            icon: <Ionicons name="close-circle" size={18} color="#fff" />,
            bg: "#F87171",
          };
        default:
          return {
            icon: (
              <Ionicons name="notifications-outline" size={18} color="#fff" />
            ),
            bg: "#A30000",
          };
      }
    };

    const { icon, bg } = getIcon();

    return (
      <View
        style={{
          backgroundColor: "#FFF",
          borderRadius: 12,
          marginBottom: 15,
          padding: 15,
          flexDirection: "column",
          borderWidth: 1,
          borderColor: "#F0F0F0",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: bg,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            {icon}
          </View>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#1D2939" }}>
            {title}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 14, color: "#4F586D", lineHeight: 20 }}>
            {message}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#5B6477",
              marginTop: 8,
              fontWeight: "700",
            }}
          >
            {date}
          </Text>
        </View>
      </View>
    );
  };

  // Generate submissions data from API response
  const mySubmissionsData = submissions.map(submission => ({
    id: submission._id,
    contestId: submission.contestId?._id, // Pass contest ID for navigation
    title: submission.contestId?.title || 'Unknown Contest',
    date: new Date(submission.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    status: submission.status.charAt(0).toUpperCase() + submission.status.slice(1),
    reason: submission.status === 'rejected' ? 'Submission did not meet contest requirements' : undefined,
  }));

  const SubmissionItem = ({
    contestId,
    title,
    date,
    status,
    reason,
  }: {
    contestId?: string;
    title: string;
    date: string;
    status: string;
    reason?: string;
  }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Pending":
          return {
            bg: "#FFF9EB",
            color: "#F59E0B",
            icon: "🕒",
          };
        case "Rejected":
          return {
            bg: "#FFF1F0",
            color: "#F04438",
            icon: "✕",
          };
        default: // Approved
          return {
            bg: "#E6FFF4",
            color: "#00C853",
            icon: "✓",
          };
      }
    };

    const styles = getStatusStyles();

    const targetUrl = `/contest-detail-screen?id=${contestId || ''}&status=${status}${reason ? `&reason=${encodeURIComponent(reason)}` : ""}`;

    return (
      <TouchableOpacity
        onPress={() => router.push(targetUrl as any)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFF",
          padding: 15,
          borderRadius: 15,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: "#F0F0F0",
          // Added slight shadow to match card appearance
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: styles.bg,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text
            style={{
              color: styles.color,
              fontSize: status === "Pending" ? 18 : 16,
              fontWeight: "bold",
            }}
          >
            {styles.icon}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#344054" }}>
            {title}
          </Text>
          <Text style={{ fontSize: 13, color: "#98A2B3", marginTop: 4 }}>
            Submitted on {date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Header title="Dashboard" />
      <ScrollView 
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {stats.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#D21F2A0A",
                width: index === 2 ? "100%" : "48%",
                padding: 15,
                borderRadius: 15,
                marginTop: index === 2 ? 10 : 0,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 12, color: "#666", fontWeight: "500" }}
                >
                  {item.label}
                </Text>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#A30000",
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  marginTop: 10,
                  color: "#333",
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Main Tab Switcher */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F5F7FA",
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          {["Joined Contests", "My Submissions", "Notification"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: activeTab === tab ? "#A30000" : "transparent",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? "#FFF" : "#666",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- CONDITIONAL RENDERING --- */}

        {activeTab === "Joined Contests" &&
          contests.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#FFF",
                borderRadius: 20,
                marginBottom: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#F0F0F0",
                padding: 15,
                // Shadow for iOS/Android
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", height: 180, borderRadius: 15 }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: item.statusBg,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: item.statusColor,
                      marginRight: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: item.statusColor,
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1A2E4C",
                  marginTop: 15,
                }}
              >
                {item.title}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: "#7A869A",
                  lineHeight: 20,
                  marginTop: 8,
                }}
              >
                {item.description}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 20 }}>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: "#A30000",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginRight: 15,
                  }}
                >
                  <Text style={{ color: "#A30000", fontWeight: "600" }}>
                    View Contest
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#E8EAF6",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text style={{ color: "#918EF4", fontWeight: "600" }}>
                    Giveway
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {activeTab === "My Submissions" && (
          <View>
            {/* Sub-Tabs */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F2F4F7",
                borderRadius: 12,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {["Approved", "Pending", "Rejected"].map((subTab) => (
                <TouchableOpacity
                  key={subTab}
                  onPress={() => setSubmissionFilter(subTab)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor:
                      submissionFilter === subTab ? "#A30000" : "transparent",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: submissionFilter === subTab ? "#FFF" : "#667085",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {subTab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtered Submissions List */}
            {mySubmissionsData
              .filter((item) => item.status === submissionFilter)
              .map((item) => (
                <SubmissionItem
                  key={item.id}
                  contestId={item.contestId}
                  title={item.title}
                  date={item.date}
                  status={item.status}
                />
              ))}
          </View>
        )}
        {activeTab === "Notification" && (
          <View style={{ marginTop: 5 }}>
            {notificationsData.map((item) => (
              <NotificationItem
                key={item.id}
                title={item.title}
                message={item.message}
                date={item.date}
                type={item.type}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
