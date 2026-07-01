import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#990000",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

const STEPS = [
  {
    title: "1. Create an Account",
    description: "Sign up and verify your email to get started. Complete your profile to stand out.",
    icon: "person-add-outline" as const,
  },
  {
    title: "2. Browse Contests",
    description: "Explore active contests across various categories. Find the ones that match your skills.",
    icon: "search-outline" as const,
  },
  {
    title: "3. Submit Your Entry",
    description: "Read the rules carefully, complete the required tasks, and upload your best work before the deadline.",
    icon: "cloud-upload-outline" as const,
  },
  {
    title: "4. Get Approved",
    description: "Contest organizers will review your submission to ensure it meets all requirements.",
    icon: "shield-checkmark-outline" as const,
  },
  {
    title: "5. Win Prizes",
    description: "If your entry is selected, you'll be notified and awarded the grand prize!",
    icon: "trophy-outline" as const,
  },
];

export default function HowItWorksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="How It Works" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Your Journey on Contest Nepal</Text>
        <Text style={styles.pageSubtitle}>
          Follow these simple steps to participate in contests and win exciting prizes.
        </Text>

        <View style={styles.timeline}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              {/* Timeline line */}
              {index < STEPS.length - 1 && <View style={styles.line} />}
              
              <View style={styles.iconContainer}>
                <Ionicons name={step.icon} size={24} color={COLORS.primary} />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ready to start winning?</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  timeline: {
    paddingLeft: 8,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 32,
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 40,
    bottom: -32,
    left: 23,
    width: 2,
    backgroundColor: COLORS.border,
    zIndex: -1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.bgLight,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  }
});
