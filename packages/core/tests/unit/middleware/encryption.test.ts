import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStorage } from '../../../src/core';
import { encryptionMiddleware } from '../../../src/middleware/encryption';
import { StorageErrorCode } from '../../../src/types/errors';

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

  const rawStored = (key: string): string => (storage as any).engine.getItem(key) as string;

  describe.each(['aes-gcm', 'base64', 'simple-xor'] as const)('algorithm %s', (algorithm) => {
    it('round-trips objects, arrays, numbers and unicode', async () => {
      storage.use(encryptionMiddleware({ key: 'secret', algorithm, iterations: 1000 }));

      const values = [
        { name: 'Jo', nested: { deep: { deeper: [1, 2, 3] } } },
        ['a', 'b'],
        42,
        true,
        null,
        'héllo wörld ✓ 日本語 🎉',
        '',
      ];
      for (const value of values) {
        await storage.set('k', value);
        expect(await storage.get('k')).toEqual(value);
      }
    });
  });

  it('aes-gcm does not leave plaintext in storage', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'aes-gcm', iterations: 1000 }));

    await storage.set('user', { email: 'jo@example.com' });

    expect(rawStored('user')).not.toContain('jo@example.com');
    expect(rawStored('user')).not.toContain('am9AZXhhbXBsZS5jb20');
  });

  it('aes-gcm uses a fresh IV for every write', async () => {
    storage.use(encryptionMiddleware({ key: 'secret', algorithm: 'aes-gcm', iterations: 1000 }));

    await storage.set('a', 'same');
    await storage.set('b', 'same');

    const ivOf = (key: string) => JSON.parse(rawStored(key)).value.iv;
    expect(ivOf('a')).not.toBe(ivOf('b'));
  });

  it('aes-gcm fails to decrypt with the wrong key and reports DECRYPTION_FAILED', async () => {
    storage.use(encryptionMiddleware({ key: 'right', algorithm: 'aes-gcm', iterations: 1000 }));
    await storage.set('k', 'secret');

    const onError = vi.fn();
    const other = createStorage({ engine: 'memory', onError });
    (other as any).engine = (storage as any).engine;
    other.use(encryptionMiddleware({ key: 'wrong', algorithm: 'aes-gcm', iterations: 1000 }));

    expect(await other.get('k', 'fallback')).toBe('fallback');
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: StorageErrorCode.DECRYPTION_FAILED })
    );
    other.destroy();
  });

  it('still reads strings stored unwrapped by 1.2.0 with base64', async () => {
    await storage.set('legacy', window.btoa('old secret'));
    storage.use(encryptionMiddleware({ key: 'k', algorithm: 'base64' }));

    expect(await storage.get('legacy')).toBe('old secret');
  });
});
