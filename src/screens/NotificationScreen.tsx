import { import_img } from "@/assets/import_img";
import Header from "@/src/components/Header";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "Today" | "Yesterday" | "Earlier";
  type: string;
}

const notifications: NotificationData[] = [
  {
    id: "1",
    title: "Prize Claimed Successfully!",
    message:
      "Congratulations! Your prize for the 'Gaming Setup Giveaway' has been processed.",
    time: "2 mins ago",
    category: "Today",
    type: "prize",
  },
  {
    id: "2",
    title: "New Contest Alert",
    message:
      "A new 'Wildlife Photography' contest is now live. Join now to win exciting rewards!",
    time: "1 hour ago",
    category: "Today",
    type: "contest",
  },
  {
    id: "3",
    title: "Entry Approved",
    message:
      "Your submission for the 'UI/UX Design Challenge' has been approved by the judges.",
    time: "Yesterday, 4:30 PM",
    category: "Yesterday",
    type: "entry",
  },
  {
    id: "4",
    title: "Contest Ending Soon",
    message:
      "Only 5 hours left for the 'Street Photography' contest. Don't miss out!",
    time: "Yesterday, 10:00 AM",
    category: "Yesterday",
    type: "reminder",
  },
  {
    id: "5",
    title: "Reward Points Added",
    message:
      "You've earned 500 performance points for your active participation this week.",
    time: "3 days ago",
    category: "Earlier",
    type: "reward",
  },
];

const NotificationItem = ({ item }: { item: NotificationData }) => (
  <TouchableOpacity
    style={styles.notificationCard}
    activeOpacity={0.7}
    onPress={() =>
      router.push({
        pathname: "/notification-detail",
        params: {
          id: item.id,
          title: item.title,
          message: item.message,
          time: item.time,
          category: item.type,
        },
      })
    }
  >
    <View style={styles.cardHeader}>
      <Image source={import_img.notify_icon} style={styles.icon} />
      <Text style={styles.title}>{item.title}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);

const NotificationScreen = () => {
  const categories: NotificationData["category"][] = [
    "Today",
    "Yesterday",
    "Earlier",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notifications"
        backgroundColor="transparent"
        showLeftIcon={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const filteredItems = notifications.filter(
            (n) => n.category === category,
          );
          if (filteredItems.length === 0) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionHeader}>{category}</Text>
              {filteredItems.map((item) => (
                <NotificationItem key={item.id} item={item} />
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
    borderLeftWidth: 4,
    borderLeftColor: "#A30000",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  icon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D2939",
  },
  cardContent: {
    paddingLeft: 30, // Align message with title text
  },
  message: {
    fontSize: 14,
    color: "#4F586D",
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#98A2B3",
    marginTop: 8,
    fontWeight: "500",
  },
});

export default NotificationScreen;
