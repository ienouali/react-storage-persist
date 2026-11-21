import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStorage } from '../../../src/core';
import { compressionMiddleware } from '../../../src/middleware/compression';
import { encryptionMiddleware } from '../../../src/middleware/encryption';

describe('compressionMiddleware', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    localStorage.clear();
    storage = createStorage({ engine: 'memory' });
  });

  afterEach(() => {
    storage.destroy();
    localStorage.clear();
  });

  it('should compress and decompress large strings', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const largeString = 'aaaaaaaaaaaaaaaa';
    await storage.set('key', largeString);
    const result = await storage.get('key');

    expect(result).toBe(largeString);
  });

  it('should not compress small strings below threshold', async () => {
    storage.use(compressionMiddleware({ threshold: 100 }));

    const smallString = 'small';
    await storage.set('key', smallString);
    const result = await storage.get('key');

    expect(result).toBe(smallString);
  });

  it('should work with objects', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const data = { name: 'John', description: 'aaaaaaaaaaaaaaaa' };
    await storage.set('user', data);
    const result = await storage.get('user');

    expect(result).toEqual(data);
  });

  it('should compress repeating patterns', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const repeating = 'hellohellohellohello';
    await storage.set('key', repeating);
    const result = await storage.get('key');

    expect(result).toBe(repeating);
  });

  it('should handle null values', async () => {
    storage.use(compressionMiddleware());

    await storage.set('key', null);
    const result = await storage.get('key');

    expect(result).toBeNull();
  });

  it('should handle numbers', async () => {
    storage.use(compressionMiddleware());

    await storage.set('count', 42);
    const result = await storage.get('count');

    expect(result).toBe(42);
  });

  it('should handle arrays', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const arr = ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'];
    await storage.set('items', arr);
    const result = await storage.get('items');

    expect(result).toEqual(arr);
  });

  it('should use custom threshold', async () => {
    storage.use(compressionMiddleware({ threshold: 1000 }));

    const smallString = 'test';
    await storage.set('key', smallString);
    const result = await storage.get('key');

    expect(result).toBe(smallString);
  });

  const rawStored = (key: string): string => (storage as any).engine.getItem(key) as string;

  it('does not alter plain values that look like the old RLE format', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    for (const value of ['a*5', 'price*12', 'x*3 and y*100 items']) {
      await storage.set('k', value);
      expect(await storage.get('k')).toBe(value);
    }
  });

  it('round-trips deeply nested objects', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const data = { a: { b: { c: { d: 'x'.repeat(200), list: [[[[1]]]] } } } };
    await storage.set('k', data);

    expect(await storage.get('k')).toEqual(data);
  });

  it('actually shrinks large repetitive payloads', async () => {
    storage.use(compressionMiddleware({ threshold: 100 }));

    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, status: 'active', tags: ['a'] }));
    await storage.set('rows', rows);

    expect(rawStored('rows').length).toBeLessThan(JSON.stringify(rows).length / 3);
    expect(await storage.get('rows')).toEqual(rows);
  });

  it('round-trips unicode', async () => {
    storage.use(compressionMiddleware({ threshold: 10 }));

    const text = 'héllo ✓ 日本語 🎉 '.repeat(50);
    await storage.set('k', text);

    expect(await storage.get('k')).toBe(text);
  });

  it.each(['gzip', 'deflate', 'deflate-raw', 'simple-rle'] as const)(
    'supports the %s algorithm option',
    async (algorithm) => {
      storage.use(compressionMiddleware({ threshold: 10, algorithm }));

      const data = { text: 'repeat '.repeat(100) };
      await storage.set('k', data);

      expect(await storage.get('k')).toEqual(data);
    }
  );

  describe.each(['compression first', 'encryption first'])(
    'stacked with encryption (%s)',
    (order) => {
      it('round-trips values', async () => {
        const compression = compressionMiddleware({ threshold: 10 });
        const encryption = encryptionMiddleware({
          key: 'k',
          algorithm: 'aes-gcm',
          iterations: 1000,
        });
        const [first, second] =
          order === 'compression first' ? [compression, encryption] : [encryption, compression];
        storage.use(first);
        storage.use(second);

        for (const value of [
          'aaaaaaaa',
          'a'.repeat(500),
          { nested: { list: ['x'.repeat(300)] } },
        ]) {
          await storage.set('k', value);
          expect(await storage.get('k')).toEqual(value);
        }
      });
    }
  );
});
