import { BaseStorageEngine } from './base';
import type { StorageEngine } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

export class LocalStorageEngine extends BaseStorageEngine {
  readonly name: StorageEngine = 'localStorage';

  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to get item "${key}" from localStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Check if it's a quota exceeded error
      if (this.isQuotaExceededError(error)) {
        throw new StorageError(
          `Storage quota exceeded when setting "${key}"`,
          StorageErrorCode.QUOTA_EXCEEDED,
          error as Error
        );
      }
      throw new StorageError(
        `Failed to set item "${key}" in localStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item "${key}" from localStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  clear(): void {
    try {
      window.localStorage.clear();
    } catch (error) {
      throw new StorageError(
        'Failed to clear localStorage',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      throw new StorageError(
        'Failed to get keys from localStorage',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  length(): number {
    try {
      return window.localStorage.length;
    } catch (error) {
      throw new StorageError(
        'Failed to get localStorage length',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  private isQuotaExceededError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || // Firefox
      // Safari in private mode
      (error.message && error.message.includes('quota'))
    );
  }
}
