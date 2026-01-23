import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStorage } from '../../../src/core';
import { loggerMiddleware } from '../../../src/middleware/logger';

describe('loggerMiddleware', () => {
    let storage: ReturnType<typeof createStorage>;
    let mockLogger: { log: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        localStorage.clear();
        mockLogger = {
            log: vi.fn(),
            error: vi.fn(),
        };
        storage = createStorage({ engine: 'memory' });
    });

    afterEach(() => {
        storage.destroy();
        localStorage.clear();
    });

    it('should log set operations', async () => {
        storage.use(loggerMiddleware({ logger: mockLogger, logSet: true }));

        await storage.set('key', 'value');

        expect(mockLogger.log).toHaveBeenCalledWith(
            '[Storage] SET',
            expect.objectContaining({
                key: 'key',
                value: 'value',
            })
        );
    });

    it('should log get operations when enabled', async () => {
        storage.use(loggerMiddleware({ logger: mockLogger, logGet: true }));

        await storage.set('key', 'value');
        mockLogger.log.mockClear();

        await storage.get('key');

        expect(mockLogger.log).toHaveBeenCalledWith(
            '[Storage] GET',
            expect.objectContaining({
                key: 'key',
                value: 'value',
            })
        );
    });

    it('should not log get operations when disabled', async () => {
        storage.use(loggerMiddleware({ logger: mockLogger, logGet: false }));

        await storage.set('key', 'value');
        mockLogger.log.mockClear();

        await storage.get('key');

        expect(mockLogger.log).not.toHaveBeenCalledWith(
            '[Storage] GET',
            expect.anything()
        );
    });

    it('should log remove operations', async () => {
        storage.use(loggerMiddleware({ logger: mockLogger, logRemove: true }));

        await storage.set('key', 'value');
        mockLogger.log.mockClear();

        await storage.remove('key');

        expect(mockLogger.log).toHaveBeenCalledWith(
            '[Storage] REMOVE',
            expect.objectContaining({
                key: 'key',
            })
        );
    });

    it('should use custom prefix', async () => {
        storage.use(
            loggerMiddleware({ logger: mockLogger, prefix: '[MyApp]', logSet: true })
        );

        await storage.set('key', 'value');

        expect(mockLogger.log).toHaveBeenCalledWith(
            '[MyApp] SET',
            expect.anything()
        );
    });

    it('should log with options', async () => {
        storage.use(loggerMiddleware({ logger: mockLogger, logSet: true }));

        await storage.set('key', 'value', { ttl: 3600 });

        expect(mockLogger.log).toHaveBeenCalledWith(
            '[Storage] SET',
            expect.objectContaining({
                key: 'key',
                value: 'value',
                options: { ttl: 3600 },
            })
        );
    });

    it('should use console by default', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        storage.use(loggerMiddleware({ logSet: true }));
        await storage.set('key', 'value');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});