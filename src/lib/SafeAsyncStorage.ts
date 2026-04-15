import AsyncStorage from '@react-native-async-storage/async-storage';

// Production-ready AsyncStorage with fallback to in-memory storage
class SafeAsyncStorage {
  private static memoryStorage: { [key: string]: string } = {};
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

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

  static async getItem(key: string): Promise<string | null> {
    await SafeAsyncStorage.initialize();

    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.getItem) {
        const value = await AsyncStorage.getItem(key);
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
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
        // Also store in memory for sync access
        SafeAsyncStorage.memoryStorage[key] = value;
        console.log(`SafeAsyncStorage: Saved "${key}" to AsyncStorage`);
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

  static getStorageType(): 'async' | 'memory' {
    return SafeAsyncStorage.isAvailable() ? 'async' : 'memory';
  }
}

export default SafeAsyncStorage;
