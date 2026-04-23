import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

export function useGoogleAuthNative() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    if (GOOGLE_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID,
        iosClientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : undefined,
        offlineAccess: false,
        scopes: ['openid', 'email', 'profile'],
      });
      setIsInitialized(true);
    }
  }, []);

  const signIn = async (): Promise<string | null> => {
    if (!isInitialized) {
      throw new Error('Google Sign-In not initialized');
    }

    setIsLoading(true);

    try {
      // Check if play services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Clear cached Google session so the native account chooser always opens.
      await GoogleSignin.signOut().catch(() => undefined);

      // Open the native Google account chooser.
      const signInResult = await GoogleSignin.signIn();
      const idTokenFromSignIn =
        signInResult.type === 'success' ? signInResult.data.idToken : null;

      if (idTokenFromSignIn) {
        return idTokenFromSignIn;
      }

      // Fallback for environments where token retrieval is exposed separately.
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        throw new Error('Google Sign-In did not return an ID token');
      }

      return tokens.idToken;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('User cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error(error.message || 'Google sign-in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.log('Google sign out error:', error);
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
    isInitialized,
    isValidClientId: !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com'),
  };
}
