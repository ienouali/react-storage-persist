// src/engines/indexedDB.ts

import { BaseStorageEngine } from './base';
import type { StorageEngine } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

const DB_NAME = 'StorageLib';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

export class IndexedDBEngine extends BaseStorageEngine {
  readonly name: StorageEngine = 'indexedDB';
  private dbPromise: Promise<IDBDatabase> | null = null;

  isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'indexedDB' in window && indexedDB !== null;
    } catch {
      return false;
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(
          new StorageError(
            'Failed to open IndexedDB',
            StorageErrorCode.OPERATION_FAILED,
            request.error || undefined
          )
        );
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });

    return this.dbPromise;
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = callback(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          new StorageError(
            'IndexedDB operation failed',
            StorageErrorCode.OPERATION_FAILED,
            request.error || undefined
          )
        );
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const value = await this.withStore('readonly', (store) => store.get(key));
      return value ?? null;
    } catch (error) {
      throw new StorageError(
        `Failed to get item "${key}" from IndexedDB`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.withStore('readwrite', (store) => store.put(value, key));
    } catch (error) {
      // Check for quota errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new StorageError(
          `Storage quota exceeded when setting "${key}"`,
          StorageErrorCode.QUOTA_EXCEEDED,
          error
        );
      }
      throw new StorageError(
        `Failed to set item "${key}" in IndexedDB`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.withStore('readwrite', (store) => store.delete(key));
    } catch (error) {
      throw new StorageError(
        `Failed to remove item "${key}" from IndexedDB`,
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async clear(): Promise<void> {
    try {
      await this.withStore('readwrite', (store) => store.clear());
    } catch (error) {
      throw new StorageError(
        'Failed to clear IndexedDB',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys = await this.withStore('readonly', (store) => store.getAllKeys());
      return allKeys.map(String);
    } catch (error) {
      throw new StorageError(
        'Failed to get keys from IndexedDB',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async length(): Promise<number> {
    try {
      const allKeys = await this.keys();
      return allKeys.length;
    } catch (error) {
      throw new StorageError(
        'Failed to get IndexedDB length',
        StorageErrorCode.OPERATION_FAILED,
        error as Error
      );
    }
  }

  async getMany(keys: string[]): Promise<Map<string, string | null>> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const results = new Map<string, string | null>();

    await Promise.all(
      keys.map(
        (key) =>
          new Promise<void>((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
              results.set(key, request.result ?? null);
              resolve();
            };
            request.onerror = () => reject(request.error);
          })
      )
    );

    return results;
  }

  async setMany(entries: Map<string, string>): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await Promise.all(
      Array.from(entries.entries()).map(
        ([key, value]) =>
          new Promise<void>((resolve, reject) => {
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  }

  async removeMany(keys: string[]): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await Promise.all(
      keys.map(
        (key) =>
          new Promise<void>((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  }

  async close(): Promise<void> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      db.close();
      this.dbPromise = null;
    }
  }
}
