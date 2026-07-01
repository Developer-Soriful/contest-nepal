import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { authApi, contestApi } from "../services/api";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#990000",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  successBg: "#D1FAE5",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
};

interface Submission {
  _id: string;
  contestId: {
    _id: string;
    title: string;
    coverImageUrl?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  bodyText?: string;
  mediaUrls: string[];
  createdAt: string;
  taskCompletions?: Array<{
    taskId: string;
    completed: boolean;
    proofUrl?: string;
  }>;
}

export default function MySubmissionDetailScreen() {
  const { submissionId, title, contestId } = useLocalSearchParams<{ submissionId: string; title: string; contestId?: string }>();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId, contestId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      
      if (contestId) {
        // Fetch public submission if coming from gallery
        const response = await contestApi.getPublicSubmission(contestId, submissionId);
        if (response.success && response.data) {
          setSubmission(response.data);
        } else {
          setError(response.error?.title || "Failed to load submission");
        }
      } else {
        // Fetch all my submissions and find the one we need
        const response = await authApi.getMySubmissions();
        if (response.success && response.data?.items) {
          const found = response.data.items.find(s => s._id === submissionId);
          if (found) {
            setSubmission(found as Submission);
          } else {
            setError("Submission not found");
          }
        } else {
          setError(response.error?.title || "Failed to load submission");
        }
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Submission Details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !submission) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Submission Details" />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || "Not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusBadge = () => {
    switch (submission.status) {
      case "approved":
        return { bg: COLORS.successBg, color: COLORS.success, icon: "checkmark-circle", text: "Approved" };
      case "rejected":
        return { bg: COLORS.dangerBg, color: COLORS.danger, icon: "close-circle", text: "Rejected" };
      case "pending":
      default:
        return { bg: COLORS.warningBg, color: COLORS.warning, icon: "time", text: "Pending Review" };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={title || "Submission Details"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon as any} size={24} color={statusStyle.color} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.statusTitle, { color: statusStyle.color }]}>
              {statusStyle.text}
            </Text>
            <Text style={{ color: statusStyle.color, marginTop: 4 }}>
              Submitted on {new Date(submission.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Contest Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contest</Text>
          <View style={styles.contestCard}>
            {submission.contestId?.coverImageUrl && (
              <Image 
                source={{ uri: submission.contestId.coverImageUrl }} 
                style={styles.contestImage} 
              />
            )}
            <Text style={styles.contestTitle}>{submission.contestId?.title}</Text>
          </View>
        </View>

        {/* Submission Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Entry</Text>
          <View style={styles.card}>
            {submission.mediaUrls && submission.mediaUrls.length > 0 && (
              <Image 
                source={{ uri: submission.mediaUrls[0] }} 
                style={styles.mediaImage} 
                resizeMode="cover" 
              />
            )}
            
            {submission.bodyText ? (
              <View style={styles.textContainer}>
                <Text style={styles.bodyText}>{submission.bodyText}</Text>
              </View>
            ) : null}
            
            {(!submission.mediaUrls?.length && !submission.bodyText) && (
              <View style={styles.textContainer}>
                <Text style={styles.textSecondary}>No content provided.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Task Completions */}
        {submission.taskCompletions && submission.taskCompletions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            <View style={styles.card}>
              {submission.taskCompletions.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <Ionicons 
                    name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={task.completed ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={styles.taskText}>Task Proof {index + 1}</Text>
                  {task.proofUrl && (
                    <Image source={{ uri: task.proofUrl }} style={styles.taskProofImage} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: COLORS.textSecondary, fontSize: 16 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  statusTitle: { fontSize: 16, fontWeight: "700" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark, marginBottom: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  contestCard: { backgroundColor: COLORS.white, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, padding: 12, flexDirection: "row", alignItems: "center" },
  contestImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  contestTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: COLORS.textDark },
  mediaImage: { width: "100%", height: 250, backgroundColor: COLORS.border },
  textContainer: { padding: 16 },
  bodyText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  textSecondary: { color: COLORS.textSecondary, fontStyle: "italic" },
  taskItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  taskText: { flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.textDark },
  taskProofImage: { width: 40, height: 40, borderRadius: 4, backgroundColor: COLORS.border }
});
