import { Platform } from 'react-native';
import { z } from 'zod';
import SafeAsyncStorage from '../lib/SafeAsyncStorage';

// API Configuration
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');

/**
 * Normalizes an image path from the backend into a full URL.
 * Handles both full URLs (like Cloudinary) and relative paths (legacy local storage).
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path || path.trim() === "") {
    // Default placeholder for missing images
    return "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500";
  }

  // If it's already an absolute URL (Cloudinary, S3, etc.), return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Ensure we don't duplicate slashes
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};
const SESSION_EXPIRED_KEY = 'SESSION_EXPIRED';

const APP_ALLOWED_ROLE = 'participant';
const APP_ROLE_RESTRICTED_ERROR = {
  title: 'This app is only available for participant accounts. Please use the organizer or admin platform for this account.',
  status: 403,
  code: 'APP_ROLE_NOT_ALLOWED',
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    title: string;
    status: number;
    traceId?: string;
    code?: string;
  };
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    profile: {
      displayName: string;
      avatarUrl: string | null;
      locale: string;
      bio: string | null;
      location: string | null;
    };
    settings?: {
      notifications?: {
        push: boolean;
        inApp: boolean;
        email: boolean;
      };
    };
    organizer?: {
      status: string;
      businessName: string;
      bio?: string;
      websiteUrl?: string;
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
  } | null;
  emailVerificationRequired?: boolean;
}

// Request Schemas (matching backend)
const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(120).trim(),
  role: z.enum(['participant', 'organizer']),
  phone: z.string().trim().min(6).max(32).optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().trim().min(6).max(32).optional(),
  password: z.string().min(1).max(128),
}).refine((data) => Boolean(data.email) || Boolean(data.phone), {
  message: "Either email or phone is required",
});

const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().trim().min(6).max(32).optional(),
}).refine((data) => Boolean(data.email) || Boolean(data.phone), {
  message: "Either email or phone is required",
});

const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().trim().min(6).max(32).optional(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
}).refine((data) => Boolean(data.email) || Boolean(data.phone), {
  message: "Either email or phone is required",
});

const resetPasswordSchema = z.object({
  verificationToken: z.string().min(6).optional(),
  newPassword: z.string().min(6).max(128),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().optional(),
  code: z.string().regex(/^\d{6}$/).optional(),
}).refine((data) => {
  // Either verificationToken OR (code AND (email OR phone)) must be provided
  if (data.verificationToken) return true;
  if (data.code && (data.email || data.phone)) return true;
  return false;
}, {
  message: "Either verificationToken or (code with email/phone) is required",
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1).max(128).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: z.string().min(6).max(128),
}).refine((data) => data.oldPassword || data.currentPassword, {
  message: "Either oldPassword or currentPassword is required",
});

const verifyEmailSchema = z.union([
  z.object({
    email: z.string().email().toLowerCase().trim(),
    code: z.string().regex(/^\d{6}$/),
  }),
  z.object({
    verificationToken: z.string().min(10),
  }),
]);

// Export types
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

export interface CalendarEvent {
  _id: string;
  id?: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

export interface UserStats {
  activity: Array<{ label: string; value: number }>;
  totalPoints: number;
  winRate: number;
  thisWeekCount: number;
  lastWeekCount: number;
  percentageChange: number;
  monthlyGoal: number;
  monthlyProgress: number;
  achievements: Array<{ title: string; description: string; icon: string; color: string }>;
}

export interface Contest {
  _id: string;
  title: string;
  type: string;
  status: string;
  startsAt: string;
  endsAt: string;
  prizeDescription?: string;
  coverImageUrl?: string;
  stats?: {
    participantCount?: number;
    submissionCount?: number;
  };
}

const isParticipantAppUser = (user?: AuthResponse['user'] | null): boolean =>
  user?.role === APP_ALLOWED_ROLE;

export type ReportReason = 'inappropriate' | 'spam' | 'fraud' | 'copyright' | 'other';
export type ReportTargetType = 'CONTEST' | 'USER' | 'SUBMISSION' | 'VOTE';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export interface ReportItem {
  id: string;
  category: 'Contest' | 'User' | 'Submission' | 'Vote' | 'Other';
  title: string;
  reportedBy: string;
  target: string;
  reason: string;
  date: string;
  status: 'New' | 'Reviewed' | 'Dismissed';
  adminNote?: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

const reportReasonSchema = z.enum(['inappropriate', 'spam', 'fraud', 'copyright', 'other']);
const createReportSchema = z.object({
  targetType: z.enum(['CONTEST', 'USER', 'SUBMISSION', 'VOTE']),
  targetId: z.string().trim().min(1),
  reason: reportReasonSchema,
  description: z.string().trim().max(2000).optional(),
});

const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
});

// HTTP Client with token management
class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async parseResponseBody(response: Response): Promise<any> {
    const rawBody = await response.text();

    if (!rawBody) {
      return undefined;
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  private async handleResponse<T>(
    response: Response,
    requestContext: { url: string; method: string; body?: any; canRetry: boolean }
  ): Promise<ApiResponse<T>> {
    const data = await this.parseResponseBody(response);

    if (!response.ok) {
      // Handle token refresh for 401 errors
      if (requestContext.canRetry && response.status === 401 && !response.url.includes('/auth/refresh')) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          return this.rawFetch<T>(requestContext.url, requestContext.method, requestContext.body, false);
        }
      }

      // Backend returns error in different formats:
      // 1. { error: { title, status } }
      // 2. { title, status, code, type } - direct error response
      const error = data?.error || (data?.title ? {
        title: data.title,
        status: data.status || response.status,
        code: data.code
      } : {
        title: 'Request failed',
        status: response.status
      });

      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      data,
    };
  }

  // Core fetch — always passes method + body explicitly (no Request object spreading)
  private async rawFetch<T>(
    path: string,
    method: string,
    body?: any,
    retryOnUnauthorized = true,
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.baseURL) {
        return {
          success: false,
          error: {
            title: 'API URL is not configured. Set EXPO_PUBLIC_API_URL for this build.',
            status: 500,
          },
        };
      }

      const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      return await this.handleResponse<T>(
        response,
        { url, method, body, canRetry: retryOnUnauthorized }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          title: 'Network error',
          status: 0,
        },
      };
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(url, 'GET');
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(url, 'POST', data);
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(url, 'PUT', data);
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(url, 'PATCH', data);
  }

  // kept for backward compat — was using Request objects before
  async request<T>(req: { url: string; method?: string; body?: any }): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(req.url, req.method ?? 'GET', req.body);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.rawFetch<T>(url, 'DELETE');
  }

  // Token Management
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      if (accessToken) {
        await SafeAsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      if (refreshToken) {
        await SafeAsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      // Force flush to ensure tokens are immediately available
      await SafeAsyncStorage.flush();
    } catch (error) {
      console.log('Error setting tokens:', error);
    }
  }

  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      if (!SafeAsyncStorage) {
        return { accessToken: null, refreshToken: null };
      }

      const [accessToken, refreshToken] = await Promise.all([
        SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        SafeAsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log('Error getting tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.log('Error clearing tokens:', error);
    }
  }

  public async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefreshToken(): Promise<boolean> {
    try {
      const { refreshToken } = await this.getTokens();

      if (!refreshToken) {
        return false;
      }

      // Use raw fetch without Authorization header to avoid sending expired token
      const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await this.parseResponseBody(response);

      if (!response.ok) {
        // If refresh token is invalid/expired, clear auth and return false
        if (data?.code === 'INVALID_REFRESH' || response.status === 401) {
          await this.clearTokens();
          // Store a flag that user needs to re-login
          await SafeAsyncStorage.setItem(SESSION_EXPIRED_KEY, 'true');
        }

        return false;
      }

      // Backend returns { tokens: { accessToken, refreshToken } } or { accessToken, refreshToken }
      const tokens = data.tokens || data;
      if (tokens.accessToken && tokens.refreshToken) {
        await this.setTokens(tokens.accessToken, tokens.refreshToken);
        await SafeAsyncStorage.removeItem(SESSION_EXPIRED_KEY);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Token refresh error:', error);
      return false;
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Authentication API Service
export const authApi = {
  // Register new user
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const validatedData = registerSchema.parse(data);
    const response = await apiClient.post<AuthResponse>('/v1/auth/register', validatedData);

    if (response.success && response.data) {
      if (!isParticipantAppUser(response.data.user)) {
        await apiClient.clearTokens();
        return {
          success: false,
          error: APP_ROLE_RESTRICTED_ERROR,
        };
      }

      // Only set tokens if they exist (email verification not required)
      if (response.data.tokens) {
        await apiClient.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      }
      // Normalize avatar URL
      if (response.data.user?.profile) {
        response.data.user.profile.avatarUrl = getImageUrl(response.data.user.profile.avatarUrl);
      }
      // Always save user data (needed for verification screen)
      await SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }

    return response;
  },

  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const validatedData = loginSchema.parse(data);
    const response = await apiClient.post<AuthResponse>('/v1/auth/login', validatedData);

    if (response.success && response.data) {
      if (!isParticipantAppUser(response.data.user)) {
        await apiClient.clearTokens();
        return {
          success: false,
          error: APP_ROLE_RESTRICTED_ERROR,
        };
      }

      if (!response.data.tokens?.accessToken || !response.data.tokens?.refreshToken) {
        await apiClient.clearTokens();
        return {
          success: false,
          error: { title: 'Login succeeded but no auth tokens were returned', status: 500 },
        };
      }

      // Store tokens
      await apiClient.setTokens(response.data.tokens?.accessToken || '', response.data.tokens?.refreshToken || '');

      // Normalize avatar URL
      if (response.data.user?.profile) {
        response.data.user.profile.avatarUrl = getImageUrl(response.data.user.profile.avatarUrl);
      }

      await SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));

      // Force flush to ensure data persists
      await SafeAsyncStorage.flush();

      // Clear session expired flag on successful login
      await SafeAsyncStorage.removeItem(SESSION_EXPIRED_KEY);
    }

    return response;
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>('/v1/auth/resend-verification', { email });
    return response;
  },

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    try {
      const { refreshToken } = await apiClient.getTokens();

      if (!refreshToken) {
        await apiClient.clearTokens();
        return { success: true };
      }

      const response = await apiClient.post<void>('/v1/auth/logout', { refreshToken });
      await apiClient.clearTokens();
      return response.success ? response : { success: true };
    } catch (error: any) {
      await apiClient.clearTokens();
      return {
        success: false,
        error: error.response?.data || { title: "Logout failed", status: 500 },
      };
    }
  },

  async deleteAccount(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>('/v1/me');
      await apiClient.clearTokens();
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || { title: "Deletion failed", status: 500 },
      };
    }
  },

  async updateMe(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch<any>('/v1/me', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || { title: "Update failed", status: 500 },
      };
    }
  },

  // Refresh tokens - note: this uses raw fetch to avoid sending expired access token
  async refreshTokens(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const didRefresh = await apiClient.refreshToken();

    if (!didRefresh) {
      return {
        success: false,
        error: { title: 'Token refresh failed', status: 401 },
      };
    }

    const tokens = await apiClient.getTokens();
    if (!tokens.accessToken || !tokens.refreshToken) {
      return {
        success: false,
        error: { title: 'Token refresh completed without valid tokens', status: 500 },
      };
    }

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    const validatedData = forgotPasswordSchema.parse(data);
    return apiClient.post<void>('/v1/auth/forgot-password', validatedData);
  },

  // Verify OTP
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<void>> {
    const validatedData = verifyOtpSchema.parse(data);
    return apiClient.post<void>('/v1/auth/verify-otp', validatedData);
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    const validatedData = resetPasswordSchema.parse(data);
    return apiClient.post<void>('/v1/auth/reset-password', validatedData);
  },

  // Verify email
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<void>> {
    const validatedData = verifyEmailSchema.parse(data);
    return apiClient.post<void>('/v1/auth/verify-email', validatedData);
  },

  // Change password (authenticated) - Profile section
  // Uses new endpoint: POST /v1/me/password
  async changePassword(data: { oldPassword?: string; newPassword?: string; currentPassword?: string }): Promise<ApiResponse<void>> {
    const password = data.oldPassword || data.currentPassword;
    if (!password || !data.newPassword) {
      return {
        success: false,
        error: { title: 'Missing fields', status: 400 },
      };
    }

    // New endpoint for profile password change
    const payload = {
      oldPassword: password,
      newPassword: data.newPassword,
    };

    return apiClient.post<void>('/v1/me/password', payload);
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    const response = await apiClient.get<AuthResponse['user']>('/v1/auth/me');

    if (response.success && response.data) {
      if (!isParticipantAppUser(response.data)) {
        await apiClient.clearTokens();
        return {
          success: false,
          error: APP_ROLE_RESTRICTED_ERROR,
        };
      }

      // Normalize avatar URL
      if (response.data.profile) {
        response.data.profile.avatarUrl = getImageUrl(response.data.profile.avatarUrl);
      }
    }

    return response;
  },

  async createReport(data: CreateReportRequest): Promise<ApiResponse<ReportItem>> {
    const validatedData = createReportSchema.parse({
      ...data,
      description: data.description?.trim() || undefined,
    });
    const response = await apiClient.post<{
      success: boolean;
      data: ReportItem;
      message?: string;
    }>('/v1/reports', validatedData);

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    if (!response.data) {
      return {
        success: false,
        error: {
          title: 'Invalid report response',
          status: 500,
        },
      };
    }

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  },

  async createSupportTicket(data: CreateSupportTicketRequest): Promise<ApiResponse<any>> {
    const validatedData = createSupportTicketSchema.parse({
      ...data,
      subject: data.subject.trim(),
      message: data.message.trim(),
      priority: data.priority ?? 'low',
    });

    return apiClient.post<any>('/v1/support/tickets', validatedData);
  },

  // Update user profile (name, phone, bio, location, locale)
  // Backend endpoint: PATCH /v1/me
  // Backend returns: { success: true, data: userObject } - user directly in data
  async updateProfile(data: {
    displayName?: string;
    phone?: string;
    bio?: string;
    location?: string;
    locale?: string;
    avatarUrl?: string;
  }): Promise<ApiResponse<AuthResponse['user']>> {
    console.log('API: Updating profile with data:', data);
    console.log('API: Using endpoint: PATCH /v1/me');

    try {
      const response = await apiClient.patch<AuthResponse['user']>('/v1/me', data);

      if (response.success && response.data) {
        // Normalize avatar URL in response
        if (response.data.profile) {
          response.data.profile.avatarUrl = getImageUrl(response.data.profile.avatarUrl);
        }
      }

      console.log('API: Profile update response:', response);
      return response;
    } catch (error) {
      console.log('API: Profile update error:', error);
      return {
        success: false,
        error: { title: 'Failed to update profile', status: 500 },
      };
    }
  },


  // Get user's activities
  // Backend endpoint: GET /v1/me/activities
  // Backend returns: { items: [...], nextCursor: null } instead of direct array
  async getMyActivities(): Promise<ApiResponse<{
    items: Array<{
      id: string;
      contestId: string;
      contestTitle: string;
      reward: string;
      endDate: string;
      participantCount: number;
      status: 'active' | 'submitted' | 'in_progress' | 'completed';
      coverImageUrl?: string;
    }>, nextCursor?: string | null
  }>> {
    try {
      console.log('API: Fetching my activities');
      // Fetch raw MongoDB data from backend
      const response = await apiClient.get<{
        items: Array<{
          _id: string;
          contestId: string;
          contestTitle: string;
          prizeDescription: string;
          endsAt: string;
          stats?: { participantCount?: number };
          status: 'active' | 'submitted' | 'in_progress' | 'completed';
          coverImageUrl?: string;
        }>, nextCursor?: string | null
      }>('/v1/me/activities');

      // Transform MongoDB data to frontend format
      if (response.success && response.data?.items) {
        const transformedItems = response.data.items.map(item => ({
          id: item._id?.toString() || '',
          contestId: item.contestId?.toString() || '',
          contestTitle: item.contestTitle,
          reward: item.prizeDescription || '',
          endDate: item.endsAt,
          participantCount: item.stats?.participantCount || 0,
          status: item.status,
          coverImageUrl: getImageUrl(item.coverImageUrl),
        }));

        return {
          success: true,
          data: {
            items: transformedItems,
            nextCursor: response.data.nextCursor,
          },
        };
      }

      // Return error or empty response with correct type
      if (!response.success) {
        return {
          success: false,
          error: response.error || { title: 'Failed to fetch activities', status: 500 },
        };
      }

      return {
        success: true,
        data: { items: [], nextCursor: null },
      };
    } catch (error) {
      console.log('API: Error fetching activities:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch activities', status: 500 },
      };
    }
  },

  // Get contest by ID
  // Backend endpoint: GET /v1/contests/:id
  // Public endpoint - no auth required
  async getContestById(contestId: string): Promise<ApiResponse<{
    id: string;
    title: string;
    description: string;
    rules: string;
    reward: string;
    coverImageUrl: string;
    startDate: string;
    endDate: string;
    status: string;
    category: string;
    participantCount: number;
    submissionCount: number;
    isActive: boolean;
    organizer?: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    };
    pollOptions?: Array<{
      id: string;
      label: string;
      voteCount: number;
    }>;
    tasks?: Array<{
      id: string;
      taskType: string;
      label: string;
      required: boolean;
    }>;
  }>> {
    try {
      console.log('API: Fetching contest by ID:', contestId);

      // Fetch raw MongoDB data from backend
      const response = await apiClient.get<{
        _id: string;
        title: string;
        description: string;
        rules: string;
        prizeDescription: string;
        coverImageUrl: string;
        startsAt: string;
        endsAt: string;
        status: string;
        type: string;
        stats?: {
          participantCount?: number;
          submissionCount?: number;
        };
        organizerId?: string;
        pollOptions?: Array<{
          _id: string;
          label: string;
          voteCount: number;
        }>;
        tasks?: Array<{
          _id: string;
          taskType: string;
          label: string;
          required: boolean;
        }>;
      }>(`/v1/contests/${contestId}`);

      // Transform MongoDB data to frontend format
      if (response.success && response.data) {
        const item = response.data;

        return {
          success: true,
          data: {
            id: item._id?.toString() || '',
            title: item.title,
            description: item.description || '',
            rules: item.rules || '',
            reward: item.prizeDescription || '',
            coverImageUrl: getImageUrl(item.coverImageUrl),
            startDate: item.startsAt,
            endDate: item.endsAt,
            status: item.status,
            category: item.type || 'Contest',
            participantCount: item.stats?.participantCount || 0,
            submissionCount: item.stats?.submissionCount || 0,
            isActive: item.status === 'active',
            pollOptions: item.pollOptions?.map(p => ({
              id: p._id?.toString() || '',
              label: p.label,
              voteCount: p.voteCount || 0,
            })),
            tasks: item.tasks?.map(t => ({
              id: t._id?.toString() || '',
              taskType: t.taskType,
              label: t.label,
              required: t.required ?? true,
            })),
          },
        };
      }

      return {
        success: false,
        error: response.error || { title: 'Failed to fetch contest details', status: 500 },
      };
    } catch (error) {
      console.log('API: Error fetching contest by ID:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch contest details', status: 500 },
      };
    }
  },

  // Upload avatar image
  // Uses new backend endpoint: POST /v1/upload/avatar
  // Handles token refresh on 401 errors
  async uploadAvatar(imageUri: string): Promise<ApiResponse<{ avatarUrl: string }>> {
    // Use apiClient's protected method for token refresh

    const attemptUpload = async (token: string | null): Promise<ApiResponse<{ avatarUrl: string }>> => {
      return new Promise((resolve) => {
        // Ensure proper file URI format for React Native
        let fileUri = imageUri;
        if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
          fileUri = `file://${imageUri}`;
        }

        // Get filename and create form data
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.\w+$/.exec(filename);
        const type = match ? `image/${match[0].substring(1)}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('avatar', {
          uri: fileUri,
          name: filename,
          type,
        } as any);

        const uploadUrl = `${API_BASE_URL}/v1/upload/avatar`;

        const xhr = new XMLHttpRequest();

        xhr.onload = () => {
          console.log('API: Upload response status:', xhr.status);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ success: true, data });
            } catch (e) {
              resolve({
                success: false,
                error: { title: 'Invalid server response', status: xhr.status },
              });
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              resolve({
                success: false,
                error: errorData.error || { title: errorData.message || 'Upload failed', status: xhr.status },
              });
            } catch (e) {
              resolve({
                success: false,
                error: { title: `Upload failed: ${xhr.statusText || 'Unknown error'}`, status: xhr.status },
              });
            }
          }
        };

        xhr.onerror = () => {
          resolve({
            success: false,
            error: { title: 'Network error - check server connection', status: 0 },
          });
        };

        xhr.timeout = 30000;
        xhr.ontimeout = () => {
          resolve({
            success: false,
            error: { title: 'Upload timeout - server may be slow', status: 0 },
          });
        };

        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token || ''}`);
        xhr.send(formData);
      });
    };

    try {
      console.log('API: Uploading avatar to backend:', imageUri);

      // Get current token
      let token = await SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      console.log('API: Token exists:', !!token);

      // First attempt
      let response = await attemptUpload(token);

      // If 401, try to refresh token and retry once
      if (!response.success && response.error?.status === 401) {
        console.log('API: Got 401, attempting token refresh...');
        const refreshSuccess = await apiClient.refreshToken();

        if (refreshSuccess) {
          console.log('API: Token refreshed, retrying upload...');
          token = await SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          response = await attemptUpload(token);
        } else {
          console.log('API: Token refresh failed');
        }
      }

      return response;
    } catch (error: any) {
      console.log('API: Avatar upload error:', error);
      return {
        success: false,
        error: { title: `Network error: ${error.message || 'Unknown error'}`, status: 0 },
      };
    }
  },

  // Create submission/entry for a contest
  // Backend endpoint: POST /v1/contests/:id/submissions
  // Requires authentication
  async createSubmission(
    contestId: string,
    data: {
      taskCompletions?: Array<{
        taskId: string;
        completed: boolean;
        proofUrl?: string;
      }>;
      bodyText?: string;
      mediaUrls?: string[];
    }
  ): Promise<ApiResponse<{
    _id: string;
    contestId: string;
    userId: string;
    status: string;
    bodyText?: string;
    mediaUrls: string[];
    taskCompletions: Array<{
      taskId: string;
      completed: boolean;
      proofUrl?: string;
    }>;
    createdAt: string;
  }>> {
    try {
      console.log('API: Creating submission for contest:', contestId);
      console.log('API: Submission data:', JSON.stringify(data, null, 2));

      const response = await apiClient.post<{
        _id: string;
        contestId: string;
        userId: string;
        status: string;
        bodyText?: string;
        mediaUrls: string[];
        taskCompletions: Array<{
          taskId: string;
          completed: boolean;
          proofUrl?: string;
        }>;
        createdAt: string;
      }>(`/v1/contests/${contestId}/submissions`, data);

      console.log('API: Submission response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.log('API: Error creating submission:', error);
      console.log('API: Error response:', error?.response?.data);
      return {
        success: false,
        error: { title: error?.response?.data?.message || 'Failed to submit entry', status: error?.response?.status || 500 },
      };
    }
  },

  // Get contest details with tasks for entry form
  // Backend endpoint: GET /v1/contests/:id
  // Public endpoint - no auth required
  async getContestWithTasks(contestId: string): Promise<ApiResponse<{
    id: string;
    title: string;
    description: string;
    reward: string;
    coverImageUrl: string;
    endDate: string;
    tasks: Array<{
      id: string;
      taskType: string;
      label: string;
      required: boolean;
    }>;
  }>> {
    try {
      console.log('API: Fetching contest with tasks:', contestId);
      const response = await apiClient.get<{
        _id: string;
        title: string;
        description: string;
        prizeDescription: string;
        coverImageUrl: string;
        endsAt: string;
        tasks?: Array<{
          _id: string;
          taskType: string;
          label: string;
          required: boolean;
        }>;
      }>(`/v1/contests/${contestId}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            id: response.data._id?.toString() || '',
            title: response.data.title,
            description: response.data.description || '',
            reward: response.data.prizeDescription || '',
            coverImageUrl: getImageUrl(response.data.coverImageUrl),
            endDate: response.data.endsAt,
            tasks: response.data.tasks?.map(t => ({
              id: t._id?.toString() || '',
              taskType: t.taskType,
              label: t.label,
              required: t.required ?? true,
            })) || [],
          },
        };
      }

      return {
        success: false,
        error: response.error || { title: 'Failed to fetch contest', status: 500 },
      };
    } catch (error) {
      console.log('API: Error fetching contest with tasks:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch contest', status: 500 },
      };
    }
  },

  // Get my submissions
  // Backend endpoint: GET /v1/me/submissions
  // Backend returns: { items: Submission[], nextCursor: string | null }
  async getMySubmissions(): Promise<ApiResponse<{
    items: Array<{
      _id: string;
      contestId: {
        _id: string;
        title: string;
        description?: string;
        coverImageUrl?: string;
        status?: string;
        prizeDescription?: string;
        stats?: {
          participantCount?: number;
          submissionCount?: number;
        };
      };
      status: 'pending' | 'approved' | 'rejected';
      bodyText?: string;
      mediaUrls: string[];
      createdAt: string;
    }>;
    nextCursor?: string | null;
  }>> {
    try {
      console.log('API: Fetching my submissions');
      const response = await apiClient.get<{
        items: Array<{
          _id: string;
          contestId: {
            _id: string;
            title: string;
            description?: string;
            coverImageUrl?: string;
            status?: string;
            prizeDescription?: string;
            stats?: {
              participantCount?: number;
              submissionCount?: number;
            };
          };
          status: 'pending' | 'approved' | 'rejected';
          bodyText?: string;
          mediaUrls: string[];
          createdAt: string;
        }>;
        nextCursor?: string | null;
      }>('/v1/me/submissions');
      console.log('API: My submissions response:', response);

      if (response.success && response.data?.items) {
        response.data.items.forEach(item => {
          if (item.contestId) {
            item.contestId.coverImageUrl = getImageUrl(item.contestId.coverImageUrl);
          }
        });
      }

      return response;
    } catch (error: any) {
      console.log('API: Error fetching my submissions:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch submissions', status: error?.response?.status || 500 },
      };
    }
  },

  // Get calendar events
  // Backend endpoint: GET /v1/contests/calendar
  async getCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      console.log('API: Fetching calendar events');
      return await apiClient.get<CalendarEvent[]>('/v1/contests/calendar');
    } catch (error) {
      console.log('API: Error fetching calendar events:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch calendar events', status: 500 },
      };
    }
  },

  // Get user analytics/stats
  // Backend endpoint: GET /v1/me/stats
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      console.log('API: Fetching user stats');
      return await apiClient.get<UserStats>('/v1/me/stats');
    } catch (error) {
      console.log('API: Error fetching user stats:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch analytics', status: 500 },
      };
    }
  },

  // Get tokens from storage
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    return apiClient.getTokens();
  },

  // Get trending/featured contests
  async getTrendingContests(limit = 10): Promise<ApiResponse<{ items: Contest[] }>> {
    try {
      console.log('API: Fetching trending contests');
      const response = await apiClient.get<{ items: Contest[] }>(`/v1/contests/trending?limit=${limit}`);
      if (response.success && response.data?.items) {
        response.data.items.forEach(c => c.coverImageUrl = getImageUrl(c.coverImageUrl));
      }
      return response;
    } catch (error) {
      console.log('API: Error fetching trending contests:', error);
      return { success: false, error: { title: 'Failed to fetch trending contests', status: 500 } };
    }
  },

  // Get nearby contests
  async getNearbyContests(lat: number, lng: number, radiusKm = 50): Promise<ApiResponse<{ items: Contest[] }>> {
    try {
      console.log(`API: Fetching nearby contests (lat: ${lat}, lng: ${lng})`);
      const response = await apiClient.get<{ items: Contest[] }>(`/v1/contests/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
      if (response.success && response.data?.items) {
        response.data.items.forEach(c => c.coverImageUrl = getImageUrl(c.coverImageUrl));
      }
      return response;
    } catch (error) {
      console.log('API: Error fetching nearby contests:', error);
      return { success: false, error: { title: 'Failed to fetch nearby contests', status: 500 } };
    }
  },

  // Get all contests
  async getContests(limit = 20): Promise<ApiResponse<{ items: Contest[] }>> {
    try {
      console.log('API: Fetching all contests');
      const response = await apiClient.get<{ items: Contest[] }>(`/v1/contests?status=active&limit=${limit}`);
      if (response.success && response.data?.items) {
        response.data.items.forEach(c => c.coverImageUrl = getImageUrl(c.coverImageUrl));
      }
      return response;
    } catch (error) {
      console.log('API: Error fetching contests:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch contests', status: 500 },
      };
    }
  },

  // Get all contestants for public display
  async getContestants(limit = 50): Promise<ApiResponse<{ items: any[] }>> {
    try {
      console.log('API: Fetching contestants');
      const response = await apiClient.get<{ items: any[] }>(`/v1/contestants?limit=${limit}`);
      return response;
    } catch (error) {
      console.log('API: Error fetching contestants:', error);
      return {
        success: false,
        error: { title: 'Failed to fetch contestants', status: 500 },
      };
    }
  },

  // Submit vote for a contestant
  // Backend endpoint: POST /v1/submissions/:id/vote
  async submitVote(submissionId: string): Promise<ApiResponse<{ voteCount: number }>> {
    try {
      console.log('API: Submitting vote for submission:', submissionId);
      const response = await apiClient.post<{ voteCount: number }>(`/v1/submissions/${submissionId}/vote`);
      return response;
    } catch (error: any) {
      console.log('API: Error submitting vote:', error);
      return {
        success: false,
        error: error?.response?.data?.error || { title: 'Failed to submit vote', status: 500 },
      };
    }
  },

  // Vote on a contest
  // Backend endpoint: POST /v1/contests/:id/vote
  async voteOnContest(contestId: string): Promise<ApiResponse<{ voteCount: number; hasVoted: boolean }>> {
    try {
      console.log('API: Submitting vote for contest:', contestId);
      const response = await apiClient.post<{ voteCount: number; hasVoted: boolean }>(`/v1/contests/${contestId}/vote`);
      return response;
    } catch (error: any) {
      console.log('API: Error submitting vote for contest:', error);
      return {
        success: false,
        error: error?.response?.data?.error || { title: 'Failed to submit vote', status: 500 },
      };
    }
  },

  // Get vote counts for multiple contests
  // Backend endpoint: POST /v1/contests/vote-counts
  async getVoteCounts(contestIds: string[]): Promise<ApiResponse<{ voteCounts: Record<string, number> }>> {
    try {
      console.log('API: Fetching vote counts for contests:', contestIds);
      const response = await apiClient.post<{ voteCounts: Record<string, number> }>('/v1/contests/vote-counts', { contestIds });
      return response;
    } catch (error: any) {
      console.log('API: Error fetching vote counts:', error);
      return {
        success: false,
        error: error?.response?.data?.error || { title: 'Failed to fetch vote counts', status: 500 },
      };
    }
  },

  // Get current user's vote statuses for multiple contests
  // Backend endpoint: POST /v1/contests/vote-statuses
  async getVoteStatuses(contestIds: string[]): Promise<ApiResponse<{ voteStatuses: Record<string, boolean> }>> {
    try {
      console.log('API: Fetching vote statuses for contests:', contestIds);
      const response = await apiClient.post<{ voteStatuses: Record<string, boolean> }>('/v1/contests/vote-statuses', { contestIds });
      return response;
    } catch (error: any) {
      console.log('API: Error fetching vote statuses:', error);
      return {
        success: false,
        error: error?.response?.data?.error || { title: 'Failed to fetch vote statuses', status: 500 },
      };
    }
  },

  // Social Login (Google OAuth)
  // Backend endpoint: POST /v1/auth/social
  async socialLogin(provider: 'google' | 'apple', token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('API: Social login with provider:', provider);
      const response = await apiClient.post<AuthResponse>('/v1/auth/social', {
        provider,
        token,
      });

      if (response.success && response.data) {
        if (!isParticipantAppUser(response.data.user)) {
          await apiClient.clearTokens();
          return {
            success: false,
            error: APP_ROLE_RESTRICTED_ERROR,
          };
        }

        if (!response.data.tokens?.accessToken || !response.data.tokens?.refreshToken) {
          await apiClient.clearTokens();
          return {
            success: false,
            error: { title: 'Social login succeeded but no auth tokens were returned', status: 500 },
          };
        }

        // Store tokens
        if (response.data.tokens) {
          await apiClient.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        }

        // Normalize avatar URL
        if (response.data.user?.profile) {
          response.data.user.profile.avatarUrl = getImageUrl(response.data.user.profile.avatarUrl);
        }

        // Save user data
        await SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));

        // Clear session expired flag
        await SafeAsyncStorage.removeItem('SESSION_EXPIRED');
      }

      return response;
    } catch (error: any) {
      console.log('API: Error in social login:', error);
      return {
        success: false,
        error: error?.response?.data?.error || { title: 'Social login failed', status: 500 },
      };
    }
  },
};

// Contest API Service
// Note: Contest methods are currently part of authApi, exporting references for clean imports
export const contestApi = {
  getContestById: authApi.getContestById,
  getContests: authApi.getContests,
  getTrendingContests: authApi.getTrendingContests,
  getNearbyContests: authApi.getNearbyContests,
  getContestWithTasks: authApi.getContestWithTasks,
  createSubmission: authApi.createSubmission,
  getCalendarEvents: authApi.getCalendarEvents,
  submitVote: authApi.submitVote,
  getContestants: authApi.getContestants,
};
