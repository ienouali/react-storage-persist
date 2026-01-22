export type StorageEngine = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';

export interface Serializer<T = any> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}

export interface StorageItem<T = any> {
  value: T;
  metadata: {
    createdAt: number;
    expiresAt?: number;
    version?: string;
  };
}

export interface StorageConfig {
  engine?: StorageEngine;
  prefix?: string;
  suffix?: string;
  ttl?: number;
  fallback?: StorageEngine | StorageEngine[];
  serializer?: Serializer;
  encrypt?: boolean;
  encryptionKey?: string;
  compression?: boolean;
  onError?: (error: StorageError) => void;
  onChange?: (event: StorageChangeEvent) => void;
  debug?: boolean;
}

export interface StorageOptions {
  ttl?: number;
  encrypt?: boolean;
  compress?: boolean;
  silent?: boolean;
}

export type StorageEventType = 'set' | 'get' | 'remove' | 'clear' | 'error';

export interface StorageChangeEvent<T = any> {
  type: StorageEventType;
  key: string;
  oldValue?: T;
  newValue?: T;
  timestamp: number;
}

export interface Middleware {
  name: string;
  beforeSet?: <T>(
      key: string,
      value: T,
      options?: StorageOptions
  ) => T | Promise<T>;
  afterGet?: <T>(
      key: string,
      value: T | null,
      options?: StorageOptions
  ) => T | null | Promise<T | null>;
  beforeRemove?: (key: string) => void | Promise<void>;
}

export interface IStorageEngine {
  name: StorageEngine;
  isAvailable(): boolean;
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
  keys(): string[] | Promise<string[]>;
  length(): number | Promise<number>;
}

export { StorageError, StorageErrorCode } from './errors';