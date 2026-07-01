import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { contestApi } from "../services/api";
import { import_img } from "@/assets/import_img";

const COLORS = {
  primary: "#990000",
  bg: "#FAFAFA",
  white: "#FFFFFF",
  textDark: "#111827",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#F3F4F6",
  accentYellow: "#F59E0B",
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

interface Submission {
  _id: string;
  userId: { _id: string; profile: { displayName: string; avatarUrl?: string } };
  bodyText?: string;
  mediaUrls: string[];
  voteCount: number;
  status: string;
  createdAt: string;
}

export default function SubmissionGalleryScreen() {
  const { contestId, title } = useLocalSearchParams<{ contestId: string; title: string }>();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    if (contestId) {
      fetchSubmissions();
    }
  }, [contestId]);

  const fetchSubmissions = async (cursor?: string) => {
    if (!contestId) return;
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const response = await contestApi.getContestSubmissions(contestId, {
        status: "approved",
        limit: 10,
        cursor: cursor,
      });

      if (response.success && response.data?.items) {
        if (cursor) {
          setSubmissions(prev => {
            const existingIds = new Set(prev.map(s => s._id));
            const uniqueNew = response.data!.items.filter((s: any) => !existingIds.has(s._id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setSubmissions(response.data.items);
        }
        setNextCursor(response.data.nextCursor || null);
      }
    } catch (error) {
      console.log("Error fetching gallery:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchSubmissions(nextCursor);
    }
  };

  const handleVote = async (submissionId: string) => {
    try {
      setVotingId(submissionId);
      const response = await contestApi.submitVote(submissionId);
      if (response.success) {
        // Update vote count locally
        setSubmissions(prev => prev.map(s => 
          s._id === submissionId ? { ...s, voteCount: response.data!.voteCount } : s
        ));
      }
    } catch (error) {
      console.log("Error voting:", error);
    } finally {
      setVotingId(null);
    }
  };

  const renderItem = ({ item }: { item: Submission }) => {
    const avatarSource = item.userId?.profile?.avatarUrl 
      ? { uri: item.userId.profile.avatarUrl } 
      : import_img.user_avatar;
      
    const imageSource = item.mediaUrls && item.mediaUrls.length > 0
      ? { uri: item.mediaUrls[0] }
      : null;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/my-submission-detail?submissionId=${item._id}&contestId=${contestId}`)}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>CONTEST{'\n'}NEPAL</Text>
            </View>
          )}
          
          {/* Floating Vote Count */}
          <View style={styles.voteBadge}>
            <Ionicons name="trophy" size={12} color={COLORS.accentYellow} />
            <Text style={styles.voteBadgeText}>{item.voteCount || 0}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.userNameContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.userId?.profile?.displayName || "Anonymous User"}
              </Text>
              <Text style={styles.userRole}>PARTICIPANT</Text>
            </View>
          </View>

          {/* Vote Button */}
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleVote(item._id)}
            disabled={votingId === item._id}
          >
            {votingId === item._id ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="heart-outline" size={16} color={COLORS.primary} />
                <Text style={styles.voteButtonText}>Vote</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Approved Submissions" />
      
      {/* Description Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageSubtitle}>
          Browse, search and vote for your favorite entries in this contest.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading the gallery...</Text>
        </View>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="people-outline" size={40} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>No submissions found</Text>
          <Text style={styles.emptyText}>Either this contest has just started or no entries have been approved yet.</Text>
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 20 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  placeholderText: {
    color: "#E5E7EB",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    transform: [{ rotate: "-12deg" }],
  },
  voteBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  voteBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userNameContainer: {
    flex: 1,
    marginLeft: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  userRole: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(153, 0, 0, 0.2)",
    backgroundColor: "rgba(153, 0, 0, 0.05)",
  },
  voteButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
