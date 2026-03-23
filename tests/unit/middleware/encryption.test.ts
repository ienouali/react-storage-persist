import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStorage } from '../../../src/core';
import { encryptionMiddleware } from '../../../src/middleware/encryption';

describe('encryptionMiddleware', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ engine: 'memory' });
  });

  afterEach(() => {
    storage.destroy();
  });

  it('should encrypt and decrypt string values with base64', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'base64' }));

    await storage.set('key', 'sensitive data');
    const result = await storage.get('key');
    expect(result).toBe('sensitive data');
  });

  it('should encrypt and decrypt strings with simple-xor', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'simple-xor' }));

    await storage.set('key', 'sensitive data');
    const result = await storage.get('key');
    expect(result).toBe('sensitive data');
  });

  it('should throw error when key is missing', () => {
    expect(() => encryptionMiddleware({ key: '' })).toThrow();
  });

  it('should default to base64 algorithm', async () => {
    storage.use(encryptionMiddleware({ key: 'mykey' }));

    await storage.set('key', 'hello');
    const result = await storage.get('key');
    expect(result).toBe('hello');
  });

  it('should round-trip various strings with base64', async () => {
    storage.use(encryptionMiddleware({ key: 'test', algorithm: 'base64' }));

    const values = ['', 'a', 'hello world', 'special chars: !@#$%^&*()'];
    for (const v of values) {
      await storage.set('k', v);
      expect(await storage.get('k')).toBe(v);
    }
  });

  it('should round-trip various strings with simple-xor', async () => {
    storage.use(encryptionMiddleware({ key: 'test', algorithm: 'simple-xor' }));

    const values = ['hello', 'world', 'test123'];
    for (const v of values) {
      await storage.set('k', v);
      expect(await storage.get('k')).toBe(v);
    }
  });

  it('should have name "encryption"', () => {
    const mw = encryptionMiddleware({ key: 'secret' });
    expect(mw.name).toBe('encryption');
  });

  it('should have beforeSet and afterGet hooks', () => {
    const mw = encryptionMiddleware({ key: 'secret' });
    expect(mw.beforeSet).toBeDefined();
    expect(mw.afterGet).toBeDefined();
  });
});
