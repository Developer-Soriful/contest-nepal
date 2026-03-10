import Header from "@/src/components/Header";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Icon map by category type ---
const categoryIconMap: Record<string, { name: any; lib: string }> = {
  prize: { name: "trophy-outline", lib: "material" },
  contest: { name: "flag-outline", lib: "ionicons" },
  entry: { name: "checkmark-circle-outline", lib: "ionicons" },
  reminder: { name: "alarm-outline", lib: "ionicons" },
  reward: { name: "star-outline", lib: "ionicons" },
  default: { name: "notifications-outline", lib: "ionicons" },
};

// --- Context-aware quick actions by category ---
const actionsByCategory: Record<
  string,
  { label: string; icon: any; desc: string }[]
> = {
  prize: [
    {
      label: "Claim Prize",
      icon: "gift-outline",
      desc: "Go to your prize dashboard",
    },
    {
      label: "View Contest",
      icon: "trophy-outline",
      desc: "See the winning contest details",
    },
    {
      label: "Share Win",
      icon: "share-social-outline",
      desc: "Let your friends know!",
    },
  ],
  contest: [
    {
      label: "Join Contest",
      icon: "flag-outline",
      desc: "Enter this contest now",
    },
    {
      label: "View Rules",
      icon: "document-text-outline",
      desc: "Read the contest guidelines",
    },
    {
      label: "Save for Later",
      icon: "bookmark-outline",
      desc: "Add to your saved contests",
    },
  ],
  entry: [
    {
      label: "View Submission",
      icon: "image-outline",
      desc: "See your approved entry",
    },
    {
      label: "View Rankings",
      icon: "stats-chart-outline",
      desc: "See where you stand",
    },
    {
      label: "Share Entry",
      icon: "share-social-outline",
      desc: "Share your submission",
    },
  ],
  reminder: [
    {
      label: "Enter Now",
      icon: "rocket-outline",
      desc: "Submit your entry before it ends",
    },
    {
      label: "Set Alert",
      icon: "alarm-outline",
      desc: "Remind me 1 hour before",
    },
    {
      label: "View Contest",
      icon: "eye-outline",
      desc: "Open the contest details",
    },
  ],
  reward: [
    {
      label: "View Points",
      icon: "star-outline",
      desc: "See your full rewards history",
    },
    {
      label: "Redeem Points",
      icon: "card-outline",
      desc: "Use your points for prizes",
    },
    {
      label: "Leaderboard",
      icon: "podium-outline",
      desc: "See the top performers",
    },
  ],
  default: [
    {
      label: "View Details",
      icon: "eye-outline",
      desc: "See more information",
    },
    {
      label: "Mark as Read",
      icon: "checkmark-done-outline",
      desc: "Dismiss this notification",
    },
  ],
};

const NotificationDetailScreen = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const params = useLocalSearchParams<{
    id: string;
    title: string;
    message: string;
    time: string;
    category: string;
  }>();

  const { title, message, time, category } = params;
  const resolvedCategory = category?.toLowerCase() ?? "default";

  const iconEntry =
    categoryIconMap[resolvedCategory] ?? categoryIconMap.default;
  const actions =
    actionsByCategory[resolvedCategory] ?? actionsByCategory.default;

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
        title="Notification Detail"
        backgroundColor="transparent"
        showLeftIcon={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Icon */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#A30000", "#D21F2A"]}
            style={styles.iconContainer}
          >
            {renderIcon()}
          </LinearGradient>
          <View style={styles.categoryBadge}>
            <AntDesign name="bell" size={12} color="#A30000" />
            <Text style={styles.categoryText}>
              {category ?? "Notification"}
            </Text>
          </View>
        </View>

        {/* Detail Card */}
        <View style={styles.detailCard}>
          <Text style={styles.titleText}>{title}</Text>

          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#667085" />
            <Text style={styles.timeText}>{time}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.messageLabel}>Message</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => setShowActionSheet(true)}
          >
            <LinearGradient
              colors={["#A30000", "#D21F2A"]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="rocket-outline" size={18} color="#FFF" />
              <Text style={styles.ctaButtonText}>Take Action</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.dismissHint}>
            Tap above to see available actions for this notification.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showActionSheet}
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        />
        <View style={styles.actionSheet}>
          {/* Handle bar */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Quick Actions</Text>
            <TouchableOpacity
              onPress={() => setShowActionSheet(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={26} color="#C7D0DD" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSubtitle}>
            What would you like to do with this notification?
          </Text>

          {/* Action Items */}
          <View style={styles.actionList}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={() => setShowActionSheet(false)}
              >
                <LinearGradient
                  colors={["#A3000018", "#D21F2A10"]}
                  style={styles.actionIconBg}
                >
                  <Ionicons name={action.icon} size={22} color="#A30000" />
                </LinearGradient>
                <View style={styles.actionTextGroup}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C7D0DD" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowActionSheet(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 50,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 16,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#A30000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
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
  detailCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#A30000",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A2E4C",
    marginBottom: 12,
    lineHeight: 28,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 13,
    color: "#98A2B3",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F4F7",
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 15,
    color: "#4F586D",
    lineHeight: 24,
  },
  ctaSection: {
    alignItems: "center",
    gap: 14,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#A30000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  ctaButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dismissHint: {
    fontSize: 12,
    color: "#98A2B3",
    textAlign: "center",
    lineHeight: 18,
  },
  // --- Bottom Sheet Styles ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  actionSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: "#E4E7EC",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A2E4C",
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#98A2B3",
    marginBottom: 20,
    lineHeight: 20,
  },
  actionList: {
    gap: 12,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  actionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextGroup: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D2939",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: "#98A2B3",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#667085",
  },
});

export default NotificationDetailScreen;
