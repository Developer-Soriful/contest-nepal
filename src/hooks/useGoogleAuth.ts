import { Platform } from 'react-native';
import { useGoogleAuthNative } from './useGoogleAuthNative';
import { useGoogleAuthSimple } from './useGoogleAuthSimple';

export function useGoogleAuth() {
  const nativeAuth = useGoogleAuthNative();
  const simpleAuth = useGoogleAuthSimple();

  if (Platform.OS === 'android') {
    return nativeAuth;
  }

  return simpleAuth;
}
