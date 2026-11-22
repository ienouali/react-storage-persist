import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStorage } from '../../../src/core';
import { ttlMiddleware } from '../../../src/middleware/ttl';

describe('ttlMiddleware', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ engine: 'memory' });
  });

  afterEach(() => {
    storage.destroy();
  });

  it('should have name "ttl"', () => {
    const mw = ttlMiddleware();
    expect(mw.name).toBe('ttl');
  });

  it('should pass through values on set', async () => {
    storage.use(ttlMiddleware({ defaultTTL: 60 }));

    await storage.set('key', 'value');
    const result = await storage.get('key');
    expect(result).toBe('value');
  });

  it('should call onExpire when stored value is null', async () => {
    // afterGet fires with null value when a key exists but its stored value is null
    const onExpire = vi.fn();
    storage.use(ttlMiddleware({ onExpire }));

    await storage.set('nullable', null);
    await storage.get('nullable');

    expect(onExpire).toHaveBeenCalledWith('nullable');
  });

  it('should not call onExpire for non-expired keys with a value', async () => {
    const onExpire = vi.fn();
    storage.use(ttlMiddleware({ onExpire }));

    await storage.set('alive', 'data', { ttl: 60 });
    await storage.get('alive');

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('should not call onExpire when key was never set', async () => {
    // Storage returns early (raw === null) before calling afterGet for non-existent keys
    const onExpire = vi.fn();
    storage.use(ttlMiddleware({ onExpire }));

    await storage.get('nonexistent');

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('should work without options', () => {
    const mw = ttlMiddleware();
    expect(mw).toBeDefined();
    expect(mw.beforeSet).toBeDefined();
    expect(mw.afterGet).toBeDefined();
  });

  it('should work with defaultTTL only (no onExpire)', async () => {
    storage.use(ttlMiddleware({ defaultTTL: 60 }));

    await storage.set('key', 'value');
    const result = await storage.get('key');
    expect(result).toBe('value');
  });

  it('should work with objects', async () => {
    storage.use(ttlMiddleware({ defaultTTL: 60 }));

    const data = { name: 'Alice', age: 30 };
    await storage.set('user', data);
    const result = await storage.get('user');
    expect(result).toEqual(data);
  });
});
