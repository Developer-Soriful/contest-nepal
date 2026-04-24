import Header from "@/src/components/Header";
import { useNotificationContext } from "@/src/contexts/NotificationContext";
import { resolveNotificationTarget } from "@/src/lib/notificationRouting";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper to format timestamp to relative time
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Helper to categorize by time
function getCategory(timestamp: string): "Today" | "Yesterday" | "Earlier" {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

const NotificationItem = ({
  item,
  onPress,
  onDelete,
}: {
  item: { id: string; title: string; body: string; data?: Record<string, any>; timestamp: string; read: boolean };
  onPress: () => void;
  onDelete: () => void;
}) => {
  const getIcon = () => {
    const type = item.data?.type || "default";
    switch (type) {
      case "prize":
        return {
          icon: <MaterialIcons name="card-giftcard" size={18} color="#fff" />,
          bg: "#34D399",
        };
      case "contest":
        return {
          icon: <Feather name="bell" size={18} color="#fff" />,
          bg: "#60A5FA",
        };
      case "entry":
        return {
          icon: <Ionicons name="checkmark-circle" size={18} color="#fff" />,
          bg: "#10B981",
        };
      case "reminder":
        return {
          icon: <Ionicons name="timer-outline" size={18} color="#fff" />,
          bg: "#A30000",
        };
      case "reward":
        return {
          icon: <Ionicons name="star" size={18} color="#fff" />,
          bg: "#F59E0B",
        };
      default:
        return {
          icon: <Ionicons name="notifications-outline" size={18} color="#fff" />,
          bg: "#A30000",
        };
    }
  };

  const { icon, bg } = getIcon();

  return (
    <TouchableOpacity
      style={[styles.notificationCard, item.read && styles.readCard]}
      activeOpacity={0.7}
      onPress={async () => {
        onPress();
        const target = resolveNotificationTarget(item);
        router.push(target.href);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          {icon}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, item.read && styles.readTitle]}>
            {item.title}
          </Text>
          <View style={styles.titleActions}>
            {!item.read && <View style={styles.unreadDot} />}
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#A30000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.message, item.read && styles.readMessage]}>
          {item.body}
        </Text>
        <Text style={styles.time}>{getRelativeTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteOne,
    deleteAll,
    refreshNotifications,
  } = useNotificationContext();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  // Group notifications by category
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const category = getCategory(notification.timestamp);
    if (!acc[category]) acc[category] = [];
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const categories = ["Today", "Yesterday", "Earlier"] as const;

  const confirmDeleteOne = useCallback((id: string) => {
    Alert.alert("Delete notification", "This notification will be removed from your inbox.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteOne(id);
        },
      },
    ]);
  }, [deleteOne]);

  const confirmDeleteAll = useCallback(() => {
    Alert.alert("Clear notifications", "This will delete all notifications for your account.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: () => {
          void deleteAll();
        },
      },
    ]);
  }, [deleteAll]);

  // Empty state
  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          backgroundColor="transparent"
          showLeftIcon={true}
          rightElement={<View style={styles.headerSpacer} />}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#98A2B3" />
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySubtitle}>
            You&apos;ll see updates about contests, prizes, and more here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        backgroundColor="transparent"
        showLeftIcon={true}
        rightElement={
          <TouchableOpacity onPress={confirmDeleteAll} activeOpacity={0.8}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {categories.map((category) => {
          const items = groupedNotifications[category];
          if (!items || items.length === 0) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionHeader}>{category}</Text>
              {items.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onPress={() => {
                    void markAsRead(item.id);
                  }}
                  onDelete={() => confirmDeleteOne(item.id)}
                />
              ))}
            </View>
          );
        })}
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  notificationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  readCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
    flex: 1,
  },
  readTitle: {
    color: "#6B7280",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A30000",
    marginRight: 10,
  },
  deleteButton: {
    padding: 2,
  },
  cardContent: {
    paddingLeft: 44,
  },
  message: {
    fontSize: 14,
    color: "#4F586D",
    lineHeight: 20,
  },
  readMessage: {
    color: "#9CA3AF",
  },
  time: {
    fontSize: 13,
    color: "#5B6477",
    marginTop: 8,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A30000",
  },
  headerSpacer: {
    width: 20,
  },
});

export default NotificationScreen;
