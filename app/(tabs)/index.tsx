import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from '../../src/components/ContestCard';
import HomeHeader from '../../src/components/HomeHeader';
import PromotionalBanner from '../../src/components/PromotionalBanner';
import SectionHeader from '../../src/components/SectionHeader';

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
        <View style={{ marginTop: 20 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Your Activity"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-activities")}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingVertical: 8,
            }}
          >
            {[
              {
                id: "a-1",
                title: "Win a Premium Gaming Setup",
                reward: "$2,500 Gaming PC + Accessories",
                date: "Feb 15, 2026",
                joined: "1,145",
                badge: "Active",
              },
              {
                id: "a-2",
                title: "Wildlife Photo Contest",
                reward: "Canon EOS R5 Camera",
                date: "Mar 10, 2026",
                joined: "450",
                badge: "In Progress",
              },
              {
                id: "a-3",
                title: "UI/UX Design Challenge",
                reward: "Adobe CC Subscription",
                date: "Mar 25, 2026",
                joined: "280",
                badge: "Submitted",
              },
            ].map((c) => (
              <ContestCard
                key={c.id}
                title={c.title}
                reward={c.reward}
                date={c.date}
                joined={c.joined}
                badgeText={c.badge}
                containerStyle={{ width: 300, marginRight: 16, marginBottom: 0 }}
              />
            ))}
          </ScrollView>
        </View>
        {/* Promotional Banner */}
        <PromotionalBanner marginBottom={32} />
        {/* Featured Contest Section */}
        <View style={{ marginTop: 10 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Featured Contest"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-contests?section=featured")}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingVertical: 8,
            }}
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
                containerStyle={{ width: 300, marginRight: 16, marginBottom: 0 }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Contest nearby Section */}
        <View style={{ marginTop: 10 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title="Contest nearby"
              arrowIcon="grid-outline"
              onViewAllPress={() => router.push("/all-contests?section=nearby")}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingVertical: 8,
            }}
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
                title={c.title}
                reward={c.reward}
                date={c.date}
                joined={c.joined}
                imageSource={{ uri: c.image }}
                isActive={c.isActive}
                badgeText={c.badge}
                containerStyle={{ width: 300, marginRight: 16, marginBottom: 0 }}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
