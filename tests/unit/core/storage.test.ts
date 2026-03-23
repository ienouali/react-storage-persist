import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Storage } from '../../../src/core/storage';
import type { Middleware } from '../../../src/types';
import { StorageError } from '../../../src/types/errors';

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    storage = new Storage({ engine: 'localStorage', debug: false });
  });

  afterEach(() => {
    storage.destroy();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Basic CRUD Operations', () => {
    it('should set and get a value', async () => {
      await storage.set('key', 'value');
      const result = await storage.get('key');
      expect(result).toBe('value');
    });

    it('should return null for non-existent key', async () => {
      const result = await storage.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return default value for non-existent key', async () => {
      const result = await storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should store and retrieve objects', async () => {
      const obj = { name: 'John', age: 30 };
      await storage.set('user', obj);
      const result = await storage.get('user');
      expect(result).toEqual(obj);
    });

    it('should store and retrieve arrays', async () => {
      const arr = [1, 2, 3, 4, 5];
      await storage.set('numbers', arr);
      const result = await storage.get('numbers');
      expect(result).toEqual(arr);
    });

    it('should store and retrieve different types', async () => {
      await storage.set('string', 'hello');
      await storage.set('number', 42);
      await storage.set('boolean', true);
      await storage.set('null', null);
      await storage.set('array', [1, 2, 3]);
      await storage.set('object', { key: 'value' });

      expect(await storage.get('string')).toBe('hello');
      expect(await storage.get('number')).toBe(42);
      expect(await storage.get('boolean')).toBe(true);
      expect(await storage.get('null')).toBeNull();
      expect(await storage.get('array')).toEqual([1, 2, 3]);
      expect(await storage.get('object')).toEqual({ key: 'value' });
    });

    it('should remove a value', async () => {
      await storage.set('key', 'value');
      await storage.remove('key');
      const result = await storage.get('key');
      expect(result).toBeNull();
    });

    it('should check if key exists', async () => {
      await storage.set('key', 'value');
      expect(await storage.has('key')).toBe(true);
      expect(await storage.has('nonexistent')).toBe(false);
    });

    it('should clear all values', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.set('key3', 'value3');

      await storage.clear();

      expect(await storage.get('key1')).toBeNull();
      expect(await storage.get('key2')).toBeNull();
      expect(await storage.get('key3')).toBeNull();
    });
  });

  describe('Keys and Length', () => {
    it('should return all keys', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.set('key3', 'value3');

      const keys = await storage.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return correct length', async () => {
      expect(await storage.length()).toBe(0);

      await storage.set('key1', 'value1');
      expect(await storage.length()).toBe(1);

      await storage.set('key2', 'value2');
      expect(await storage.length()).toBe(2);

      await storage.remove('key1');
      expect(await storage.length()).toBe(1);
    });

    it('should return empty array when no keys exist', async () => {
      const keys = await storage.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('Namespace (Prefix/Suffix)', () => {
    it('should apply prefix to keys', async () => {
      const prefixedStorage = new Storage({
        engine: 'localStorage',
        prefix: 'app_',
      });

      await prefixedStorage.set('user', 'John');

      const rawValue = localStorage.getItem('app_user');
      expect(rawValue).not.toBeNull();

      const value = await prefixedStorage.get('user');
      expect(value).toBe('John');

      prefixedStorage.destroy();
    });

    it('should apply suffix to keys', async () => {
      const suffixedStorage = new Storage({
        engine: 'localStorage',
        suffix: '_v1',
      });

      await suffixedStorage.set('user', 'John');

      const rawValue = localStorage.getItem('user_v1');
      expect(rawValue).not.toBeNull();

      const value = await suffixedStorage.get('user');
      expect(value).toBe('John');

      suffixedStorage.destroy();
    });

    it('should apply both prefix and suffix', async () => {
      const namespacedStorage = new Storage({
        engine: 'localStorage',
        prefix: 'app_',
        suffix: '_v1',
      });

      await namespacedStorage.set('user', 'John');

      const rawValue = localStorage.getItem('app_user_v1');
      expect(rawValue).not.toBeNull();

      namespacedStorage.destroy();
    });

    it('should only list keys with matching namespace', async () => {
      const storage1 = new Storage({
        engine: 'localStorage',
        prefix: 'app1_',
      });

      const storage2 = new Storage({
        engine: 'localStorage',
        prefix: 'app2_',
      });

      await storage1.set('key1', 'value1');
      await storage1.set('key2', 'value2');
      await storage2.set('key1', 'value1');

      const keys1 = await storage1.keys();
      const keys2 = await storage2.keys();

      expect(keys1).toHaveLength(2);
      expect(keys2).toHaveLength(1);

      storage1.destroy();
      storage2.destroy();
    });
  });

  describe('Event System', () => {
    it('should emit set event', async () => {
      const handler = vi.fn();
      storage.subscribe('key', handler);

      await storage.set('key', 'value');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'set',
          key: 'key',
          newValue: 'value',
        })
      );
    });

    it('should emit remove event', async () => {
      await storage.set('key', 'value');

      const handler = vi.fn();
      storage.subscribe('key', handler);

      await storage.remove('key');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'remove',
          key: 'key',
          oldValue: 'value',
        })
      );
    });

    it('should emit clear event', async () => {
      await storage.set('key', 'value');

      const handler = vi.fn();
      storage.subscribe('*', handler);

      await storage.clear();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'clear',
          key: '*',
        })
      );
    });

    it('should support wildcard subscriptions', async () => {
      const handler = vi.fn();
      storage.subscribe(handler);

      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe correctly', async () => {
      const handler = vi.fn();
      const unsubscribe = storage.subscribe('key', handler);

      await storage.set('key', 'value1');
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await storage.set('key', 'value2');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not emit events when silent option is true', async () => {
      const handler = vi.fn();
      storage.subscribe('key', handler);

      await storage.set('key', 'value', { silent: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call onChange callback from config', async () => {
      const onChange = vi.fn();
      const configuredStorage = new Storage({
        engine: 'localStorage',
        onChange,
      });

      await configuredStorage.set('key', 'value');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'set',
          key: 'key',
        })
      );

      configuredStorage.destroy();
    });
  });

  describe('Middleware', () => {
    it('should apply beforeSet middleware', async () => {
      const middleware: Middleware = {
        name: 'uppercase',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        beforeSet: async (_key, value) => {
          if (typeof value === 'string') {
            return value.toUpperCase();
          }
          return value;
        },
      };

      storage.use(middleware);
      await storage.set('key', 'value');
      const result = await storage.get('key');

      expect(result).toBe('VALUE');
    });

    it('should apply afterGet middleware', async () => {
      const middleware: Middleware = {
        name: 'reverse',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        afterGet: async (_key, value) => {
          if (typeof value === 'string') {
            return value.split('').reverse().join('');
          }
          return value;
        },
      };

      await storage.set('key', 'hello');
      storage.use(middleware);
      const result = await storage.get('key');

      expect(result).toBe('olleh');
    });

    it('should apply beforeRemove middleware', async () => {
      const beforeRemove = vi.fn();
      const middleware: Middleware = {
        name: 'logger',
        beforeRemove,
      };

      storage.use(middleware);
      await storage.set('key', 'value');
      await storage.remove('key');

      expect(beforeRemove).toHaveBeenCalledWith('key');
    });

    it('should apply multiple middleware in order', async () => {
      const order: string[] = [];

      const middleware1: Middleware = {
        name: 'first',
        beforeSet: async (_key, value) => {
          order.push('first');
          return value;
        },
      };

      const middleware2: Middleware = {
        name: 'second',
        beforeSet: async (_key, value) => {
          order.push('second');
          return value;
        },
      };

      storage.use(middleware1);
      storage.use(middleware2);
      await storage.set('key', 'value');

      expect(order).toEqual(['first', 'second']);
    });
  });

  describe('Error Handling', () => {
    it('should handle serialization errors', async () => {
      const circular: any = {};
      circular.self = circular;

      await expect(storage.set('key', circular)).rejects.toThrow(StorageError);
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();
      const errorStorage = new Storage({
        engine: 'localStorage',
        onError,
      });

      const circular: any = {};
      circular.self = circular;

      try {
        await errorStorage.set('key', circular);
      } catch (error) {
        console.error(error);
      }

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.any(StorageError));

      errorStorage.destroy();
    });

    it('should return null on get error instead of throwing', async () => {
      localStorage.setItem('key', 'invalid json{');

      const result = await storage.get('key');
      expect(result).toBeNull();
    });
  });

  describe('Storage Size', () => {
    it('should calculate approximate size', async () => {
      const initialSize = await storage.size();

      await storage.set('key', 'value');
      const newSize = await storage.size();

      expect(newSize).toBeGreaterThan(initialSize);
    });

    it('should return 0 for empty storage', async () => {
      const size = await storage.size();
      expect(size).toBe(0);
    });
  });

  describe('Engine Fallback', () => {
    it('should fallback to memory when localStorage unavailable', () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('localStorage is not available');
        },
        configurable: true,
      });

      const fallbackStorage = new Storage({
        engine: 'localStorage',
        fallback: ['memory'],
      });

      expect(fallbackStorage).toBeDefined();

      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });

      fallbackStorage.destroy();
    });
  });

  describe('Custom Serializer', () => {
    it('should use custom serializer', async () => {
      const customStorage = new Storage({
        engine: 'localStorage',
        serializer: {
          serialize: (value) => `custom:${JSON.stringify(value)}`,
          deserialize: (value) => JSON.parse(value.replace('custom:', '')),
        },
      });

      await customStorage.set('key', { test: 'value' });

      const raw = localStorage.getItem('key');
      expect(raw).toContain('custom:');

      const result = await customStorage.get('key');
      expect(result).toEqual({ test: 'value' });

      customStorage.destroy();
    });
  });

  describe('Destroy', () => {
    it('should cleanup on destroy', () => {
      const testStorage = new Storage({
        engine: 'localStorage',
        ttl: 60,
      });

      const handler = vi.fn();
      testStorage.subscribe('key', handler);

      testStorage.destroy();

      expect((testStorage as any).middleware).toEqual([]);
      expect((testStorage as any).listeners.size).toBe(0);
    });
  });

  describe('Debug Mode', () => {
    it('should log when debug is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const debugStorage = new Storage({
        engine: 'localStorage',
        debug: true,
      });

      await debugStorage.set('key', 'value');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Storage]',
        expect.anything(),
        expect.anything(),
        expect.anything()
      );

      consoleSpy.mockRestore();
      debugStorage.destroy();
    });

    it('should not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await storage.set('key', 'value');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
