/**
 * Backend API Integration for Push Notifications
 * 
 * This file documents the backend endpoints needed for push notification functionality
 * and provides helper functions for frontend to test notifications
 */

import { apiClient } from "./api";

interface SendNotificationRequest {
  userIds?: string[];        // Send to specific users
  broadcast?: boolean;       // Send to all users
  title: string;
  body: string;
  data?: {
    type: "contest" | "prize" | "entry" | "announcement";
    contestId?: string;
    entryId?: string;
    [key: string]: any;
  };
}

interface SendNotificationResponse {
  success: boolean;
  sent: number;
  failed: number;
  tickets?: string[];
  error?: string;
}

/**
 * Send push notification to users
 * This calls the backend API which sends notifications via Expo Push Service
 */
export async function sendPushNotification(
  request: SendNotificationRequest
): Promise<{
  success: boolean;
  sent?: number;
  failed?: number;
  tickets?: string[];
  error?: { title: string; status?: number };
}> {
  // This endpoint needs to be implemented in backend:
  // POST /v1/admin/notifications/send
  const response = await apiClient.post<{
    success: boolean;
    sent: number;
    failed: number;
    tickets?: string[];
  }>(
    "/v1/admin/notifications/send",
    request
  );
  return response;
}

/**
 * Get notification history for current user
 * GET /v1/me/notifications
 */
export async function getMyNotifications(
  limit: number = 50,
  cursor?: string
): Promise<{
  success: boolean;
  items: Array<{
    id: string;
    title: string;
    body: string;
    type?: string;
    data: Record<string, any>;
    read: boolean;
    createdAt: string;
  }>;
  nextCursor?: string;
}> {
  try {
    const response = await apiClient.get<{
      items?: Array<{
        _id?: string;
        id?: string;
        title?: string;
        body?: string;
        type?: string;
        data?: Record<string, any>;
        isRead?: boolean;
        read?: boolean;
        createdAt?: string;
      }>;
      nextCursor?: string | null;
    }>(`/v1/me/notifications?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`);

    if (!response.success) {
      return {
        success: false,
        items: [],
      };
    }

    const items = (response.data?.items || []).map((item) => ({
      id: item.id || item._id || "",
      title: item.title || "Notification",
      body: item.body || "",
      type: item.type || "system",
      data: item.data || {},
      read: item.read ?? item.isRead ?? false,
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    return {
      success: true,
      items,
      nextCursor: response.data?.nextCursor || undefined,
    };
  } catch (error) {
    console.log("Failed to fetch notifications:", error);
    return {
      success: false,
      items: [],
    };
  }
}

/**
 * Mark notification as read
 * PATCH /v1/me/notifications/:id/read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.patch(`/v1/me/notifications/${notificationId}/read`, {});
    return { success: response.success };
  } catch (error) {
    console.log("Failed to mark notification as read:", error);
    return { success: false };
  }
}

/**
 * Mark all notifications as read
 * PATCH /v1/me/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post("/v1/me/notifications/read-all", {});
    return { success: response.success };
  } catch (error) {
    console.log("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}

// Backend Implementation Notes:
// ============================
// 
// 1. Dependencies needed in backend:
//    npm install expo-server-sdk
//
// 2. Database Schema additions:
//    
//    User model:
//    {
//      pushToken: String,
//      pushEnabled: { type: Boolean, default: true },
//      platform: String, // 'ios' | 'android'
//      lastTokenUpdate: Date
//    }
//
//    Notification model:
//    {
//      userId: ObjectId (ref: User),
//      title: String,
//      body: String,
//      data: Object,
//      read: { type: Boolean, default: false },
//      sent: { type: Boolean, default: false },
//      sentAt: Date,
//      createdAt: { type: Date, default: Date.now }
//    }
//
// 3. Backend Services needed:
//    
//    a. NotificationService.sendToUser(userId, notification)
//    b. NotificationService.sendToUsers(userIds[], notification)
//    c. NotificationService.broadcast(notification)
//    
// 4. Expo Push Service Integration:
//    
//    import { Expo } from 'expo-server-sdk';
//    
//    const expo = new Expo();
//    
//    // Send push notification
//    const chunks = expo.chunkPushNotifications([{
//      to: pushToken,
//      sound: 'default',
//      title: title,
//      body: body,
//      data: data,
//    }]);
//    
//    for (const chunk of chunks) {
//      const tickets = await expo.sendPushNotificationsAsync(chunk);
//      // Handle tickets...
//    }
