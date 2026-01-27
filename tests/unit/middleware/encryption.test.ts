import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStorage } from '../../../src/core';
import { encryptionMiddleware } from '../../../src/middleware/encryption';

describe('encryptionMiddleware', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    localStorage.clear();
    storage = createStorage({ engine: 'memory' });
  });

  afterEach(() => {
    storage.destroy();
    localStorage.clear();
  });

  it('should encrypt and decrypt string values with base64', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'base64' }));

    await storage.set('key', 'sensitive data');
    const result = await storage.get('key');

    expect(result).toBe('sensitive data');
  });

  it('should encrypt and decrypt with simple-xor', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'simple-xor' }));

    await storage.set('key', 'sensitive data');
    const result = await storage.get('key');

    expect(result).toBe('sensitive data');
  });

  it('should work with objects', async () => {
    storage.use(encryptionMiddleware({ key: 'secret' }));

    const data = { username: 'john', password: 'secret123' };
    await storage.set('credentials', data);
    const result = await storage.get('credentials');

    expect(result).toEqual(data);
  });

  it('should work with arrays', async () => {
    storage.use(encryptionMiddleware({ key: 'secret' }));

    const data = [1, 2, 3, 4, 5];
    await storage.set('numbers', data);
    const result = await storage.get('numbers');

    expect(result).toEqual(data);
  });

  it('should throw error when key is missing', () => {
    expect(() => {
      encryptionMiddleware({ key: '' });
    }).toThrow();
  });

  it('should handle null values', async () => {
    storage.use(encryptionMiddleware({ key: 'secret' }));

    await storage.set('key', null);
    const result = await storage.get('key');

    expect(result).toBeNull();
  });

  it('should work with numbers', async () => {
    storage.use(encryptionMiddleware({ key: 'secret' }));

    await storage.set('count', 42);
    const result = await storage.get('count');

    expect(result).toBe(42);
  });

  it('should work with booleans', async () => {
    storage.use(encryptionMiddleware({ key: 'secret' }));

    await storage.set('flag', true);
    const result = await storage.get('flag');

    expect(result).toBe(true);
  });
});
