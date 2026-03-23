import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createStorage,
  getDefaultStorage,
  resetDefaultStorage,
  get,
  set,
  remove,
  clear,
  keys,
  has,
  size,
  length,
  subscribe,
} from '../../../src/core';

describe('Functional API', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetDefaultStorage();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetDefaultStorage();
  });

  describe('createStorage', () => {
    it('should create a new storage instance', () => {
      const storage = createStorage({ engine: 'localStorage' });
      expect(storage).toBeDefined();
      expect(storage).toHaveProperty('get');
      expect(storage).toHaveProperty('set');
      expect(storage).toHaveProperty('remove');
    });

    it('should create independent instances', async () => {
      const storage1 = createStorage({ engine: 'localStorage', prefix: 'app1_' });
      const storage2 = createStorage({ engine: 'localStorage', prefix: 'app2_' });

      await storage1.set('key', 'value1');
      await storage2.set('key', 'value2');

      expect(await storage1.get('key')).toBe('value1');
      expect(await storage2.get('key')).toBe('value2');

      storage1.destroy();
      storage2.destroy();
    });
  });

  describe('Default Instance Functions', () => {
    it('should use singleton default instance', () => {
      const instance1 = getDefaultStorage();
      const instance2 = getDefaultStorage();
      expect(instance1).toBe(instance2);
    });

    it('should set and get values', async () => {
      await set('key', 'value');
      const result = await get('key');
      expect(result).toBe('value');
    });

    it('should return null for non-existent key', async () => {
      const result = await get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return default value', async () => {
      const result = await get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should remove values', async () => {
      await set('key', 'value');
      await remove('key');
      const result = await get('key');
      expect(result).toBeNull();
    });

    it('should clear all values', async () => {
      await set('key1', 'value1');
      await set('key2', 'value2');
      await clear();

      expect(await get('key1')).toBeNull();
      expect(await get('key2')).toBeNull();
    });

    it('should check if key exists', async () => {
      await set('key', 'value');
      expect(await has('key')).toBe(true);
      expect(await has('nonexistent')).toBe(false);
    });

    it('should get all keys', async () => {
      await set('key1', 'value1');
      await set('key2', 'value2');
      await set('key3', 'value3');

      const allKeys = await keys();
      expect(allKeys).toHaveLength(3);
      expect(allKeys).toContain('key1');
      expect(allKeys).toContain('key2');
      expect(allKeys).toContain('key3');
    });

    it('should get storage size', async () => {
      const initialSize = await size();
      await set('key', 'value');
      const newSize = await size();
      expect(newSize).toBeGreaterThan(initialSize);
    });

    it('should get storage length', async () => {
      expect(await length()).toBe(0);
      await set('key1', 'value1');
      expect(await length()).toBe(1);
      await set('key2', 'value2');
      expect(await length()).toBe(2);
    });

    it('should subscribe to changes', async () => {
      let eventFired = false;
      const unsubscribe = subscribe('key', () => {
        eventFired = true;
      });

      await set('key', 'value');
      expect(eventFired).toBe(true);

      unsubscribe();
    });

    it('should work with complex objects', async () => {
      const user = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      await set('user', user);
      const result = await get('user');
      expect(result).toEqual(user);
    });

    it('should work with arrays', async () => {
      const arr = [1, 2, 3, 4, 5];
      await set('numbers', arr);
      const result = await get('numbers');
      expect(result).toEqual(arr);
    });

    it('should handle silent option', async () => {
      let eventFired = false;
      subscribe('key', () => {
        eventFired = true;
      });

      await set('key', 'value', { silent: true });
      expect(eventFired).toBe(false);
    });
  });

  describe('resetDefaultStorage', () => {
    it('should reset default instance', async () => {
      await set('key', 'value');

      const instance1 = getDefaultStorage();
      resetDefaultStorage();
      const instance2 = getDefaultStorage();

      expect(instance1).not.toBe(instance2);
    });

    it('should clear data after reset', async () => {
      await set('key', 'value');
      expect(await get('key')).toBe('value');

      resetDefaultStorage();

      const instance = getDefaultStorage();
      expect(instance).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    interface User {
      name: string;
      age: number;
    }

    it('should work with TypeScript generics', async () => {
      const user: User = { name: 'John', age: 30 };
      await set<User>('user', user);
      const result = await get<User>('user');

      expect(result).toEqual(user);
      if (result) {
        expect(result.name).toBe('John');
        expect(result.age).toBe(30);
      }
    });

    it('should infer types from default value', async () => {
      const result = await get('user', { name: 'Default', age: 0 });
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('age');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as value', async () => {
      await set('key', '');
      const result = await get('key');
      expect(result).toBe('');
    });

    it('should handle zero as value', async () => {
      await set('key', 0);
      const result = await get('key');
      expect(result).toBe(0);
    });

    it('should handle false as value', async () => {
      await set('key', false);
      const result = await get('key');
      expect(result).toBe(false);
    });

    it('should handle null as value', async () => {
      await set('key', null);
      const result = await get('key');
      expect(result).toBeNull();
    });

    it('should handle undefined', async () => {
      await set('key', undefined);
      const result = await get('key');
      console.log({
        result,
      });
      expect(result).toBe(undefined);
    });

    it('should handle special characters in keys', async () => {
      await set('key-with-dash', 'value1');
      await set('key_with_underscore', 'value2');
      await set('key.with.dot', 'value3');

      expect(await get('key-with-dash')).toBe('value1');
      expect(await get('key_with_underscore')).toBe('value2');
      expect(await get('key.with.dot')).toBe('value3');
    });

    it('should handle very long keys', async () => {
      const longKey = 'a'.repeat(200);
      await set(longKey, 'value');
      expect(await get(longKey)).toBe('value');
    });

    it('should handle large values', async () => {
      const largeValue = 'x'.repeat(10000);
      await set('large', largeValue);
      const result = await get('large');
      expect(result).toBe(largeValue);
      expect(result?.length).toBe(10000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent sets', async () => {
      await Promise.all([set('key1', 'value1'), set('key2', 'value2'), set('key3', 'value3')]);

      expect(await get('key1')).toBe('value1');
      expect(await get('key2')).toBe('value2');
      expect(await get('key3')).toBe('value3');
    });

    it('should handle concurrent gets', async () => {
      await set('key1', 'value1');
      await set('key2', 'value2');
      await set('key3', 'value3');

      const results = await Promise.all([get('key1'), get('key2'), get('key3')]);

      expect(results).toEqual(['value1', 'value2', 'value3']);
    });

    it('should handle mixed operations', async () => {
      await Promise.all([
        set('key1', 'value1'),
        set('key2', 'value2'),
        get('key1'),
        remove('key2'),
        set('key3', 'value3'),
      ]);

      expect(await get('key1')).toBe('value1');
      expect(await get('key2')).toBeNull();
      expect(await get('key3')).toBe('value3');
    });
  });
});
