import { import_img } from "@/assets/import_img";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestantCard from "../components/ContestantCard";
import Header from "../components/Header";

const AllContestants = () => {
  const mockContestants = [
    {
      id: "1",
      image: import_img.gaming_setup_neon,
      title: "Win a Premium Gaming Setup",
      description: "Best landscape photography wins! Results are now live.",
      avatar: { uri: "https://i.pravatar.cc/150?u=seam" },
      userName: "SEAM RAHMAN",
      votes: 156,
    },
    {
      id: "2",
      image: import_img.game_win,
      title: "Professional Controller Set",
      description: "Captured with Sony A7R IV. Focus on light and shadows.",
      avatar: { uri: "https://i.pravatar.cc/150?u=jane" },
      userName: "JANE DOE",
      votes: 142,
    },
    {
      id: "3",
      image: import_img.gaming_setup_neon,
      title: "Ultimate PC Build Kit",
      description: "Submit your best setup photo to win this beast.",
      avatar: { uri: "https://i.pravatar.cc/150?u=mike" },
      userName: "MIKE SMITH",
      votes: 98,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f0f4ff", "#ffffff"]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="All Contestent" backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockContestants.map((contestant) => (
          <ContestantCard
            key={contestant.id}
            image={contestant.image}
            title={contestant.title}
            description={contestant.description}
            avatar={contestant.avatar}
            userName={contestant.userName}
            votes={contestant.votes}
            onVote={() => console.log(`Voted for ${contestant.userName}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
  },
});

export default AllContestants;
