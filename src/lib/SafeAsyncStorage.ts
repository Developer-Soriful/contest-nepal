import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type ExpoSecureStoreNativeModule = {
  getValueWithKeyAsync?: (key: string, options?: Record<string, unknown>) => Promise<string | null>;
  setValueWithKeyAsync?: (
    value: string,
    key: string,
    options?: Record<string, unknown>
  ) => Promise<void>;
  deleteValueWithKeyAsync?: (key: string, options?: Record<string, unknown>) => Promise<void>;
};

let secureStoreModule: ExpoSecureStoreNativeModule | null | undefined;
const SECURE_STORE_OPTIONS: Record<string, unknown> = {};

const getSecureStoreModule = (): ExpoSecureStoreNativeModule | null => {
  if (secureStoreModule !== undefined) {
    return secureStoreModule;
  }

  if (Platform.OS === 'web') {
    secureStoreModule = null;
    return secureStoreModule;
  }

  secureStoreModule = requireOptionalNativeModule<ExpoSecureStoreNativeModule>('ExpoSecureStore');

  return secureStoreModule;
};

// Production-ready AsyncStorage with fallback to in-memory storage
class SafeAsyncStorage {
  private static memoryStorage: { [key: string]: string } = {};
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;
  private static secureKeys = new Set(['access_token', 'refresh_token']);

  private static async initialize(): Promise<void> {
    if (SafeAsyncStorage.isInitialized) return;
    if (SafeAsyncStorage.initPromise) return SafeAsyncStorage.initPromise;

    SafeAsyncStorage.initPromise = SafeAsyncStorage.waitForAsyncStorage();
    await SafeAsyncStorage.initPromise;
    SafeAsyncStorage.isInitialized = true;
  }

  private static async waitForAsyncStorage(): Promise<void> {
    const maxRetries = 50;
    const retryDelay = 100;

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.getItem) {
          await AsyncStorage.getItem('__test_key__');
          console.log('AsyncStorage initialized successfully');
          return;
        }
      } catch (error) {
        console.log(`AsyncStorage initialization attempt ${i + 1}/${maxRetries}:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    console.warn('AsyncStorage failed to initialize after retries, falling back to memory storage');
  }

  private static canUseSecureStore(): boolean {
    const secureStore = getSecureStoreModule();
    return Boolean(secureStore?.getValueWithKeyAsync && secureStore?.setValueWithKeyAsync);
  }

  private static shouldUseSecureStore(key: string): boolean {
    return SafeAsyncStorage.secureKeys.has(key) && SafeAsyncStorage.canUseSecureStore();
  }

  static async getItem(key: string): Promise<string | null> {
    await SafeAsyncStorage.initialize();

    try {
      if (SafeAsyncStorage.shouldUseSecureStore(key)) {
        const secureStore = getSecureStoreModule();
        if (!secureStore?.getValueWithKeyAsync || !secureStore.setValueWithKeyAsync) {
          return SafeAsyncStorage.memoryStorage[key] || null;
        }

        const secureValue = await secureStore.getValueWithKeyAsync(key, SECURE_STORE_OPTIONS);
        if (secureValue !== null) {
          SafeAsyncStorage.memoryStorage[key] = secureValue;
          return secureValue;
        }

        if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.getItem) {
          const legacyValue = await AsyncStorage.getItem(key);
          if (legacyValue !== null) {
            await secureStore.setValueWithKeyAsync(legacyValue, key, SECURE_STORE_OPTIONS);
            await AsyncStorage.removeItem(key);
            SafeAsyncStorage.memoryStorage[key] = legacyValue;
            return legacyValue;
          }
        }
      }

      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.getItem) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          SafeAsyncStorage.memoryStorage[key] = value;
        }
        return value;
      }
      return SafeAsyncStorage.memoryStorage[key] || null;
    } catch (error) {
      console.log('AsyncStorage getItem error:', error);
      return SafeAsyncStorage.memoryStorage[key] || null;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    if (value === undefined || value === null) {
      console.warn(`SafeAsyncStorage: Attempting to set null/undefined for key "${key}", skipping`);
      return;
    }

    await SafeAsyncStorage.initialize();

    try {
      if (SafeAsyncStorage.shouldUseSecureStore(key)) {
        const secureStore = getSecureStoreModule();
        if (!secureStore) {
          SafeAsyncStorage.memoryStorage[key] = value;
          return;
        }

        if (!secureStore.setValueWithKeyAsync) {
          SafeAsyncStorage.memoryStorage[key] = value;
          return;
        }

        await secureStore.setValueWithKeyAsync(value, key, SECURE_STORE_OPTIONS);
        SafeAsyncStorage.memoryStorage[key] = value;

        if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.removeItem) {
          await AsyncStorage.removeItem(key);
        }
        return;
      }

      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
        // Also store in memory for sync access
        SafeAsyncStorage.memoryStorage[key] = value;
        return;
      }
      SafeAsyncStorage.memoryStorage[key] = value;
      console.warn('SafeAsyncStorage: Using memory storage fallback for key:', key);
    } catch (error) {
      console.log('SafeAsyncStorage setItem error:', error);
      SafeAsyncStorage.memoryStorage[key] = value;
    }
  }

  // Force flush - useful for ensuring data is persisted before app close
  static async flush(): Promise<void> {
    await SafeAsyncStorage.initialize();
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && (AsyncStorage as any).flush) {
        await (AsyncStorage as any).flush();
        console.log('SafeAsyncStorage: Flushed successfully');
      }
    } catch (error) {
      console.log('SafeAsyncStorage: Flush not available or failed:', error);
    }
  }

  static async removeItem(key: string): Promise<void> {
    await SafeAsyncStorage.initialize();

    try {
      if (SafeAsyncStorage.shouldUseSecureStore(key)) {
        const secureStore = getSecureStoreModule();
        if (secureStore?.deleteValueWithKeyAsync) {
          await secureStore.deleteValueWithKeyAsync(key, SECURE_STORE_OPTIONS);
        }
      }

      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
        delete SafeAsyncStorage.memoryStorage[key];
        return;
      }
      delete SafeAsyncStorage.memoryStorage[key];
      console.warn('Using memory storage fallback for remove key:', key);
    } catch (error) {
      console.log('AsyncStorage removeItem error:', error);
      delete SafeAsyncStorage.memoryStorage[key];
    }
  }

  static async getAllKeys(): Promise<string[]> {
    await SafeAsyncStorage.initialize();

    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.getAllKeys) {
        const keys = await AsyncStorage.getAllKeys();
        return keys as string[];
      }
      return Object.keys(SafeAsyncStorage.memoryStorage);
    } catch (error) {
      console.log('AsyncStorage getAllKeys error:', error);
      return Object.keys(SafeAsyncStorage.memoryStorage);
    }
  }

  static async clear(): Promise<void> {
    await SafeAsyncStorage.initialize();

    try {
      await Promise.all(
        [...SafeAsyncStorage.secureKeys].map((key) =>
          SafeAsyncStorage.shouldUseSecureStore(key)
            ? (async () => {
                const secureStore = getSecureStoreModule();
                if (secureStore?.deleteValueWithKeyAsync) {
                  await secureStore.deleteValueWithKeyAsync(key, SECURE_STORE_OPTIONS);
                }
              })()
            : Promise.resolve()
        )
      );

      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.clear) {
        await AsyncStorage.clear();
        SafeAsyncStorage.memoryStorage = {};
        return;
      }
      SafeAsyncStorage.memoryStorage = {};
      console.warn('Using memory storage fallback for clear');
    } catch (error) {
      console.log('AsyncStorage clear error:', error);
      SafeAsyncStorage.memoryStorage = {};
    }
  }

  static isAvailable(): boolean {
    return typeof AsyncStorage !== 'undefined' && AsyncStorage !== null;
  }

  static getStorageType(): 'secure' | 'async' | 'memory' {
    if (SafeAsyncStorage.canUseSecureStore()) {
      return 'secure';
    }
    return SafeAsyncStorage.isAvailable() ? 'async' : 'memory';
  }
}

export default SafeAsyncStorage;
