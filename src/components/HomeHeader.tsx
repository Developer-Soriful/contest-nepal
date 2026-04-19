import { import_img } from "@/assets/import_img";
import { AUTH_EVENTS, useAuth } from "@/src/contexts/AuthContext";
import { useNotificationContext } from "@/src/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeHeader: React.FC = () => {
  const [avatarError, setAvatarError] = useState(false);
  const { user, isLoading } = useAuth();
  const { unreadCount, refreshNotifications } = useNotificationContext();

  // Get real user data from AuthContext
  const userName = user?.profile?.displayName || user?.email?.split('@')[0] || "User";
  const avatarUri = user?.profile?.avatarUrl || null;

  // Listen for user update events from AuthContext
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(AUTH_EVENTS.USER_UPDATED, () => {
      console.log('[HomeHeader] Received USER_UPDATED event');
      setAvatarError(false);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Reset avatarError when component is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[HomeHeader] Focused, resetting avatarError and refreshing notifications');
      setAvatarError(false);
      void refreshNotifications();
    }, [refreshNotifications])
  );
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
      }}
    >
      {/* Profile Section (Left) */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* User Avatar */}
        <TouchableOpacity onPress={() => router.navigate("/profile")}>
          {isLoading ? (
            <View
              style={{
                width: 51,
                height: 51,
                borderRadius: 27,
                backgroundColor: "#E5E7EB",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#fff",
              }}
            >
              <ActivityIndicator size="small" color="#990009" />
            </View>
          ) : avatarUri && !avatarError ? (
            <Image
              key={avatarUri} // Force re-render when avatar URL changes
              source={{ uri: avatarUri }}
              style={{
                width: 51,
                height: 51,
                borderRadius: 27,
                borderWidth: 1,
                borderColor: "#fff",
                backgroundColor: "#E5E7EB",
              }}
              onError={() => {
                console.log('HomeHeader - Failed to load avatar, showing fallback');
                setAvatarError(true);
              }}
            />
          ) : (
            <Image
              source={import_img.user_avatar}
              style={{
                width: 51,
                height: 51,
                borderRadius: 27,
                borderWidth: 1,
                borderColor: "#fff",
                backgroundColor: "#E5E7EB",
              }}
            />
          )}
        </TouchableOpacity>

        {/* Welcome Text */}
        <View style={{ marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1A1C1E",
              letterSpacing: 0.3,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 2,
              fontWeight: "500",
            }}
            numberOfLines={1}
          >
            {isLoading ? "Loading..." : userName}
          </Text>
        </View>
      </View>

      {/* Notification Bell (Right) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/notifications")}
        style={{
          width: 38,
          height: 38,
          borderRadius: 24,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: 2,
          borderRightWidth: 0.1,
          borderTopWidth: 0.1,
          borderLeftWidth: 0.1,
          borderBottomColor: "#990009",
          borderRightColor: "#990009",
          borderTopColor: "#990009",
          borderLeftColor: "#990009",
          ...Platform.select({
            ios: {
              shadowColor: "#990009",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
            },
            android: {
              elevation: 4,
              shadowColor: "#990009",
            },
          }),
        }}
      >
        <View>
          <Ionicons name="notifications-outline" size={24} color="#990009" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#990009",
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default HomeHeader;
