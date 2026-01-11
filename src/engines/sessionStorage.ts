import { BaseStorageEngine } from './base';
import type { StorageEngine } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

export class SessionStorageEngine extends BaseStorageEngine {
  readonly name: StorageEngine = 'sessionStorage';

  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return false;
      }

      const testKey = '__storage_test__';
      window.sessionStorage.setItem(testKey, 'test');
      window.sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to get item "${key}" from sessionStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new StorageError(
          `Storage quota exceeded when setting "${key}"`,
          StorageErrorCode.QUOTA_EXCEEDED,
          error as Error
        );
      }
      throw new StorageError(
        `Failed to set item "${key}" in sessionStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  removeItem(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item "${key}" from sessionStorage`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  clear(): void {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      throw new StorageError(
        'Failed to clear sessionStorage',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      throw new StorageError(
        'Failed to get keys from sessionStorage',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  length(): number {
    try {
      return window.sessionStorage.length;
    } catch (error) {
      throw new StorageError(
        'Failed to get sessionStorage length',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  private isQuotaExceededError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error.message && error.message.includes('quota'))
    );
  }
}
