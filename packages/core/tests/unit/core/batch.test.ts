import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Storage } from '../../../src/core/storage';

describe('Storage - Batch Operations', () => {
  let storage: Storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new Storage({ engine: 'localStorage' });
  });

  afterEach(() => {
    storage.destroy();
    localStorage.clear();
  });

  describe('getMany', () => {
    it('should return values for multiple keys', async () => {
      await storage.set('a', 1);
      await storage.set('b', 2);
      await storage.set('c', 3);

      const result = await storage.getMany(['a', 'b', 'c']);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should return null for missing keys', async () => {
      await storage.set('a', 1);

      const result = await storage.getMany(['a', 'missing']);
      expect(result).toEqual({ a: 1, missing: null });
    });

    it('should return empty object for empty keys array', async () => {
      const result = await storage.getMany([]);
      expect(result).toEqual({});
    });

    it('should handle object values', async () => {
      await storage.set('user', { name: 'John', age: 30 });
      await storage.set('settings', { theme: 'dark' });

      const result = await storage.getMany(['user', 'settings']);
      expect(result).toEqual({
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' },
      });
    });
  });

  describe('setMany', () => {
    it('should set multiple keys at once', async () => {
      await storage.setMany({ a: 1, b: 2, c: 3 });

      expect(await storage.get('a')).toBe(1);
      expect(await storage.get('b')).toBe(2);
      expect(await storage.get('c')).toBe(3);
    });

    it('should set object values', async () => {
      await storage.setMany({
        user: { name: 'John' },
        settings: { theme: 'dark' },
      });

      expect(await storage.get('user')).toEqual({ name: 'John' });
      expect(await storage.get('settings')).toEqual({ theme: 'dark' });
    });

    it('should overwrite existing values', async () => {
      await storage.set('key', 'old');
      await storage.setMany({ key: 'new' });

      expect(await storage.get('key')).toBe('new');
    });
  });

  describe('removeMany', () => {
    it('should remove multiple keys at once', async () => {
      await storage.set('a', 1);
      await storage.set('b', 2);
      await storage.set('c', 3);

      await storage.removeMany(['a', 'b']);

      expect(await storage.get('a')).toBeNull();
      expect(await storage.get('b')).toBeNull();
      expect(await storage.get('c')).toBe(3);
    });

    it('should not throw when removing non-existent keys', async () => {
      await expect(storage.removeMany(['nonexistent'])).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(storage.removeMany([])).resolves.not.toThrow();
    });
  });

  describe('getMany + setMany roundtrip', () => {
    it('should set many and get many consistently', async () => {
      const items = { x: 10, y: 20, z: 30 };
      await storage.setMany(items);

      const result = await storage.getMany(Object.keys(items));
      expect(result).toEqual(items);
    });
  });
});
