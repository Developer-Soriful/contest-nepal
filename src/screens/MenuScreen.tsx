import Header from "@/src/components/Header";
import PromotionalBanner from "@/src/components/PromotionalBanner";
import ReportModal from "@/src/components/ReportModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { authApi } from "@/src/services/api";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Animated Menu Item Component
const MenuItem = ({ icon, title, onPress, isDestructive = false }: any) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 80 });
    opacity.value = withTiming(0.8, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      style={[styles.menuItem, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: "rgba(0,0,0,0.05)" }}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <Text
          style={[styles.menuItemText, isDestructive && styles.destructiveText]}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
    </AnimatedPressable>
  );
};

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const MenuScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.settings?.notifications?.push ?? true
  );
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await authApi.deleteAccount();
      if (response.success) {
        setShowDeleteModal(false);
        await logout();
        Alert.alert("Account Deleted", "Your account has been successfully removed.");
      } else {
        Alert.alert("Error", response.error?.title || "Failed to delete account");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    setIsUpdatingNotifications(true);
    try {
      const response = await authApi.updateMe({
        settings: {
          notifications: {
            push: value
          }
        }
      });
      if (response.success) {
        await refreshUser();
      } else {
        // Revert on failure
        setNotificationsEnabled(!value);
        Alert.alert("Error", response.error?.title || "Failed to update notification settings");
      }
    } catch (error) {
      setNotificationsEnabled(!value);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Menu" backgroundColor="#ebf3f4" showLeftIcon={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Section title="Account Settings">
            <MenuItem
              icon={<SimpleLineIcons name="user" size={18} color="#667085" />}
              title="Profile Details"
              onPress={() => router.push("/profile")}
            />
            <View style={styles.divider} />
            <View style={styles.menuItemWithAction}>
              <View style={styles.menuItemLeft}>
                <Octicons name="bell" size={18} color="#667085" />
                <Text style={styles.menuItemText}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                disabled={isUpdatingNotifications}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor="#FFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>
            <View style={styles.divider} />
            <MenuItem
              icon={<Feather name="shield" size={18} color="#667085" />}
              title="Security & Password"
              onPress={() => router.push("/(auth)/change-password")}
            />
          </Section>

          {/* Content & Activity Section */}
          <Section title="Activity">
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={18}
                  color="#667085"
                />
              }
              title="My Contests"
              onPress={() => router.push("/dashboard")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color="#667085"
                />
              }
              title="Performance Analytics"
              onPress={() => router.push("/(tabs)/graph")}
            />
          </Section>

          {/* Support Section */}
          <Section title="Support & Legal">
            <MenuItem
              icon={<Feather name="help-circle" size={18} color="#667085" />}
              title="Help Center"
              onPress={() => router.push("/help-support")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#667085"
                />
              }
              title="Feedback & Report"
              onPress={() => setIsReportModalVisible(true)}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#667085"
                />
              }
              title="Terms & Conditions"
              onPress={() => router.push("/terms-conditions")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<AntDesign name="info-circle" size={18} color="#667085" />}
              title="About App"
              onPress={() => router.push("/about-app")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<Ionicons name="trash-outline" size={18} color="#A30000" />}
              title="Delete Account"
              isDestructive={true}
              onPress={() => setShowDeleteModal(true)}
            />
          </Section>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <AntDesign name="logout" size={18} color="#A30000" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <PromotionalBanner marginTop={30} marginBottom={10} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={["#A30000", "#D21F2A"]}
              style={styles.modalIconContainer}
            >
              <AntDesign name="logout" size={40} color="#FFF" />
            </LinearGradient>

            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account? You will need to
              sign in again to access your contests.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={["#A30000", "#D21F2A"]}
              style={styles.modalIconContainer}
            >
              <Ionicons name="warning-outline" size={40} color="#FFF" />
            </LinearGradient>

            <Text style={styles.modalTitle}>Extreme Caution!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action is irreversible and you will lose access to all your participation history and rewards.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Keep Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Yes, Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Report Modal */}
      <ReportModal
        isVisible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        targetName="App Feedback"
        targetType="Other"
        targetId="app_feedback"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf3f4",
    paddingBottom: 30,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667085",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  menuItemWithAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: "#1D2939",
    fontWeight: "500",
  },
  destructiveText: {
    color: "#FF6B6B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F4F7",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D21F2A10",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D21F2A30",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#A30000",
  },
  // Modal Styles
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
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    backgroundColor: "#A30000",
  },
  cancelButton: {
    backgroundColor: "#F2F4F7",
  },
  confirmButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButtonText: {
    color: "#667085",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default MenuScreen;
