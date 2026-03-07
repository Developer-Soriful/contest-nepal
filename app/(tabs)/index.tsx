import ContestCard from '@/src/components/ContestCard';
import HomeHeader from '@/src/components/HomeHeader';
import PromotionalBanner from '@/src/components/PromotionalBanner';
import SectionHeader from '@/src/components/SectionHeader';
import React from 'react';
import {
  ScrollView,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomePage = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ebf3f4", marginBottom: 20 }}
    >
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
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
          <SectionHeader title="Featured Contest" arrowIcon="grid-outline" />
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>

        {/* Contest nearby Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <SectionHeader title="Contest nearby" arrowIcon="grid-outline" />
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
