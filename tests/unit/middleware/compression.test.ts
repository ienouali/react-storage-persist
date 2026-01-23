import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStorage } from '../../../src/core';
import { compressionMiddleware } from '../../../src/middleware/compression';

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
});