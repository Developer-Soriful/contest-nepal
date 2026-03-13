import ContestCard from "@/src/components/ContestCard";
import HomeHeader from "@/src/components/HomeHeader";
import PromotionalBanner from "@/src/components/PromotionalBanner";
import SectionHeader from "@/src/components/SectionHeader";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ebf3f4", marginBottom: 30 }}
    >
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Promotional Banner */}
        <PromotionalBanner />
        {/* Your Activity Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
          <SectionHeader title="Your Activity" />
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>
        {/* Promotional Banner */}
        <PromotionalBanner marginBottom={32} />
        {/* Featured Contest Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <SectionHeader
            title="Featured Contest"
            arrowIcon="grid-outline"
            onViewAllPress={() => router.push("/all-contests?section=featured")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingRight: 18 }}
          >
            {[
              {
                id: "f-1",
                title: "Premium Gaming Setup Giveaway",
                reward: "$2,500 Gaming PC + Accessories",
                date: "Ends Feb 28, 2026",
                joined: "1,145",
                image:
                  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
                isActive: true,
                badge: "Giveaway",
              },
              {
                id: "f-2",
                title: "Landscape Photo Challenge",
                reward: "$500 Amazon Voucher",
                date: "Ends Mar 5, 2026",
                joined: "842",
                image:
                  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
                isActive: true,
                badge: "Sponsored",
              },
              {
                id: "f-3",
                title: "Minimal Logo Design Contest",
                reward: "$1,000 Cash Prize",
                date: "Ends Mar 20, 2026",
                joined: "420",
                image:
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
                isActive: true,
                badge: "Design",
              },
            ].map((c) => (
              <ContestCard
                key={c.id}
                type="compact"
                title={c.title}
                reward={c.reward}
                date={c.date}
                joined={c.joined}
                imageSource={{ uri: c.image }}
                isActive={c.isActive}
                badgeText={c.badge}
                onPress={() =>
                  router.push(`/featuredContestDetails?contestId=${c.id}`)
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Contest nearby Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <SectionHeader
            title="Contest nearby"
            arrowIcon="grid-outline"
            onViewAllPress={() => router.push("/all-contests?section=nearby")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingRight: 18 }}
          >
            {[
              {
                id: "n-1",
                title: "City Street Photo Walk",
                reward: "$250 Local Gift Card",
                date: "Apr 02, 2026",
                joined: "230",
                image:
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
                isActive: true,
                badge: "Nearby",
              },
              {
                id: "n-2",
                title: "Community Art Sprint",
                reward: "$300 Cash",
                date: "Apr 10, 2026",
                joined: "98",
                image:
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
                isActive: true,
                badge: "Local",
              },
            ].map((c) => (
              <ContestCard
                key={c.id}
                type="compact"
                title={c.title}
                reward={c.reward}
                date={c.date}
                joined={c.joined}
                imageSource={{ uri: c.image }}
                isActive={c.isActive}
                badgeText={c.badge}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
