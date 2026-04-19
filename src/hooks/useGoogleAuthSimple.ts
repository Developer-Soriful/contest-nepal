import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const GOOGLE_OAUTH_CALLBACK_URL =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
  `${API_BASE_URL}/auth/callback`;
const APP_REDIRECT_URI = 'contestnepal://auth/callback';

// PKCE helpers
const generateCodeVerifier = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < 128; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateCodeChallenge = (verifier: string) => {
  // Simple hash for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < verifier.length; i++) {
    const char = verifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return btoa(String(hash)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export function useGoogleAuthSimple() {
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Show actual config values
  console.log('=== Google OAuth Debug ===');
  console.log('Client ID:', GOOGLE_CLIENT_ID);
  console.log('OAuth Callback URL:', GOOGLE_OAUTH_CALLBACK_URL);
  console.log('App Redirect URI:', APP_REDIRECT_URI);
  console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);

  const signIn = async (): Promise<string | null> => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    if (!API_BASE_URL) {
      throw new Error('API URL not configured');
    }

    setIsLoading(true);
    const codeVerifier = generateCodeVerifier();
    const state = Math.random().toString(36).substring(2);
    const codeChallenge = codeVerifier; // For plain method, challenge = verifier

    console.log('Starting Google Sign-In...');
    console.log('State:', state);
    console.log('Code Challenge:', codeChallenge.substring(0, 20) + '...');

    try {
      // Build Google OAuth URL
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH_CALLBACK_URL,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'plain',
        access_type: 'offline',
        prompt: 'select_account',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Google returns to the backend callback, which immediately deep-links back into the app.
      const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_REDIRECT_URI);

      console.log('Browser result:', result);
      
      if (result.type === 'success' && result.url) {
        console.log('Returned URL:', result.url);
        
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        console.log('Parsed params:', { code: !!code, returnedState, error, errorDescription });

        if (error) {
          const errorMsg = `Error: ${error}\n\nDescription: ${errorDescription || 'None'}\n\nOAuth callback URL:\n${GOOGLE_OAUTH_CALLBACK_URL}`;
          Alert.alert('Google OAuth Error', errorMsg);
          throw new Error(`Google auth error: ${error} - ${errorDescription || 'No details'}`);
        }

        if (code && returnedState === state) {
          console.log('Success! Got authorization code');
          // Return code data for backend exchange
          return JSON.stringify({
            code,
            codeVerifier,
            redirectUri: GOOGLE_OAUTH_CALLBACK_URL,
          });
        } else if (!code) {
          throw new Error('No authorization code in response');
        } else {
          throw new Error('State mismatch - possible security issue');
        }
      } else if (result.type === 'cancel') {
        throw new Error('User cancelled');
      } else {
        throw new Error(`Auth failed: ${result.type}`);
      }

    } catch (error: any) {
      if (error.message?.includes('cancel')) {
        throw new Error('User cancelled');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    isValidClientId: !!GOOGLE_CLIENT_ID,
  };
}
