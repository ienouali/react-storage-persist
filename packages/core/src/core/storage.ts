import type {
  StorageConfig,
  StorageOptions,
  StorageItem,
  StorageChangeEvent,
  IStorageEngine,
  Middleware,
  StorageEventType,
  BatchGetResult,
  BatchSetItems,
} from '../types';

import { StorageError, StorageErrorCode } from '../types/errors';
import { createEngine } from '../engines/factory';

export class Storage {
  private engine: IStorageEngine;
  private config: Required<StorageConfig>;
  private listeners: Map<string, Set<(event: StorageChangeEvent) => void>>;
  private middleware: Middleware[];
  private cleanupInterval: any | null = null;
  private syncHandler: ((event: StorageEvent) => void) | null = null;

  constructor(config: StorageConfig = {}) {
    this.config = this.normalizeConfig(config);
    this.engine = this.initializeEngine();
    this.listeners = new Map();
    this.middleware = [];

    if (this.config.ttl > 0) {
      this.setupCleanup();
    }
    this.setupSync();
  }

  /**
   * Get item from storage
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const item = await this.readItem<T>(this.getFullKey(key));

      if (item === null) {
        this.log('get', key, 'not found');
        return defaultValue ?? null;
      }

      if (this.isExpired(item)) {
        this.log('get', key, 'expired');
        await this.deleteEntry(key, null);
        return defaultValue ?? null;
      }

      const value = await this.runAfterGet(key, item.value);

      this.log('get', key, value);
      this.emit('get', { key, newValue: value });

      return value;
    } catch (error) {
      this.handleError('get', key, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Set item in storage
   */
  async set<T = any>(key: string, value: T, options?: StorageOptions): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const oldValue = await this.peek<T>(key);

      let processedValue = value;
      for (const mw of this.middleware) {
        if (mw.beforeSet) {
          processedValue = await mw.beforeSet(key, processedValue, options);
        }
      }

      const item: StorageItem<T> = {
        value: processedValue,
        metadata: {
          createdAt: Date.now(),
          expiresAt: this.calculateExpiration(options?.ttl),
        },
      };

      const serialized = this.serialize(item);
      await this.engine.setItem(fullKey, serialized);

      this.log('set', key, value);

      if (!options?.silent) {
        this.emit('set', { key, oldValue, newValue: value });
      }
    } catch (error) {
      this.handleError('set', key, error);
      throw error;
    }
  }

  /**
   * Remove item from storage
   */
  async remove(key: string): Promise<void> {
    try {
      const oldValue = await this.peek(key);
      await this.deleteEntry(key, oldValue);
    } catch (error) {
      this.handleError('remove', key, error);
      throw error;
    }
  }

  /**
   * Clear all items (respecting prefix/suffix)
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      await Promise.all(keys.map((key) => this.remove(key)));

      this.log('clear');
      this.emit('clear', { key: '*' });
    } catch (error) {
      this.handleError('clear', '*', error);
      throw error;
    }
  }

  /**
   * Get all keys (without prefix/suffix)
   */
  async keys(): Promise<string[]> {
    try {
      const allKeys = await this.engine.keys();
      return allKeys
        .filter((key) => this.matchesNamespace(key))
        .map((key) => this.stripNamespace(key));
    } catch (error) {
      this.handleError('keys', '*', error);
      return [];
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get multiple items at once
   */
  async getMany<T = any>(keys: string[]): Promise<BatchGetResult<T>> {
    const entries = await Promise.all(
      keys.map(async (key) => [key, await this.get<T>(key)] as [string, T | null])
    );
    return Object.fromEntries(entries);
  }

  /**
   * Set multiple items at once
   */
  async setMany(items: BatchSetItems, options?: StorageOptions): Promise<void> {
    await Promise.all(Object.entries(items).map(([key, value]) => this.set(key, value, options)));
  }

  /**
   * Remove multiple items at once
   */
  async removeMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.remove(key)));
  }

  /**
   * Get storage size (approximate in bytes)
   */
  async size(): Promise<number> {
    try {
      const keys = await this.keys();
      let total = 0;

      for (const key of keys) {
        const value = await this.engine.getItem(this.getFullKey(key));
        if (value) {
          total += value.length * 2;
        }
      }

      return total;
    } catch (error) {
      this.handleError('size', '*', error);
      return 0;
    }
  }

  /**
   * Get number of items
   */
  async length(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * Add middleware
   */
  use(middleware: Middleware): void {
    this.middleware.push(middleware);
    this.log('middleware added', middleware.name);
  }

  /**
   * Subscribe to storage changes
   */
  subscribe(
    keyOrCallback: string | ((event: StorageChangeEvent) => void),
    callback?: (event: StorageChangeEvent) => void
  ): () => void {
    const key = typeof keyOrCallback === 'string' ? keyOrCallback : '*';
    const handler = typeof keyOrCallback === 'function' ? keyOrCallback : callback!;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(handler);

    return () => {
      this.listeners.get(key)?.delete(handler);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * Destroy storage instance and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      window.clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.syncHandler) {
      window.removeEventListener('storage', this.syncHandler);
      this.syncHandler = null;
    }
    this.listeners.clear();
    this.middleware = [];
    this.log('destroyed');
  }

  private normalizeConfig(config: StorageConfig): Required<StorageConfig> {
    return {
      engine: config.engine ?? 'localStorage',
      prefix: config.prefix ?? '',
      suffix: config.suffix ?? '',
      ttl: config.ttl ?? 0,
      fallback: Array.isArray(config.fallback)
        ? config.fallback
        : config.fallback
          ? [config.fallback]
          : ['memory'],
      serializer: config.serializer ?? {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
      encrypt: config.encrypt ?? false,
      encryptionKey: config.encryptionKey ?? '',
      compression: config.compression ?? false,
      onError: config.onError ?? (() => {}),
      onChange: config.onChange ?? (() => {}),
      debug: config.debug ?? false,
    };
  }

  private initializeEngine(): IStorageEngine {
    const primaryEngine = createEngine(this.config.engine);
    if (primaryEngine.isAvailable()) {
      this.log('engine initialized', this.config.engine);
      return primaryEngine;
    }

    const fallbackEngines = Array.isArray(this.config.fallback)
      ? this.config.fallback
      : [this.config.fallback];

    for (const engineType of fallbackEngines) {
      const engine = createEngine(engineType);
      if (engine.isAvailable()) {
        this.log('using fallback engine', engineType);
        return engine;
      }
    }

    throw new StorageError('No storage engine available', StorageErrorCode.NOT_AVAILABLE);
  }

  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}${this.config.suffix}`;
  }

  private stripNamespace(fullKey: string): string {
    let key = fullKey;
    if (this.config.prefix) {
      key = key.slice(this.config.prefix.length);
    }
    if (this.config.suffix) {
      key = key.slice(0, -this.config.suffix.length);
    }
    return key;
  }

  private matchesNamespace(fullKey: string): boolean {
    if (this.config.prefix && !fullKey.startsWith(this.config.prefix)) {
      return false;
    }
    if (this.config.suffix && !fullKey.endsWith(this.config.suffix)) {
      return false;
    }
    return true;
  }

  private serialize<T>(value: T): string {
    try {
      return this.config.serializer.serialize(value);
    } catch (error) {
      throw new StorageError(
        'Serialization failed',
        StorageErrorCode.SERIALIZATION_FAILED,
        error as Error
      );
    }
  }

  private deserialize<T>(value: string): T {
    try {
      return this.config.serializer.deserialize(value);
    } catch (error) {
      throw new StorageError(
        'Deserialization failed',
        StorageErrorCode.DESERIALIZATION_FAILED,
        error as Error
      );
    }
  }

  private async readItem<T>(fullKey: string): Promise<StorageItem<T> | null> {
    const raw = await this.engine.getItem(fullKey);
    if (raw === null) return null;
    return this.parseItem<T>(raw);
  }

  private parseItem<T>(raw: string): StorageItem<T> {
    const item = this.deserialize<StorageItem<T>>(raw);
    if (!isStorageItem(item)) {
      throw new StorageError(
        'Value was not written by this storage instance',
        StorageErrorCode.DESERIALIZATION_FAILED
      );
    }
    return item;
  }

  /**
   * Reads the current decoded value without emitting events or deleting expired
   * entries, so it is safe to call from set/remove without re-entering get().
   */
  private async peek<T>(key: string): Promise<T | null> {
    try {
      const item = await this.readItem<T>(this.getFullKey(key));
      if (item === null || this.isExpired(item)) return null;
      return await this.runAfterGet(key, item.value);
    } catch {
      return null;
    }
  }

  private async deleteEntry(key: string, oldValue: unknown): Promise<void> {
    for (const mw of this.middleware) {
      if (mw.beforeRemove) {
        await mw.beforeRemove(key);
      }
    }

    await this.engine.removeItem(this.getFullKey(key));

    this.log('remove', key);
    this.emit('remove', { key, oldValue });
  }

  // afterGet unwinds in reverse so stacked transforms (e.g. compress then encrypt) invert correctly.
  private async runAfterGet<T>(key: string, value: T): Promise<T> {
    let result: T | null = value;
    for (let i = this.middleware.length - 1; i >= 0; i--) {
      const mw = this.middleware[i];
      if (mw?.afterGet) {
        result = await mw.afterGet(key, result);
      }
    }
    return result as T;
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.metadata.expiresAt) return false;
    return Date.now() > item.metadata.expiresAt;
  }

  private calculateExpiration(ttl?: number): number | undefined {
    const ttlSeconds = ttl ?? this.config.ttl;
    if (!ttlSeconds) return undefined;
    return Date.now() + ttlSeconds * 1000;
  }

  private emit(type: StorageEventType, event: Partial<StorageChangeEvent>): void {
    const fullEvent: StorageChangeEvent = {
      type,
      key: event.key ?? '',
      oldValue: event.oldValue,
      newValue: event.newValue,
      timestamp: Date.now(),
    };

    this.listeners.get(event.key ?? '')?.forEach((handler) => handler(fullEvent));

    this.listeners.get('*')?.forEach((handler) => handler(fullEvent));

    this.config.onChange(fullEvent);
  }

  private handleError(operation: string, key: string, error: any): void {
    const storageError =
      error instanceof StorageError
        ? error
        : new StorageError(
            `Storage ${operation} failed for key "${key}"`,
            StorageErrorCode.OPERATION_FAILED,
            error as Error
          );

    this.log('error', operation, key, error);
    this.emit('error', { key });
    this.config.onError(storageError);
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Storage]', ...args);
    }
  }

  private setupCleanup(): void {
    this.cleanupInterval = window.setInterval(
      async () => {
        try {
          const keys = await this.keys();
          for (const key of keys) {
            await this.get(key);
          }
          this.log('cleanup completed');
        } catch (error) {
          this.log('cleanup error', error);
        }
      },
      5 * 60 * 1000
    );
  }

  private setupSync(): void {
    if (typeof window === 'undefined') return;
    // Only Web Storage fires cross-tab `storage` events.
    if (this.engine.name !== 'localStorage' && this.engine.name !== 'sessionStorage') return;

    this.syncHandler = (event: StorageEvent) => {
      void this.handleExternalChange(event);
    };
    window.addEventListener('storage', this.syncHandler);
  }

  private async handleExternalChange(event: StorageEvent): Promise<void> {
    const area = this.engine.name === 'localStorage' ? window.localStorage : window.sessionStorage;
    if (event.storageArea !== null && event.storageArea !== area) return;

    if (event.key === null) {
      for (const key of Array.from(this.listeners.keys())) {
        if (key !== '*') this.emit('remove', { key });
      }
      this.emit('clear', { key: '*' });
      return;
    }

    if (!this.matchesNamespace(event.key)) return;
    const key = this.stripNamespace(event.key);

    try {
      const [previous, next] = await Promise.all([
        this.decodeExternal(key, event.oldValue),
        this.decodeExternal(key, event.newValue),
      ]);

      if (next === null) {
        this.emit('remove', { key, oldValue: previous?.value ?? null });
      } else {
        this.emit('set', { key, oldValue: previous?.value ?? null, newValue: next.value });
      }
    } catch (error) {
      this.log('sync error', error);
    }
  }

  private async decodeExternal(
    key: string,
    raw: string | null
  ): Promise<{ value: unknown } | null> {
    if (raw === null) return null;
    const item = this.parseItem(raw);
    if (this.isExpired(item)) return null;
    return { value: await this.runAfterGet(key, item.value) };
  }
}

function isStorageItem(value: unknown): value is StorageItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'metadata' in value &&
    typeof (value as StorageItem).metadata === 'object' &&
    (value as StorageItem).metadata !== null
  );
}
