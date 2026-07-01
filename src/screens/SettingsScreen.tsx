import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { AUTH_EVENTS, useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";
import SafeAsyncStorage from "../lib/SafeAsyncStorage";
import { import_img } from "@/assets/import_img";
import { DeviceEventEmitter } from "react-native";

const COLORS = {
  primary: "#990000",
  primaryLight: "#D40000",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  inputBg: "#F3F4F6",
  errorRed: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  successGreen: "#10B981",
};

// ─── SECTION COMPONENT ────────────────────────────────────────
const Section = ({ title, icon, children, danger }: {
  title: string; icon: string; children: React.ReactNode; danger?: boolean;
}) => (
  <View style={[styles.section, danger && styles.sectionDanger]}>
    <View style={styles.sectionHeader}>
      <Ionicons
        name={icon as any}
        size={18}
        color={danger ? COLORS.errorRed : COLORS.primary}
      />
      <Text style={[styles.sectionTitle, danger && { color: COLORS.errorRed }]}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

// ─── FORM FIELD ───────────────────────────────────────────────
const FormField = ({ label, value, onChangeText, placeholder, editable = true, icon, keyboardType, multiline, maxLength }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; editable?: boolean; icon: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "url";
  multiline?: boolean; maxLength?: number;
}) => (
  <View style={styles.fieldContainer}>
    <View style={styles.labelRow}>
      <Ionicons name={icon as any} size={14} color={COLORS.textLight} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
    <TextInput
      style={[
        styles.input,
        !editable && styles.inputDisabled,
        multiline && styles.inputMultiline,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      editable={editable}
      keyboardType={keyboardType}
      multiline={multiline}
      maxLength={maxLength}
      textAlignVertical={multiline ? "top" : "center"}
    />
    {multiline && maxLength && (
      <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
    )}
  </View>
);

// ─── PASSWORD FIELD ───────────────────────────────────────────
const PasswordField = ({ label, value, onChangeText, placeholder = "••••••••" }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeButton}>
          <Ionicons name={show ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── DELETE ACCOUNT MODAL ─────────────────────────────────────
const DeleteAccountModal = ({ visible, onClose, onConfirm, isLoading }: {
  visible: boolean; onClose: () => void;
  onConfirm: (password: string) => void; isLoading: boolean;
}) => {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const canDelete = password.length > 0 && confirmText === "DELETE";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="trash" size={18} color={COLORS.errorRed} />
            <Text style={styles.modalTitle}>Delete Account</Text>
          </View>
          <Text style={styles.modalDesc}>
            This will permanently delete your account. Enter your password and type{" "}
            <Text style={{ fontWeight: "800", color: COLORS.textDark }}>DELETE</Text> to confirm.
          </Text>
          <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" />
          <TextInput
            style={[styles.input, { borderColor: COLORS.dangerBorder, backgroundColor: COLORS.dangerBg }]}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder='Type DELETE here...'
            placeholderTextColor={COLORS.textLight}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, (!canDelete || isLoading) && { opacity: 0.4 }]}
              onPress={() => onConfirm(password)}
              disabled={!canDelete || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.deleteBtnText}>Delete Forever</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── MAIN SETTINGS SCREEN ─────────────────────────────────────
const SettingsScreen = () => {
  const { user, refreshUser, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    website: "",
    bio: "",
    avatarUrl: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    contestUpdates: true,
    winnerAnnounce: true,
    newsletter: false,
    pushNotifs: true,
  });

  // Initialize from user data
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.profile?.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.profile?.location || "",
        company: user.profile?.company || "",
        website: user.profile?.website || "",
        bio: user.profile?.bio || "",
        avatarUrl: user.profile?.avatarUrl || "",
      });
      setIsLoading(false);
    }
  }, [user]);

  // Fetch notification settings
  useEffect(() => {
    (async () => {
      try {
        const response = await authApi.getSettings();
        if (response.success && response.data?.settings) {
          const s = response.data.settings;
          setNotifications({
            contestUpdates: s.categories?.contestUpdates ?? true,
            winnerAnnounce: s.emailNotifications?.winnerSelected ?? true,
            newsletter: s.categories?.marketing ?? false,
            pushNotifs: s.notifications?.push ?? true,
          });
        }
      } catch (e) {
        console.log("Failed to fetch settings:", e);
      }
    })();
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────
  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setIsUploadingAvatar(true);
        const response = await authApi.uploadAvatar(result.assets[0].uri);
        if (response.success && response.data) {
          const newUrl = response.data.avatarUrl;
          await authApi.updateProfile({ avatarUrl: newUrl });
          setProfile(prev => ({ ...prev, avatarUrl: newUrl }));
          await refreshUser();
          DeviceEventEmitter.emit(AUTH_EVENTS.AVATAR_UPDATED);
          Alert.alert("Success", "Avatar updated successfully");
        } else {
          Alert.alert("Error", response.error?.title || "Failed to upload avatar");
        }
        setIsUploadingAvatar(false);
      }
    } catch (e: any) {
      setIsUploadingAvatar(false);
      Alert.alert("Error", e?.message || "Failed to upload avatar");
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.displayName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await authApi.updateProfile({
        displayName: profile.displayName.trim(),
        phone: profile.phone,
        location: profile.location,
        company: profile.company,
        website: profile.website,
        bio: profile.bio,
      });
      if (response.success) {
        await refreshUser();
        DeviceEventEmitter.emit(AUTH_EVENTS.PROFILE_CHANGED);
        Alert.alert("Success", "Profile saved successfully");
      } else {
        Alert.alert("Error", response.error?.title || "Failed to save profile");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await authApi.changePassword({
        oldPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (response.success) {
        Alert.alert("Success", "Password changed successfully");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        Alert.alert("Error", response.error?.title || "Failed to change password");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));

    try {
      const update: any = {};
      if (key === "contestUpdates") update.categories = { contestUpdates: newValue };
      else if (key === "winnerAnnounce") update.emailNotifications = { winnerSelected: newValue };
      else if (key === "newsletter") update.categories = { marketing: newValue };
      else if (key === "pushNotifs") update.notifications = { push: newValue };

      const response = await authApi.updateSettings(update);
      if (!response.success) {
        // Revert
        setNotifications(prev => ({ ...prev, [key]: !newValue }));
        Alert.alert("Error", "Failed to update notification settings");
      }
    } catch (e) {
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const handleDeleteAccount = async (password: string) => {
    setIsDeleting(true);
    try {
      const response = await authApi.deleteAccount();
      if (response.success) {
        setShowDeleteModal(false);
        Alert.alert("Account Deleted", "Your account has been deleted successfully.");
        await logout();
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Error", response.error?.title || "Failed to delete account");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  // Password strength
  const passStrength = passwords.new.length === 0 ? 0
    : passwords.new.length < 6 ? 1
    : passwords.new.length < 10 ? 2
    : /[A-Z]/.test(passwords.new) && /[0-9]/.test(passwords.new) ? 4 : 3;
  const strengthColors = ["#E5E7EB", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  // Notification items
  const notifItems = [
    { key: "contestUpdates" as const, label: "Contest updates", desc: "Get notified about contests you joined" },
    { key: "winnerAnnounce" as const, label: "Winner announcements", desc: "When results are published" },
    { key: "newsletter" as const, label: "Newsletter", desc: "Weekly digest of new contests" },
    { key: "pushNotifs" as const, label: "Push notifications", desc: "Mobile push alerts" },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Settings" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ─── PROFILE SECTION ──────────────────────────── */}
          <Section title="Profile" icon="person">
            {/* Avatar */}
            <View style={styles.avatarRow}>
              <TouchableOpacity onPress={handleAvatarPick} disabled={isUploadingAvatar}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={profile.avatarUrl ? { uri: profile.avatarUrl } : import_img.user_avatar}
                    style={styles.avatar}
                  />
                  <View style={styles.cameraBadge}>
                    {isUploadingAvatar ? (
                      <ActivityIndicator size={10} color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={12} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.avatarName}>{profile.displayName || "Unnamed"}</Text>
                <Text style={styles.avatarEmail}>{profile.email}</Text>
                <TouchableOpacity onPress={handleAvatarPick} disabled={isUploadingAvatar}>
                  <Text style={styles.changePhotoText}>
                    {isUploadingAvatar ? "Uploading..." : "Change photo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Fields */}
            <FormField label="Full Name" value={profile.displayName} onChangeText={v => setProfile(p => ({ ...p, displayName: v }))} icon="person-outline" placeholder="Your name" />
            <FormField label="Email" value={profile.email} onChangeText={() => {}} icon="mail-outline" editable={false} />
            <FormField label="Phone" value={profile.phone} onChangeText={v => setProfile(p => ({ ...p, phone: v }))} icon="call-outline" placeholder="+977 ..." keyboardType="phone-pad" />
            <FormField label="Location" value={profile.location} onChangeText={v => setProfile(p => ({ ...p, location: v }))} icon="location-outline" placeholder="City, Country" />
            <FormField label="Company" value={profile.company} onChangeText={v => setProfile(p => ({ ...p, company: v }))} icon="briefcase-outline" placeholder="Your Company" />
            <FormField label="Website" value={profile.website} onChangeText={v => setProfile(p => ({ ...p, website: v }))} icon="globe-outline" placeholder="https://..." keyboardType="url" />
            <FormField label="Bio" value={profile.bio} onChangeText={v => setProfile(p => ({ ...p, bio: v }))} icon="document-text-outline" placeholder="Tell us about yourself..." multiline maxLength={500} />

            {/* Save */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={isSavingProfile}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isSavingProfile ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="save" size={16} color="#fff" />
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Section>

          {/* ─── PASSWORD SECTION ─────────────────────────── */}
          <Section title="Change Password" icon="lock-closed">
            <PasswordField label="Current Password" value={passwords.current} onChangeText={v => setPasswords(p => ({ ...p, current: v }))} />
            <PasswordField label="New Password" value={passwords.new} onChangeText={v => setPasswords(p => ({ ...p, new: v }))} />
            <PasswordField label="Confirm Password" value={passwords.confirm} onChangeText={v => setPasswords(p => ({ ...p, confirm: v }))} />

            {/* Strength indicator */}
            {passwords.new.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i <= passStrength ? strengthColors[passStrength] : "#E5E7EB" },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strengthColors[passStrength] }]}>
                  {strengthLabels[passStrength]}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, (!passwords.current || !passwords.new || !passwords.confirm) && { opacity: 0.5 }]}
              onPress={handleChangePassword}
              disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={16} color="#fff" />
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Section>

          {/* ─── NOTIFICATIONS SECTION ────────────────────── */}
          <Section title="Notifications" icon="notifications">
            {notifItems.map((item, i) => (
              <View key={item.key}>
                <View style={styles.notifRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifLabel}>{item.label}</Text>
                    <Text style={styles.notifDesc}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={notifications[item.key]}
                    onValueChange={() => handleNotificationToggle(item.key)}
                    trackColor={{ false: "#D1D5DB", true: COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
                {i < notifItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Section>

          {/* ─── DANGER ZONE ──────────────────────────────── */}
          <Section title="Danger Zone" icon="warning" danger>
            <View style={styles.dangerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitle}>Delete Account</Text>
                <Text style={styles.dangerDesc}>Permanently delete your account and all data</Text>
              </View>
              <TouchableOpacity style={styles.dangerButton} onPress={() => setShowDeleteModal(true)}>
                <Ionicons name="trash" size={14} color={COLORS.errorRed} />
                <Text style={styles.dangerButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Section>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  // Section
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  sectionDanger: { borderColor: COLORS.dangerBorder },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },

  // Avatar
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatarContainer: { position: "relative" },
  avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#F3E8E8" },
  cameraBadge: {
    position: "absolute", bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.white,
  },
  avatarName: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
  avatarEmail: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  changePhotoText: { fontSize: 12, fontWeight: "600", color: COLORS.primary, marginTop: 4 },

  // Form fields
  fieldContainer: { marginBottom: 14 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  input: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  inputDisabled: { opacity: 0.5 },
  inputMultiline: { height: 80, paddingTop: 12, textAlignVertical: "top" },
  charCount: { fontSize: 11, color: COLORS.textLight, textAlign: "right", marginTop: 4 },

  // Password field
  passwordWrap: { position: "relative" },
  passwordInput: {
    height: 44,
    paddingHorizontal: 14,
    paddingRight: 44,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  eyeButton: {
    position: "absolute", right: 12, top: 12,
  },

  // Strength
  strengthContainer: { marginBottom: 14 },
  strengthBars: { flexDirection: "row", gap: 4, marginBottom: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "600" },

  // Primary button
  primaryButton: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  gradientBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
  },
  primaryButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Notifications
  notifRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  notifLabel: { fontSize: 14, fontWeight: "500", color: COLORS.textDark },
  notifDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.inputBg },

  // Danger zone
  dangerRow: { flexDirection: "row", alignItems: "center" },
  dangerTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textDark },
  dangerDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  dangerButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: COLORS.dangerBorder,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12,
  },
  dangerButtonText: { fontSize: 12, fontWeight: "700", color: COLORS.errorRed },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 24, width: "100%", maxWidth: 380,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: COLORS.errorRed },
  modalDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 18 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  deleteBtn: {
    flex: 1, height: 44, borderRadius: 12,
    backgroundColor: COLORS.errorRed,
    alignItems: "center", justifyContent: "center",
  },
  deleteBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

export default SettingsScreen;
