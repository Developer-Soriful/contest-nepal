import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
    FlatList,
    ImageSourcePropType,
    ListRenderItem,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from "../components/ContestCard";
import Header from "../components/Header";

type Contest = {
  id: string;
  title: string;
  reward: string;
  date: string;
  joined: string;
  image: string;
  badge?: string;
  isActive?: boolean;
  section?: "featured" | "nearby" | "all";
};

const MOCK_CONTESTS: Contest[] = [
  {
    id: "f-1",
    title: "Premium Gaming Setup Giveaway",
    reward: "$2,500 Gaming PC + Accessories",
    date: "Ends Feb 28, 2026",
    joined: "1,145",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    badge: "Giveaway",
    isActive: true,
    section: "featured",
  },
  {
    id: "f-2",
    title: "Landscape Photo Challenge",
    reward: "$500 Amazon Voucher",
    date: "Ends Mar 5, 2026",
    joined: "842",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    badge: "Sponsored",
    isActive: true,
    section: "featured",
  },
  {
    id: "n-1",
    title: "City Street Photo Walk",
    reward: "$250 Local Gift Card",
    date: "Apr 02, 2026",
    joined: "230",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    badge: "Nearby",
    isActive: true,
    section: "nearby",
  },
  {
    id: "n-2",
    title: "Community Art Sprint",
    reward: "$300 Cash",
    date: "Apr 10, 2026",
    joined: "98",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    badge: "Local",
    isActive: true,
    section: "nearby",
  },
  {
    id: "a-1",
    title: "Minimal Logo Design Contest",
    reward: "$1,000 Cash Prize",
    date: "Ends Mar 20, 2026",
    joined: "420",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    badge: "Design",
    isActive: false,
    section: "all",
  },
];

const AllContests = () => {
  const params = useLocalSearchParams();
  const section = (params.section as string) || "all";

  const data = useMemo(() => {
    if (section === "featured")
      return MOCK_CONTESTS.filter((c) => c.section === "featured");
    if (section === "nearby")
      return MOCK_CONTESTS.filter((c) => c.section === "nearby");
    return MOCK_CONTESTS;
  }, [section]);

  const renderItem: ListRenderItem<Contest> = ({ item }) => (
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
        onPress={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          section === "featured"
            ? "Featured Contests"
            : section === "nearby"
              ? "Contests Nearby"
              : "All Contests"
        }
      />
      <FlatList
        data={data}
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

export default AllContests;
