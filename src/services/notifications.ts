import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiClient } from "./api";

const isExpoGo = Constants.appOwnership === "expo";

const getExpoProjectId = (): string | undefined => {
  const easProjectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  return typeof easProjectId === "string" && easProjectId.length > 0
    ? easProjectId
    : undefined;
};

// Configure how notifications appear when app is in foreground
// This is safe to call even in Expo Go as it only affects local notifications
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log("Notification handler setup skipped (Expo Go limitation)");
}

/**
 * Register for push notifications and get Expo push token
 * Returns the push token or null if permission denied
 * Note: Push notifications don't work in Expo Go (SDK 53+), use development build instead
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Skip if in Expo Go - push notifications require development build
  if (isExpoGo) {
    console.log("📱 Push notifications skipped - requires development build (Expo Go limitation)");
    return null;
  }

  let token: string | null = null;

  // Android channel configuration
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Contest Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });
    } catch (error) {
      console.log("Android notification channel setup failed:", error);
    }
  }

  // Only get token on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  try {
    // Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Return null if permission denied
    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    // Get Expo push token
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId: getExpoProjectId(),
    });
    token = pushToken.data;
    console.log("✅ Push token registered:", token);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Default FirebaseApp is not initialized")) {
      console.log(
        "❌ Failed to get push token: Android Firebase client config is missing. Add the correct google-services.json for com.soriful420.contest_hub to android/app and rebuild the app.",
      );
    } else {
      console.log("❌ Failed to get push token:", error);
    }
    return null;
  }

  return token;
}

/**
 * Send push token to backend for storage
 */
export async function sendPushTokenToBackend(token: string): Promise<boolean> {
  // Skip if no token or in Expo Go
  if (!token || isExpoGo) {
    return false;
  }

  try {
    const response = await apiClient.post<{ message: string }>("/v1/me/devices", {
      fcmToken: token,
      platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web",
    });

    if (response.success) {
      console.log("✅ Push token saved to backend");
      return true;
    } else {
      console.log("❌ Failed to save push token:", response.error);
      return false;
    }
  } catch (error) {
    console.log("❌ Error sending push token to backend:", error);
    return false;
  }
}

/**
 * Remove push token from backend (logout/unregister)
 */
export async function removePushTokenFromBackend(token?: string | null): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }

    const encodedToken = encodeURIComponent(token);
    const response = await apiClient.delete<{ message: string }>(`/v1/me/devices/${encodedToken}`);
    return response.success;
  } catch (error) {
    console.log("Error removing push token:", error);
    return false;
  }
}

/**
 * Schedule a local notification (for testing)
 * Works in both Expo Go and development builds
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds: number = 5
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
    console.log("✅ Local notification scheduled:", id);
    return id;
  } catch (error) {
    console.log("❌ Failed to schedule notification:", error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// Export notification types for type safety
export type { Notification } from "expo-notifications";
