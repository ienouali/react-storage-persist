import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageEngine } from '../../../src/engines/localStorage';

describe('LocalStorageEngine', () => {
  let engine: LocalStorageEngine;

  beforeEach(() => {
    engine = new LocalStorageEngine();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be available in browser environment', () => {
    expect(engine.isAvailable()).toBe(true);
  });

  it('should set and get items', () => {
    engine.setItem('test', 'value');
    expect(engine.getItem('test')).toBe('value');
  });

  it('should return null for non-existent keys', () => {
    expect(engine.getItem('nonexistent')).toBeNull();
  });

  it('should remove items', () => {
    engine.setItem('test', 'value');
    engine.removeItem('test');
    expect(engine.getItem('test')).toBeNull();
  });

  it('should clear all items', () => {
    engine.setItem('key1', 'value1');
    engine.setItem('key2', 'value2');
    engine.clear();
    expect(engine.getItem('key1')).toBeNull();
    expect(engine.getItem('key2')).toBeNull();
  });

  it('should list all keys', () => {
    engine.setItem('key1', 'value1');
    engine.setItem('key2', 'value2');
    const keys = engine.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });

  it('should return correct length', () => {
    expect(engine.length()).toBe(0);
    engine.setItem('key1', 'value1');
    expect(engine.length()).toBe(1);
    engine.setItem('key2', 'value2');
    expect(engine.length()).toBe(2);
  });

  it('should handle batch operations', async () => {
    const entries = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);

    await engine.setMany(entries);
    const results = await engine.getMany(['key1', 'key2']);

    expect(results.get('key1')).toBe('value1');
    expect(results.get('key2')).toBe('value2');
  });
});
