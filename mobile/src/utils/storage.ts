import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility wrapper for AsyncStorage
 * Provides a localStorage-like interface for React Native
 */
export const storage = {
  /**
   * Get an item from storage
   * @param key - Storage key
   * @returns Parsed JSON value or null if not found
   */
  async getItem(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from storage (key: ${key}):`, error);
      return null;
    }
  },

  /**
   * Set an item in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (key: ${key}):`, error);
      throw error;
    }
  },

  /**
   * Remove an item from storage
   * @param key - Storage key to remove
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage (key: ${key}):`, error);
      throw error;
    }
  },

  /**
   * Clear all items from storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

