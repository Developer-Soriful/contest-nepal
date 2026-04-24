import Constants from "expo-constants";
import React, { createContext, ReactNode, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

interface NotificationContextType {
  pushToken: string | null;
  notificationPermission: boolean;
  notifications: {
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    timestamp: string;
    read: boolean;
  }[];
  unreadCount: number;
  isRefreshing: boolean;
  registerPushNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteOne: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    pushToken,
    notificationPermission,
    notifications,
    unreadCount,
    isRefreshing,
    registerPushNotifications,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
    refreshNotifications,
  } = useNotifications();

  const contextValue: NotificationContextType = isExpoGo
    ? {
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
        deleteOne: async () => {},
        deleteAll: async () => {},
        refreshNotifications: async () => {},
      }
    : {
        pushToken,
        notificationPermission,
        notifications,
        unreadCount,
        isRefreshing,
        registerPushNotifications,
        markAsRead,
        markAllAsRead,
        deleteOne,
        deleteAll,
        refreshNotifications,
      };

  return (
    <NotificationContext.Provider value={contextValue}>
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
