import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = 'https://auth.expo.io/@anonymous/contest-nepal';

// PKCE Helper functions
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return base64URLEncode(array);
};

const generateCodeChallenge = (verifier: string): string => {
  // Simple SHA256 implementation for PKCE
  const sha256 = (s: string): Uint8Array => {
    const utf8 = new TextEncoder().encode(s);
    // Use a simple hash for now - in production use proper crypto
    let hash = new Uint8Array(32);
    for (let i = 0; i < utf8.length; i++) {
      hash[i % 32] = (hash[i % 32] + utf8[i]) % 256;
    }
    return hash;
  };
  return base64URLEncode(sha256(verifier));
};

const base64URLEncode = (buffer: Uint8Array): string => {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (idToken: string) => void;
  onError: (error: Error) => void;
}

// Validate Google Client ID
const isValidClientId = GOOGLE_CLIENT_ID && 
  GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com' &&
  GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');

export function GoogleSignInModal({ visible, onClose, onSuccess, onError }: GoogleSignInModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [codeVerifier] = useState(() => generateCodeVerifier());
  const [authUrl, setAuthUrl] = useState<string>('');

  // Generate auth URL with PKCE when modal opens
  React.useEffect(() => {
    if (visible && isValidClientId) {
      const state = Math.random().toString(36).substring(2, 15);
      const codeChallenge = generateCodeChallenge(codeVerifier);
      
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        prompt: 'select_account',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
      }).toString()}`;
      
      setAuthUrl(url);
    }
  }, [visible, codeVerifier]);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if we reached the redirect URI
    if (url && url.startsWith(GOOGLE_REDIRECT_URI)) {
      // Parse query params for authorization code (PKCE flow)
      const queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
        const query = url.substring(queryIndex + 1);
        const params = new URLSearchParams(query);
        const authCode = params.get('code');
        const error = params.get('error');

        if (error) {
          onError(new Error(`Google auth error: ${error}`));
          return;
        }

        if (authCode) {
          // For PKCE flow, we need to exchange the code for tokens
          // In a real implementation, send code + codeVerifier to your backend
          // For now, we'll pass a special format that the backend can handle
          const tokenData = JSON.stringify({
            code: authCode,
            codeVerifier: codeVerifier,
            redirectUri: GOOGLE_REDIRECT_URI,
          });
          onSuccess(tokenData);
        } else {
          onError(new Error('No authorization code received from Google'));
        }
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Sign in with Google</Text>
          <View style={styles.placeholder} />
        </View>

        {/* WebView or Error View */}
        <View style={styles.webViewContainer}>
          {!isValidClientId ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EA4335" />
              <Text style={styles.errorTitle}>Configuration Error</Text>
              <Text style={styles.errorText}>
                Google Client ID is missing or invalid.{'\n\n'}
                Please add your EXPO_PUBLIC_GOOGLE_CLIENT_ID to the .env file.{'\n\n'}
                Current value: {GOOGLE_CLIENT_ID || '(empty)'}
              </Text>
              <TouchableOpacity style={styles.errorButton} onPress={onClose}>
                <Text style={styles.errorButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4285F4" />
                  <Text style={styles.loadingText}>Loading Google Sign-In...</Text>
                </View>
              )}
              <WebView
                ref={webViewRef}
                source={{ uri: authUrl }}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
                userAgent="Mozilla/5.0 (Linux; Android 10; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0"
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                allowsBackForwardNavigationGestures={true}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  webViewContainer: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInModal;
