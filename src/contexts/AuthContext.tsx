import { router } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import SafeAsyncStorage from '../lib/SafeAsyncStorage';
import { authApi, type ApiResponse, type AuthResponse, type RegisterRequest } from '../services/api';

// Event names for cross-screen communication
export const AUTH_EVENTS = {
  USER_UPDATED: 'auth:user_updated',
  PROFILE_CHANGED: 'auth:profile_changed',
  AVATAR_UPDATED: 'auth:avatar_updated',
} as const;

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};
const SESSION_EXPIRED_KEY = 'SESSION_EXPIRED';

const APP_ALLOWED_ROLE = 'participant';

// Auth Context Types
interface AuthContextType {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
  register: (data: RegisterRequest) => Promise<ApiResponse<AuthResponse>>;
  socialLogin: (provider: 'google' | 'apple', token: string) => Promise<ApiResponse<AuthResponse>>;
  resetPassword: (tokenOrCode: string, newPassword: string, email?: string, code?: string) => Promise<ApiResponse<void>>;
  forgotPassword: (emailOrPhone: string) => Promise<ApiResponse<void>>;
  verifyOtp: (email: string, code: string) => Promise<ApiResponse<void>>;
  verifyEmail: (data: {
    email?: string;
    code?: string;
    verificationToken?: string;
  }) => Promise<ApiResponse<void>>;
  resendVerificationEmail: (email: string) => Promise<ApiResponse<void>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (data: {
    oldPassword?: string;
    currentPassword?: string;
    newPassword: string;
    token?: string;
  }) => Promise<ApiResponse<void>>;
  debugStorage: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
// SafeAsyncStorage is now exported from '../lib/SafeAsyncStorage'
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property
  const isAuthenticated = Boolean(user);

  const isAllowedAppUser = (candidate: AuthResponse['user'] | null | undefined) =>
    candidate?.role === APP_ALLOWED_ROLE;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if session was marked as expired
      const sessionExpired = await SafeAsyncStorage.getItem(SESSION_EXPIRED_KEY);
      if (sessionExpired === 'true') {
        await clearAuthData();
        await SafeAsyncStorage.removeItem(SESSION_EXPIRED_KEY);
        setIsLoading(false);
        return;
      }

      // Check for stored user data and tokens
      const [userData, accessToken, refreshToken] = await Promise.all([
        SafeAsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        SafeAsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (userData && accessToken) {
        // Restore user from storage immediately - this ensures user stays logged in
        const parsedUser = JSON.parse(userData);
        if (!isAllowedAppUser(parsedUser)) {
          await clearAuthData();
          setIsLoading(false);
          return;
        }
        setUser(parsedUser);

        // Background: try to refresh user data and validate token
        authApi.getCurrentUser().then(response => {
          if (response.success && response.data) {
            setUser(response.data);
            SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
          } else if (response.error?.code === 'APP_ROLE_NOT_ALLOWED') {
            clearAuthData();
          }
        }).catch(() => undefined);
      } else if (refreshToken && !accessToken) {
        // No access token but have refresh token - try to refresh
        const refreshResponse = await authApi.refreshTokens();
        if (refreshResponse.success && refreshResponse.data) {
          // Refresh succeeded, now get user
          const userResponse = await authApi.getCurrentUser();
          if (userResponse.success && userResponse.data && isAllowedAppUser(userResponse.data)) {
            setUser(userResponse.data);
            await SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userResponse.data));
          } else {
            await clearAuthData();
          }
        } else {
          await clearAuthData();
        }
      }
    } catch (error) {
      console.log('Auth initialization error:', error);
      // Don't clear data on error - let user stay logged in with stored data
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await SafeAsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
    } catch (error) {
      console.log('Error clearing auth data:', error);
      // Still set user to null even if storage fails
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        if (response.data.tokens?.accessToken) {
          setUser(response.data.user);
        } else if (response.data.emailVerificationRequired) {
          await clearAuthData();
        } else {
          await clearAuthData();
          return {
            success: false,
            error: { title: 'Login did not return a valid session', status: 500 },
          };
        }
      }

      return response;
    } catch (error) {
      console.log('Login error:', error);
      return {
        success: false,
        error: { title: 'Login failed', status: 500 },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
    role: 'participant' | 'organizer';
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);

      if (response.success && response.data) {
        // Only auto-login if email verification is NOT required
        if (!response.data.emailVerificationRequired) {
          setUser(response.data.user);
        }
        // If email verification required, user stays logged out
        // Frontend will redirect to email verification screen
      }

      return response;
    } catch (error) {
      console.log('Register error:', error);
      return {
        success: false,
        error: { title: 'Registration failed', status: 500 },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple', token: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      setIsLoading(true);
      const response = await authApi.socialLogin(provider, token);

      if (response.success && response.data) {
        if (response.data.tokens?.accessToken) {
          setUser(response.data.user);
        } else {
          await clearAuthData();
          return {
            success: false,
            error: { title: 'Social login did not return a valid session', status: 500 },
          };
        }
      }

      return response;
    } catch (error) {
      console.log('Social login error:', error);
      return {
        success: false,
        error: { title: 'Social login failed', status: 500 },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await clearAuthData();
      // Navigate to login screen
      router.replace('/login');
    }
  };

  const forgotPassword = async (email: string): Promise<ApiResponse<void>> => {
    try {
      return await authApi.forgotPassword({ email });
    } catch (error) {
      console.log('Forgot password error:', error);
      return {
        success: false,
        error: { title: 'Failed to send reset email', status: 500 },
      };
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<ApiResponse<void>> => {
    try {
      return await authApi.verifyOtp({ email, code });
    } catch (error) {
      console.log('OTP verification error:', error);
      return {
        success: false,
        error: { title: 'OTP verification failed', status: 500 },
      };
    }
  };

  const resetPassword = async (
    tokenOrCode: string, 
    newPassword: string,
    email?: string,
    code?: string
  ): Promise<ApiResponse<void>> => {
    try {
      // If email and code provided, use OTP flow
      if (email && code) {
        return await authApi.resetPassword({
          newPassword,
          email,
          code,
        });
      }
      // Otherwise use JWT token flow
      return await authApi.resetPassword({
        verificationToken: tokenOrCode,
        newPassword,
      });
    } catch (error) {
      console.log('Reset password error:', error);
      return {
        success: false,
        error: { title: 'Password reset failed', status: 500 },
      };
    }
  };

  const verifyEmail = async (data: {
    email?: string;
    code?: string;
    verificationToken?: string;
  }): Promise<ApiResponse<void>> => {
    try {
      if (data.email && data.code) {
        const response = await authApi.verifyEmail({
          email: data.email,
          code: data.code
        });
        
        if (response.success) {
          Alert.alert(
            "Email Verified", 
            "Your email has been successfully verified!",
            [
              {
                text: "OK",
                onPress: () => router.replace("/login")
              }
            ]
          );
        } else {
          Alert.alert(
            "Verification Failed", 
            response.error?.title || "Invalid verification code"
          );
        }
        return response;
      } else {
        Alert.alert("Error", "Email and verification code are required");
        return {
          success: false,
          error: { title: 'Email and verification code are required', status: 400 },
        };
      }
    } catch (error) {
      console.log('Email verification error:', error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      return {
        success: false,
        error: { title: 'Verification failed', status: 500 },
      };
    }
  };

  const changePassword = async (data: {
    oldPassword?: string;
    currentPassword?: string;
    newPassword?: string;
    token?: string;
  }): Promise<ApiResponse<void>> => {
    try {
      const passwordToUse = data.oldPassword || data.currentPassword;
      if (passwordToUse && data.newPassword) {
        const response = await authApi.changePassword({
          oldPassword: passwordToUse,
          newPassword: data.newPassword,
        });
        
        if (response.success) {
          Alert.alert(
            "Password Changed", 
            "Your password has been successfully changed!",
            [
              {
                text: "OK",
                onPress: () => router.replace("/login")
              }
            ]
          );
        } else {
          Alert.alert(
            "Password Change Failed", 
            response.error?.title || "Failed to change password"
          );
        }
        return response;
      } else {
        Alert.alert("Error", "Current password and new password are required");
        return {
          success: false,
          error: { title: 'Current password and new password are required', status: 400 },
        };
      }
    } catch (error) {
      console.log('Change password error:', error);
      return {
        success: false,
        error: { title: 'Password change failed', status: 500 },
      };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<ApiResponse<void>> => {
    try {
      if (!email.trim()) {
        Alert.alert("Error", "Email is required for verification");
        return {
          success: false,
          error: { title: 'Email required', status: 400 },
        };
      }

      const response = await authApi.resendVerificationEmail(email.trim());
      
      if (response.success) {
        Alert.alert(
          "Verification Email Sent", 
          "A new verification code has been sent to your email!",
          [
            {
              text: "OK",
              onPress: () => {}
            }
          ]
        );
      } else {
        Alert.alert(
          "Failed to Send Verification Email", 
          response.error?.title || "Failed to send verification email"
        );
      }
      return response;
    } catch (error) {
      console.log('Resend verification email error:', error);
      return {
        success: false,
        error: { title: 'Failed to send verification email', status: 500 },
      };
    }
  };

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await authApi.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data);
        await SafeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      } else {
        if (response.error?.code === 'APP_ROLE_NOT_ALLOWED') {
          await clearAuthData();
        }
      }
    } catch (error) {
      console.log('[AuthContext] Refresh user error:', error);
    }
  }, []);

  const debugStorage = async () => {
    const [userData, accessToken, refreshToken] = await Promise.all([
      SafeAsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      SafeAsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      SafeAsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    console.log('Storage debug:', {
      userData: Boolean(userData),
      accessToken: Boolean(accessToken),
      refreshToken: Boolean(refreshToken),
    });
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    forgotPassword,
    verifyOtp,
    verifyEmail,
    resendVerificationEmail,
    logout,
    refreshUser,
    changePassword,
    resetPassword,
    debugStorage,
  }), [
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    forgotPassword,
    verifyOtp,
    verifyEmail,
    resendVerificationEmail,
    logout,
    refreshUser,
    changePassword,
    resetPassword,
    debugStorage,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      // You could return a loading spinner here
      return null;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
