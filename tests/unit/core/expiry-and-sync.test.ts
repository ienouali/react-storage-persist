import { describe, it, expect, vi, afterEach } from 'vitest';
import { Storage } from '../../../src/core/storage';
import type { StorageChangeEvent } from '../../../src/types';

const wrap = (value: unknown) => JSON.stringify({ value, metadata: { createdAt: Date.now() } });

const countEngineReads = (storage: Storage) => {
  const engine = (storage as any).engine;
  const original = engine.getItem.bind(engine);
  const counter = { reads: 0 };
  engine.getItem = (key: string) => {
    counter.reads++;
    if (counter.reads > 50) throw new Error('runaway recursion');
    return original(key);
  };
  return counter;
};

describe('TTL expiry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the default and deletes an expired key without recursing', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const storage = new Storage({ engine: 'memory' });
    const onError = vi.fn();
    (storage as any).config.onError = onError;

    await storage.set('session', 'token', { ttl: 1 });
    vi.setSystemTime(Date.now() + 2000);
    const counter = countEngineReads(storage);

    expect(await storage.get('session', 'fallback')).toBe('fallback');
    expect(counter.reads).toBe(1);
    expect(onError).not.toHaveBeenCalled();
    expect(await storage.keys()).toEqual([]);
    storage.destroy();
  });

  it('emits a remove event when an expired key is read', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const storage = new Storage({ engine: 'memory' });
    const handler = vi.fn();

    await storage.set('k', 1, { ttl: 1 });
    storage.subscribe('k', handler);
    vi.setSystemTime(Date.now() + 2000);
    await storage.get('k');

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'remove', key: 'k' }));
    storage.destroy();
  });

  it('removes an expired key explicitly without recursing', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const storage = new Storage({ engine: 'memory' });

    await storage.set('k', 1, { ttl: 1 });
    vi.setSystemTime(Date.now() + 2000);
    countEngineReads(storage);

    await expect(storage.remove('k')).resolves.toBeUndefined();
    expect(await storage.keys()).toEqual([]);
    storage.destroy();
  });

  it('keeps non-expired values readable', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const storage = new Storage({ engine: 'memory' });

    await storage.set('k', 'v', { ttl: 10 });
    vi.setSystemTime(Date.now() + 5000);

    expect(await storage.get('k')).toBe('v');
    storage.destroy();
  });

  it('does not emit a get event or run afterGet as a side effect of set', async () => {
    const storage = new Storage({ engine: 'memory' });
    const afterGet = vi.fn(async (_key: string, value: unknown) => value);
    storage.use({ name: 'spy', afterGet: afterGet as any });
    const types: string[] = [];
    storage.subscribe((event) => types.push(event.type));

    await storage.set('x', 1);
    await storage.set('x', 2);

    expect(types).toEqual(['set', 'set']);
    storage.destroy();
  });
});

describe('cross-tab sync', () => {
  const dispatch = (init: StorageEventInit) =>
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, ...init }));

  it('delivers the stored value, not the internal wrapper', () => {
    const storage = new Storage({ engine: 'localStorage', prefix: 'app_' });
    const events: StorageChangeEvent[] = [];
    storage.subscribe('theme', (event) => events.push(event));

    dispatch({ key: 'app_theme', oldValue: wrap('light'), newValue: wrap('dark') });

    return vi.waitFor(() => {
      expect(events).toEqual([
        expect.objectContaining({ type: 'set', key: 'theme', oldValue: 'light', newValue: 'dark' }),
      ]);
      storage.destroy();
    });
  });

  it('reports a removal in another tab as a remove event', () => {
    const storage = new Storage({ engine: 'localStorage', prefix: 'app_' });
    const events: StorageChangeEvent[] = [];
    storage.subscribe('theme', (event) => events.push(event));

    dispatch({ key: 'app_theme', oldValue: wrap('dark'), newValue: null });

    return vi.waitFor(() => {
      expect(events).toEqual([
        expect.objectContaining({ type: 'remove', key: 'theme', oldValue: 'dark' }),
      ]);
      storage.destroy();
    });
  });

  it('keeps a stored null as a set, not a remove', () => {
    const storage = new Storage({ engine: 'localStorage' });
    const events: StorageChangeEvent[] = [];
    storage.subscribe('k', (event) => events.push(event));

    dispatch({ key: 'k', newValue: wrap(null) });

    return vi.waitFor(() => {
      expect(events).toEqual([expect.objectContaining({ type: 'set', newValue: null })]);
      storage.destroy();
    });
  });

  it('notifies key subscribers when another tab clears storage', () => {
    const storage = new Storage({ engine: 'localStorage' });
    const keyEvents: StorageChangeEvent[] = [];
    const allEvents: StorageChangeEvent[] = [];
    storage.subscribe('a', (event) => keyEvents.push(event));
    storage.subscribe((event) => allEvents.push(event));

    dispatch({ key: null });

    expect(keyEvents).toEqual([expect.objectContaining({ type: 'remove', key: 'a' })]);
    expect(allEvents.at(-1)).toEqual(expect.objectContaining({ type: 'clear', key: '*' }));
    storage.destroy();
  });

  it('runs afterGet middleware on values from other tabs', () => {
    const storage = new Storage({ engine: 'localStorage' });
    storage.use({
      name: 'upper',
      afterGet: (async (_key: string, value: unknown) =>
        typeof value === 'string' ? value.toUpperCase() : value) as any,
    });
    const events: StorageChangeEvent[] = [];
    storage.subscribe('k', (event) => events.push(event));

    dispatch({ key: 'k', newValue: wrap('hi') });

    return vi.waitFor(() => {
      expect(events[0]?.newValue).toBe('HI');
      storage.destroy();
    });
  });

  it('ignores keys that were not written by the library', async () => {
    const storage = new Storage({ engine: 'localStorage' });
    const handler = vi.fn();
    storage.subscribe(handler);

    dispatch({ key: 'foreign', newValue: 'plain text' });
    dispatch({ key: 'foreign-json', newValue: '42' });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(handler).not.toHaveBeenCalled();
    storage.destroy();
  });

  it('ignores events from a different storage area', async () => {
    const storage = new Storage({ engine: 'localStorage' });
    const handler = vi.fn();
    storage.subscribe(handler);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'k', newValue: wrap(1), storageArea: sessionStorage })
    );
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(handler).not.toHaveBeenCalled();
    storage.destroy();
  });

  it('does not listen for storage events on non Web Storage engines', async () => {
    const storage = new Storage({ engine: 'memory' });
    const handler = vi.fn();
    storage.subscribe(handler);

    dispatch({ key: 'k', newValue: wrap(1) });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(handler).not.toHaveBeenCalled();
    storage.destroy();
  });

  it('removes its window listener on destroy', async () => {
    const storage = new Storage({ engine: 'localStorage' });
    const onChange = vi.fn();
    (storage as any).config.onChange = onChange;

    storage.destroy();
    dispatch({ key: 'k', newValue: wrap(1) });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('middleware ordering', () => {
  it('unwinds afterGet in reverse registration order', async () => {
    const storage = new Storage({ engine: 'memory' });
    const order: string[] = [];
    for (const name of ['first', 'second']) {
      storage.use({
        name,
        afterGet: (async (_key: string, value: unknown) => {
          order.push(name);
          return value;
        }) as any,
      });
    }

    await storage.set('k', 1);
    await storage.get('k');

    expect(order).toEqual(['second', 'first']);
    storage.destroy();
  });
});
