import { import_img } from "@/assets/import_img";
import Header from "@/src/components/Header";
import { AUTH_EVENTS, useAuth } from "@/src/contexts/AuthContext";
import SafeAsyncStorage from "@/src/lib/SafeAsyncStorage";
import { authApi } from "@/src/services/api";
import {
  AntDesign,
  Feather,
  Ionicons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

// Reusable Components with Animation
const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  isDestructive = false,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!showToggle) {
      scale.value = withTiming(0.98, { duration: 80 });
      opacity.value = withTiming(0.8, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    if (!showToggle) {
      scale.value = withSpring(1, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  return (
    <AnimatedPressable
      style={[styles.menuItem, animatedStyle]}
      onPress={showToggle ? undefined : onPress}
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
    </AnimatedPressable>
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
  const [avatarError, setAvatarError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Force re-render

  // Get real user data from AuthContext
  const { user, logout, isLoading, refreshUser } = useAuth();

  // Build user display data from API response
  // Fix: Replace localhost with actual IP since backend returns localhost URLs
  const rawAvatarUrl = user?.profile?.avatarUrl;
  const avatarUrl = rawAvatarUrl?.replace('localhost', '10.10.11.91') || null;
  
  const userData = {
    name: user?.profile?.displayName || user?.email?.split('@')[0] || "User",
    phone: user?.phone || "No phone number",
    email: user?.email || "",
    avatar: avatarUrl,
    role: user?.role || "participant",
    status: user?.status || "active",
    emailVerified: user?.emailVerified || false,
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(AUTH_EVENTS.USER_UPDATED, (updatedUser) => {
      console.log('[ProfileScreen] Received USER_UPDATED event');
      setAvatarError(false);
      // Force re-render
      setLastUpdate(Date.now());
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setAvatarError(false);
      // Refresh user data when screen comes into focus
      console.log('[ProfileScreen] Screen focused - refreshing user data');
      refreshUser().then(() => {
        console.log('[ProfileScreen] User data refreshed on focus, name:', user?.profile?.displayName);
      });
    }, [])
  );

  // Navigation Handlers
  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
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

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteAccount = () => {
    console.log("Delete Account clicked");
  };

  const handleAvatarPress = async () => {
    console.log("ProfileScreen - Avatar pressed, opening image picker");
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      console.log('ProfileScreen - Image selected:', selectedImage);
      
      // Show loading state
      setAvatarError(false);
      
      // Upload avatar
      console.log('ProfileScreen - Uploading avatar...');
      const avatarResponse = await authApi.uploadAvatar(selectedImage);
      
      if (!avatarResponse.success) {
        Alert.alert('Error', avatarResponse.error?.title || 'Failed to upload avatar');
        return;
      }
      
      const avatarUrl = avatarResponse.data?.avatarUrl;
      console.log('ProfileScreen - Avatar uploaded, URL:', avatarUrl);
      
      // Update profile with new avatar
      const profileResponse = await authApi.updateProfile({
        avatarUrl,
      });
      
      if (profileResponse.success && profileResponse.data) {
        // Update stored user data
        await SafeAsyncStorage.setItem('user_data', JSON.stringify(profileResponse.data));
        await refreshUser();
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', profileResponse.error?.title || 'Failed to update profile');
      }
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    console.log('[ProfileScreen] Pull to refresh triggered');
    setRefreshing(true);
    try {
      console.log('[ProfileScreen] Before refresh - name:', user?.profile?.displayName);
      await refreshUser();
      // Force re-render by updating timestamp
      setLastUpdate(Date.now());
      console.log('[ProfileScreen] After refresh - timestamp updated');
      setAvatarError(false);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, user?.profile?.displayName]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" backgroundColor="#EFF1F3" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#990009']}
            tintColor="#990009"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        {/* User Info Card */}
        {isLoading ? (
          <View style={[styles.userCard, styles.loadingCard]}>
            <ActivityIndicator size="large" color="#990009" />
          </View>
        ) : (
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              {userData.avatar && !avatarError ? (
                <Image
                  key={userData.avatar} // Force re-render when avatar URL changes
                  source={{ uri: userData.avatar }}
                  style={styles.avatar}
                  onError={() => {
                    console.log('Profile - Failed to load remote avatar, showing fallback');
                    setAvatarError(true);
                  }}
                />
              ) : (
                <Image
                  source={import_img.user_avatar}
                  style={styles.avatar}
                />
              )}
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
              {userData.email && (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userData.email}
                </Text>
              )}
              <View style={styles.badgeContainer}>
                <View style={[styles.roleBadge, userData.role === 'organizer' && styles.organizerBadge]}>
                  <Text style={styles.roleBadgeText}>
                    {userData.role === 'organizer' ? '👑 Organizer' : '👤 Participant'}
                  </Text>
                </View>
                {userData.emailVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

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
            onPress={() => { }}
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
    backgroundColor: '#E5E7EB', // Gray background while loading or on error
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
  // Loading state
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
    height: 120,
  },
  // User info enhancements
  userEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  // Badge styles
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organizerBadge: {
    backgroundColor: "#FEF3C7",
  },
  roleBadgeText: {
    fontSize: 11,
    color: "#4338CA",
    fontWeight: "600",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
});

export default ProfileScreen;
