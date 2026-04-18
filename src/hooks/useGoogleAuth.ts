import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Complete any pending authentication session
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'contesthub',
  path: 'auth/google/callback',
});

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  // Generate PKCE code challenge
  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier
    );
    // Convert to base64url encoding
    return digest
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Generate random code verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    Crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(36).padStart(2, '0')).join('');
  };

  const signIn = async (): Promise<{ token: string | null; error: Error | null }> => {
    try {
      setIsLoading(true);

      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Build Google OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'id_token',
        scope: 'openid email profile',
        nonce: codeChallenge,
        prompt: 'select_account',
      }).toString()}`;

      // Start auth session
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        GOOGLE_REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        // Parse the ID token from the URL fragment
        const url = new URL(result.url);
        const hash = url.hash.substring(1); // Remove the #
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        if (idToken) {
          return { token: idToken, error: null };
        } else {
          return { token: null, error: new Error('No ID token received from Google') };
        }
      } else if (result.type === 'cancel') {
        return { token: null, error: new Error('User cancelled the login') };
      } else {
        return { token: null, error: new Error('Authentication failed') };
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return { token: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}

export default useGoogleAuth;
