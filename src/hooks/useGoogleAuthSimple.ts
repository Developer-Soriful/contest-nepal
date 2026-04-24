import { requireOptionalNativeModule } from 'expo-modules-core';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const GOOGLE_OAUTH_CALLBACK_URL =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
  `${API_BASE_URL}/auth/callback`;
const APP_REDIRECT_URI = 'contestnepal://auth/callback';

type ExpoCryptoNativeModule = {
  digestStringAsync?: (
    algorithm: string,
    data: string,
    options?: { encoding: 'base64' | 'hex' }
  ) => Promise<string>;
  getRandomValues?: (typedArray: Uint8Array) => Uint8Array;
  randomUUID?: () => string;
};

const expoCryptoModule =
  requireOptionalNativeModule<ExpoCryptoNativeModule>('ExpoCrypto');

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const sha256K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
  0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
  0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
  0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
  0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
  0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
];

WebBrowser.maybeCompleteAuthSession();

const rightRotate = (value: number, amount: number) =>
  (value >>> amount) | (value << (32 - amount));

const toUtf8Bytes = (value: string): Uint8Array => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  const encoded = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i += 1) {
    bytes[i] = encoded.charCodeAt(i);
  }
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triplet = (a << 16) | (b << 8) | c;

    output += base64Chars[(triplet >> 18) & 0x3f];
    output += base64Chars[(triplet >> 12) & 0x3f];
    output += i + 1 < bytes.length ? base64Chars[(triplet >> 6) & 0x3f] : '=';
    output += i + 2 < bytes.length ? base64Chars[triplet & 0x3f] : '=';
  }

  return output;
};

const toBase64Url = (value: string) =>
  value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const sha256Bytes = (message: Uint8Array): Uint8Array => {
  const bitLength = message.length * 8;
  const paddedLength = (((message.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(message);
  padded[message.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);

  const hash = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  const words = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      words[i] = view.getUint32(offset + (i * 4), false);
    }

    for (let i = 16; i < 64; i += 1) {
      const s0 =
        rightRotate(words[i - 15], 7) ^
        rightRotate(words[i - 15], 18) ^
        (words[i - 15] >>> 3);
      const s1 =
        rightRotate(words[i - 2], 17) ^
        rightRotate(words[i - 2], 19) ^
        (words[i - 2] >>> 10);
      words[i] = (((words[i - 16] + s0) | 0) + ((words[i - 7] + s1) | 0)) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;

    for (let i = 0; i < 64; i += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((h + s1) | 0) + ch) | 0) + ((sha256K[i] + words[i]) | 0)) >>> 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const digestView = new DataView(digest.buffer);
  hash.forEach((value, index) => digestView.setUint32(index * 4, value, false));
  return digest;
};

const getRandomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);

  if (expoCryptoModule?.getRandomValues) {
    try {
      const result = expoCryptoModule.getRandomValues(bytes);
      if (result && result.length === length) {
        return result;
      }
    } catch (_e) {
      // Fall through to next method
    }
  }

  if (globalThis.crypto?.getRandomValues) {
    try {
      const result = globalThis.crypto.getRandomValues(bytes);
      if (result && result.length === length) {
        return result;
      }
    } catch (_e) {
      // Fall through to Math.random fallback
    }
  }

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  return bytes;
};

const randomUuid = (): string => {
  if (expoCryptoModule?.randomUUID) {
    try {
      const result = expoCryptoModule.randomUUID();
      if (result && typeof result === 'string' && result.length === 36) {
        return result;
      }
    } catch (_e) {
      // Fall through
    }
  }

  if (globalThis.crypto?.randomUUID) {
    try {
      const result = globalThis.crypto.randomUUID();
      if (result && typeof result === 'string' && result.length === 36) {
        return result;
      }
    } catch (_e) {
      // Fall through
    }
  }

  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const generateCodeVerifier = () =>
  toBase64Url(bytesToBase64(getRandomBytes(64)));

const generateCodeChallenge = async (verifier: string) => {
  if (expoCryptoModule?.digestStringAsync) {
    try {
      const digest = await expoCryptoModule.digestStringAsync('SHA-256', verifier, {
        encoding: 'base64',
      });
      if (digest && typeof digest === 'string') {
        return toBase64Url(digest);
      }
    } catch (_e) {
      // Fall through to next method
    }
  }

  if (globalThis.crypto?.subtle) {
    const verifierBytes = toUtf8Bytes(verifier);
    const digestBuffer = await globalThis.crypto.subtle.digest(
      'SHA-256',
      verifierBytes.buffer.slice(
        verifierBytes.byteOffset,
        verifierBytes.byteOffset + verifierBytes.byteLength
      ) as ArrayBuffer
    );
    return toBase64Url(bytesToBase64(new Uint8Array(digestBuffer)));
  }

  return toBase64Url(bytesToBase64(sha256Bytes(toUtf8Bytes(verifier))));
};

export function useGoogleAuthSimple() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<string | null> => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    if (!API_BASE_URL) {
      throw new Error('API URL not configured');
    }

    setIsLoading(true);
    const codeVerifier = generateCodeVerifier();
    const state = randomUuid();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    try {
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH_CALLBACK_URL,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'select_account',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          const errorMsg = `Error: ${error}\n\nDescription: ${errorDescription || 'None'}\n\nOAuth callback URL:\n${GOOGLE_OAUTH_CALLBACK_URL}`;
          Alert.alert('Google OAuth Error', errorMsg);
          throw new Error(`Google auth error: ${error} - ${errorDescription || 'No details'}`);
        }

        if (code && returnedState === state) {
          return JSON.stringify({
            code,
            codeVerifier,
            redirectUri: GOOGLE_OAUTH_CALLBACK_URL,
          });
        }

        if (!code) {
          throw new Error('No authorization code in response');
        }

        throw new Error('State mismatch - possible security issue');
      }

      if (result.type === 'cancel') {
        throw new Error('User cancelled');
      }

      throw new Error(`Auth failed: ${result.type}`);
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
