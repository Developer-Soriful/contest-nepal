import Header from "@/src/components/Header";
import {
  AntDesign,
  Feather,
  Ionicons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  isDestructive?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Reusable Components
const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  isDestructive = false,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={showToggle ? undefined : onPress}
      activeOpacity={showToggle ? 1 : 0.7}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <Text
          style={[styles.menuItemText, isDestructive && styles.destructiveText]}
        >
          {title}
        </Text>
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: "#E5E5E5", true: "#990009" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E5E5"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );
};

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

// Main Component
const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userData = {
    name: "Seam Rahman",
    phone: "+88017749845665",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  };

  // Navigation Handlers
  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/(auth)/change-password");
  };

  const handleActivities = () => {
    router.push("/(tabs)/graph");
  };

  const handleDashboard = () => {
    router.push("/(tabs)");
  };

  const handlePrivacyPolicy = () => {
    router.push("/privacy-policy");
  };

  const handleTermsCondition = () => {
    router.push("/terms-conditions");
  };

  const handleHelpSupport = () => {
    router.push("/help-support");
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.replace("/(auth)/login");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteAccount = () => {
    console.log("Delete Account clicked");
  };

  const handleAvatarPress = () => {
    console.log("Avatar/Camera clicked");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" backgroundColor="#EFF1F3" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ paddingTop: 20 }}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleAvatarPress}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              Name: <Text style={styles.userNameValue}>{userData.name}</Text>
            </Text>
            <Text style={styles.userPhone}>{userData.phone}</Text>
          </View>
        </View>

        {/* Account Information Section */}
        <Section title="Account Information">
          <MenuItem
            icon={<SimpleLineIcons name="pencil" size={18} color="#666" />}
            title="Edit Profile"
            onPress={handleEditProfile}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Octicons name="check-circle" size={18} color="#666" />}
            title="Change password"
            onPress={handleChangePassword}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Feather name="activity" size={18} color="#666" />}
            title="Activities"
            onPress={handleActivities}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Octicons name="apps" size={18} color="#666" />}
            title="Dashboard"
            onPress={handleDashboard}
          />
        </Section>

        {/* Policy Center Section */}
        <Section title="Policy Center">
          <MenuItem
            icon={
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#666"
              />
            }
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<AntDesign name="calendar" size={18} color="#666" />}
            title="Terms & Condition"
            onPress={handleTermsCondition}
          />
        </Section>

        {/* Settings Section */}
        <Section title="Settings">
          <MenuItem
            icon={
              <Ionicons name="notifications-outline" size={18} color="#666" />
            }
            title="Notification"
            onPress={() => {}}
            showToggle
            toggleValue={notificationsEnabled}
            onToggleChange={setNotificationsEnabled}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Feather name="help-circle" size={18} color="#666" />}
            title="Help & Support"
            onPress={handleHelpSupport}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<AntDesign name="logout" size={18} color="#666" />}
            title="Log Out"
            onPress={handleLogout}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Ionicons name="trash-outline" size={18} color="#FF6B6B" />}
            title="Delete Account"
            onPress={handleDeleteAccount}
            isDestructive
          />
        </Section>
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
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF1F3",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#990009",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  userNameValue: {
    fontWeight: "700",
  },
  userPhone: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  destructiveText: {
    color: "#FF6B6B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
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

export default ProfileScreen;
