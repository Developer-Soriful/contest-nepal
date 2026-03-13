import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";

const OrganizerProfile = () => {
  const organizer = {
    name: "Creative Labs",
    bio: "Creative Labs is a community-driven creative studio organizing photography and design challenges to discover new talent.",
    website: "https://creativelabs.example",
    avatar: { uri: "https://i.pravatar.cc/150?u=organizer" },
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Organizer" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Image source={organizer.avatar} style={styles.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{organizer.name}</Text>
            <Text style={styles.website}>{organizer.website}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.paragraph}>{organizer.bio}</Text>

        <Text style={styles.sectionTitle}>Past Contests</Text>
        <Text style={styles.paragraph}>
          • Weekly Gift Card Drop \n• Landscape Photo Challenge \n• Minimal Logo
          Design Contest
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 12 },
  name: { fontSize: 18, fontWeight: "800", color: "#111827" },
  website: { fontSize: 14, color: "#2563EB", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  paragraph: { marginTop: 8, color: "#4B5563", lineHeight: 20 },
});

export default OrganizerProfile;
