import React from "react";
import {
  FlatList,
  ImageSourcePropType,
  ListRenderItem,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from "../components/ContestCard";
import Header from "../components/Header";

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

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a-1",
    title: "Win a Premium Gaming Setup",
    reward: "$2,500 Gaming PC + Accessories",
    date: "Feb 15, 2026",
    joined: "1,145",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    badge: "Active",
    isActive: true,
    status: "Active",
  },
  {
    id: "a-2",
    title: "Wildlife Photo Contest",
    reward: "Canon EOS R5 Camera",
    date: "Mar 10, 2026",
    joined: "450",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    badge: "In Progress",
    isActive: true,
    status: "In Progress",
  },
  {
    id: "a-3",
    title: "UI/UX Design Challenge",
    reward: "Adobe CC Subscription",
    date: "Mar 25, 2026",
    joined: "280",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop",
    badge: "Submitted",
    isActive: true,
    status: "Submitted",
  },
  {
    id: "a-4",
    title: "Coding Hackathon 2026",
    reward: "MacBook Pro M3",
    date: "Jan 20, 2026",
    joined: "890",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    badge: "Completed",
    isActive: false,
    status: "Completed",
  },
  {
    id: "a-5",
    title: "Mobile App Design Sprint",
    reward: "Figma Pro Annual",
    date: "Feb 28, 2026",
    joined: "340",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
    badge: "Active",
    isActive: true,
    status: "Active",
  },
];

const AllActivities = () => {
  const renderItem: ListRenderItem<Activity> = ({ item }) => (
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
        onPress={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Your Activity" />
      <FlatList
        data={MOCK_ACTIVITIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  listContent: { padding: 16, paddingBottom: 40 },
  cardWrapper: { marginBottom: 8 },
});

export default AllActivities;
