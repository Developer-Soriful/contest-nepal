import Header from "@/src/components/Header";
import { useNotificationContext } from "@/src/contexts/NotificationContext";
import {
  buildNotificationDetailHref,
  getNotificationContestId,
  getNotificationEntryId,
  resolveNotificationTarget,
} from "@/src/lib/notificationRouting";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categoryIconMap: Record<string, { name: any; lib: "material" | "ionicons" }> = {
  prize: { name: "trophy-outline", lib: "material" },
  contest: { name: "flag-outline", lib: "ionicons" },
  entry: { name: "checkmark-circle-outline", lib: "ionicons" },
  reminder: { name: "alarm-outline", lib: "ionicons" },
  announcement: { name: "megaphone-outline", lib: "ionicons" },
  system: { name: "notifications-outline", lib: "ionicons" },
  default: { name: "notifications-outline", lib: "ionicons" },
};

function formatTime(timestamp?: string) {
  if (!timestamp) {
    return "Recently";
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return parsed.toLocaleString();
}

const NotificationDetailScreen = () => {
  const { deleteOne } = useNotificationContext();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    message?: string;
    time?: string;
    category?: string;
    source?: string;
    actionLabel?: string;
    data?: string;
  }>();

  const payloadData = useMemo(() => {
    if (!params.data) {
      return {};
    }

    try {
      const parsed = JSON.parse(params.data);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [params.data]);

  const notification = useMemo(
    () => ({
      id: params.id,
      title: params.title || "Notification",
      body: params.message || "",
      type: params.category,
      timestamp: params.time,
      data: payloadData,
    }),
    [params.category, params.id, params.message, params.time, params.title, payloadData]
  );

  const target = useMemo(() => resolveNotificationTarget(notification), [notification]);
  const isSelfDetailTarget = useMemo(() => {
    const detailHref = buildNotificationDetailHref(notification, params.actionLabel || "View Details");
    return JSON.stringify(detailHref) === JSON.stringify(target.href);
  }, [notification, params.actionLabel, target.href]);

  const category = (params.category || "system").toLowerCase();
  const iconEntry = categoryIconMap[category] ?? categoryIconMap.default;
  const contestId = getNotificationContestId(notification);
  const entryId = getNotificationEntryId(notification);

  const handleDelete = () => {
    if (!notification.id) {
      return;
    }

    Alert.alert("Delete notification", "This notification will be removed from your inbox.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteOne(notification.id as string);
          router.replace("/notifications");
        },
      },
    ]);
  };

  const renderIcon = () => {
    if (iconEntry.lib === "material") {
      return (
        <MaterialCommunityIcons name={iconEntry.name} size={38} color="#FFF" />
      );
    }
    return <Ionicons name={iconEntry.name} size={38} color="#FFF" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notification"
        backgroundColor="transparent"
        showLeftIcon={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#A30000", "#D21F2A"]}
            style={styles.iconContainer}
          >
            {renderIcon()}
          </LinearGradient>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <AntDesign name="bell" size={12} color="#A30000" />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>{params.source || "system"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.titleText}>{notification.title}</Text>

          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#667085" />
            <Text style={styles.timeText}>{formatTime(notification.timestamp)}</Text>
          </View>

          <Text style={styles.messageLabel}>Message</Text>
          <Text style={styles.messageText}>
            {notification.body || "No additional details were included."}
          </Text>
        </View>

        <View style={styles.metaSection}>
          {contestId ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Contest</Text>
              <Text style={styles.metaValue}>{contestId}</Text>
            </View>
          ) : null}
          {entryId ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Entry</Text>
              <Text style={styles.metaValue}>{entryId}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Delivery</Text>
            <Text style={styles.metaValue}>
              {payloadData.path ? "Backend-directed" : "App-resolved"}
            </Text>
          </View>
        </View>

        {!isSelfDetailTarget ? (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push(target.href)}
          >
            <LinearGradient
              colors={["#A30000", "#D21F2A"]}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                {params.actionLabel || target.actionLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="list-outline" size={18} color="#A30000" />
          <Text style={styles.secondaryButtonText}>Back to Notifications</Text>
        </TouchableOpacity>

        {notification.id ? (
          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#D92D20" />
            <Text style={styles.deleteButtonText}>Delete Notification</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf3f4",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 28,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#A3000015",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A3000030",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A30000",
    textTransform: "capitalize",
  },
  sourceBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  sourceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475467",
    textTransform: "capitalize",
  },
  detailSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1A2E4C",
    lineHeight: 30,
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  timeText: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "500",
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: 0,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#4F586D",
    lineHeight: 24,
  },
  metaSection: {
    gap: 10,
    marginBottom: 18,
  },
  metaItem: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#667085",
  },
  metaValue: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: "#1D2939",
    textAlign: "right",
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  primaryButtonGradient: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F04438",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#A30000",
  },
  deleteButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D92D20",
  },
});

export default NotificationDetailScreen;
