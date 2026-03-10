import Header from "@/src/components/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const FeatureCard = ({ icon, title, description }: any) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>{icon}</View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const AboutAppScreen = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="About App"
        backgroundColor="transparent"
        showLeftIcon={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Branding Section */}
        <View style={styles.brandingSection}>
          <LinearGradient
            colors={["#A30000", "#D21F2A"]}
            style={styles.logoContainer}
          >
            <Ionicons name="trophy" size={50} color="#FFF" />
          </LinearGradient>
          <Text style={styles.appName}>Contest Hub</Text>
          <Text style={styles.versionText}>Version 1.0.0 (Stable)</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To empower creators and competitors worldwide by providing a
            transparent, engaging, and professional platform to showcase talent
            and win amazing rewards.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <FeatureCard
            icon={
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#A30000"
              />
            }
            title="Secure & Fair"
            description="Our advanced anti-cheat and verification systems ensure every contest is winnable and fair."
          />
          <FeatureCard
            icon={
              <MaterialCommunityIcons
                name="broadcast"
                size={24}
                color="#A30000"
              />
            }
            title="Global Reach"
            description="Participate in contests from anywhere in the world and connect with top talent."
          />
          <FeatureCard
            icon={
              <MaterialCommunityIcons
                name="gift-outline"
                size={24}
                color="#A30000"
              />
            }
            title="Instant rewards"
            description="Claim your winnings instantly through our automated prize distribution network."
          />
        </View>

        {/* Update & Contact Section */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.updateButtonText}>Check for Updates</Text>
          </TouchableOpacity>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-facebook" size={24} color="#667085" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-instagram" size={24} color="#667085" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={24} color="#667085" />
            </TouchableOpacity>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 Contest Hub Platform. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={["#A30000", "#D21F2A"]}
              style={styles.modalIconContainer}
            >
              <MaterialCommunityIcons
                name="check-decagram"
                size={40}
                color="#FFF"
              />
            </LinearGradient>

            <Text style={styles.modalTitle}>App is Up to Date!</Text>
            <Text style={styles.modalMessage}>
              You are currently using the latest professional version of Contest
              Hub. We will notify you when a new update is available.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>Great, Thanks!</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#A30000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A2E4C",
    letterSpacing: -0.5,
  },
  versionText: {
    fontSize: 14,
    color: "#667085",
    marginTop: 5,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    marginBottom: 25,
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2E4C",
    marginBottom: 15,
  },
  missionText: {
    fontSize: 15,
    color: "#4F586D",
    lineHeight: 24,
    textAlign: "center",
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#A3000010",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D2939",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: "#A30000",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  updateButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  socialRow: {
    flexDirection: "row",
    gap: 25,
    marginBottom: 20,
  },
  socialIcon: {
    padding: 10,
  },
  copyrightText: {
    fontSize: 12,
    color: "#98A2B3",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A2E4C",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#667085",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: "#A30000",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default AboutAppScreen;
