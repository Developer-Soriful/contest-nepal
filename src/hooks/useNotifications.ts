import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/pushNotifications";
import {
  clearBadge,
  registerForPushNotificationsAsync,
  removePushTokenFromBackend,
  sendPushTokenToBackend,
} from "../services/notifications";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Helper to check if push notifications are supported
const isPushSupported = () => {
  // Skip if in Expo Go (SDK 53+ removed push support in Expo Go)
  if (isExpoGo) {
    console.log("📱 Push notifications skipped - Expo Go doesn't support remote notifications in SDK 53+");
    return false;
  }
  // Skip if not on physical device (simulator/emulator)
  if (!Device.isDevice) {
    console.log("📱 Push notifications skipped - requires physical device");
    return false;
  }
  return true;
};

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface UseNotificationsReturn {
  pushToken: string | null;
  notificationPermission: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  isRefreshing: boolean;
  registerPushNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Refs to prevent duplicate registrations
  const isRegisteringRef = useRef(false);
  const hasRegisteredRef = useRef(false);

  // Register push notifications
  const registerPushNotifications = useCallback(async () => {
    // Guard: Skip if push not supported (Expo Go or simulator)
    if (!isPushSupported()) {
      return;
    }

    // Guard: Skip if already registered or registering
    if (isRegisteringRef.current || hasRegisteredRef.current) {
      return;
    }

    // Guard: Only register if authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    isRegisteringRef.current = true;

    try {
      // Register for push token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        setPushToken(token);
        setNotificationPermission(true);

        // Send token to backend
        await sendPushTokenToBackend(token);
        hasRegisteredRef.current = true;
      } else {
        setNotificationPermission(false);
      }
    } catch (error) {
      console.error("Error registering push notifications:", error);
      setNotificationPermission(false);
    } finally {
      isRegisteringRef.current = false;
    }
  }, [isAuthenticated, user]);

  // Refresh notifications (fetch from backend)
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsRefreshing(true);

    try {
      const notificationsResponse = await getMyNotifications();

      if (notificationsResponse.success) {
        const normalizedNotifications = notificationsResponse.items.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          data: item.data || {},
          timestamp: item.createdAt,
          read: item.read,
        }));

        setNotifications(normalizedNotifications);
        setUnreadCount(normalizedNotifications.filter((item) => !item.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    let shouldDecrement = false;

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) {
          shouldDecrement = true;
          return { ...n, read: true };
        }
        return n;
      })
    );

    if (shouldDecrement) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    const response = await markNotificationAsRead(id);
    if (!response.success) {
      await refreshNotifications();
    }
  }, [refreshNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const hadUnread = notifications.some((n) => !n.read);

    if (!hadUnread) {
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    const response = await markAllNotificationsAsRead();
    if (!response.success) {
      await refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  // Register when user becomes authenticated
  useEffect(() => {
    // Skip push registration in Expo Go
    if (isExpoGo) {
      console.log("📱 Push registration skipped in Expo Go");
      return;
    }

    if (isAuthenticated && user && !hasRegisteredRef.current) {
      registerPushNotifications();
    }

    // Cleanup on unmount or logout
    return () => {
      if (!isAuthenticated) {
        hasRegisteredRef.current = false;
      }
    };
  }, [isAuthenticated, user, registerPushNotifications]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshNotifications]);

  // Listen for incoming notifications (foreground)
  useEffect(() => {
    // Skip notification listeners in Expo Go (not supported)
    if (isExpoGo) {
      return;
    }

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;

        // Add to local notifications list
        const newNotification: NotificationData = {
          id: notification.request.identifier,
          title: title || "New Notification",
          body: body || "",
          data: data || {},
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);

  // Listen for notification responses (user taps notification)
  useEffect(() => {
    // Skip notification listeners in Expo Go (not supported)
    if (isExpoGo) {
      return;
    }

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;

        // Navigate based on notification type
        if (data?.type === "contest" && data?.contestId) {
          router.push(`/contest-detail?id=${data.contestId}`);
        } else if (data?.type === "prize") {
          router.push("/dashboard");
        } else if (data?.type === "entry") {
          router.push("/all-activities");
        } else {
          router.push("/notifications");
        }

        // Mark as read when tapped
        void markAsRead(response.notification.request.identifier);
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [markAsRead]);

  // Clear badge on app open
  useEffect(() => {
    // Skip in Expo Go (not supported)
    if (isExpoGo) {
      return;
    }
    clearBadge();
  }, []);

  // Handle logout - remove push token
  useEffect(() => {
    // Skip in Expo Go (no token was registered)
    if (isExpoGo) {
      return;
    }
    if (!isAuthenticated && pushToken && hasRegisteredRef.current) {
      removePushTokenFromBackend().then(() => {
        setPushToken(null);
        hasRegisteredRef.current = false;
      });
    }
  }, [isAuthenticated, pushToken]);

  return {
    pushToken,
    notificationPermission,
    notifications,
    unreadCount,
    isRefreshing,
    registerPushNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
