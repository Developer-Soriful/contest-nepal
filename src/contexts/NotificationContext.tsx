import Constants from "expo-constants";
import React, { createContext, ReactNode, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

interface NotificationContextType {
  pushToken: string | null;
  notificationPermission: boolean;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    timestamp: string;
    read: boolean;
  }>;
  unreadCount: number;
  isRefreshing: boolean;
  registerPushNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Skip all notification setup in Expo Go
  if (isExpoGo) {
    console.log("📱 NotificationProvider - Expo Go detected, skipping push notification setup");

    // Provide safe fallback values
    return (
      <NotificationContext.Provider
        value={{
          pushToken: null,
          notificationPermission: false,
          notifications: [],
          unreadCount: 0,
          isRefreshing: false,
          registerPushNotifications: async () => {
            console.log("📱 Push notifications not available in Expo Go");
          },
          markAsRead: async () => {},
          markAllAsRead: async () => {},
          refreshNotifications: async () => {},
        }}
      >
        {children}
      </NotificationContext.Provider>
    );
  }

  const {
    pushToken,
    notificationPermission,
    notifications,
    unreadCount,
    isRefreshing,
    registerPushNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notificationPermission,
        notifications,
        unreadCount,
        isRefreshing,
        registerPushNotifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}
