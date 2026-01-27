import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexedDBEngine } from '../../../src/engines/indexedDB';

describe('IndexedDBEngine', () => {
  let engine: IndexedDBEngine;

  beforeEach(() => {
    engine = new IndexedDBEngine();
  });

  afterEach(async () => {
    await engine.clear();
    await engine.close();
  });

  it('should have correct name', () => {
    expect(engine.name).toBe('indexedDB');
  });

  it('should be available in browser environment', () => {
    expect(engine.isAvailable()).toBe(true);
  });

  it('should set and get items', async () => {
    await engine.setItem('test', 'value');
    const result = await engine.getItem('test');
    expect(result).toBe('value');
  });

  it('should return null for non-existent keys', async () => {
    const result = await engine.getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('should remove items', async () => {
    await engine.setItem('test', 'value');
    await engine.removeItem('test');
    const result = await engine.getItem('test');
    expect(result).toBeNull();
  });

  it('should clear all items', async () => {
    await engine.setItem('key1', 'value1');
    await engine.setItem('key2', 'value2');
    await engine.clear();
    expect(await engine.getItem('key1')).toBeNull();
    expect(await engine.getItem('key2')).toBeNull();
  });

  it('should list all keys', async () => {
    await engine.setItem('key1', 'value1');
    await engine.setItem('key2', 'value2');
    const keys = await engine.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });

  it('should return correct length', async () => {
    expect(await engine.length()).toBe(0);
    await engine.setItem('key1', 'value1');
    expect(await engine.length()).toBe(1);
    await engine.setItem('key2', 'value2');
    expect(await engine.length()).toBe(2);
  });

  it('should handle batch get operations', async () => {
    await engine.setItem('key1', 'value1');
    await engine.setItem('key2', 'value2');
    const results = await engine.getMany(['key1', 'key2', 'key3']);
    expect(results.get('key1')).toBe('value1');
    expect(results.get('key2')).toBe('value2');
    expect(results.get('key3')).toBeNull();
  });

  it('should handle batch set operations', async () => {
    const entries = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
    await engine.setMany(entries);
    expect(await engine.getItem('key1')).toBe('value1');
    expect(await engine.getItem('key2')).toBe('value2');
  });

  it('should handle batch remove operations', async () => {
    await engine.setItem('key1', 'value1');
    await engine.setItem('key2', 'value2');
    await engine.setItem('key3', 'value3');
    await engine.removeMany(['key1', 'key3']);
    expect(await engine.getItem('key1')).toBeNull();
    expect(await engine.getItem('key2')).toBe('value2');
    expect(await engine.getItem('key3')).toBeNull();
  });

  it('should handle special characters in values', async () => {
    const specialValue = '{"test": "value", "special": "!@#$%^&*()"}';
    await engine.setItem('special', specialValue);
    expect(await engine.getItem('special')).toBe(specialValue);
  });

  it('should handle empty string values', async () => {
    await engine.setItem('empty', '');
    expect(await engine.getItem('empty')).toBe('');
  });

  it('should handle unicode characters', async () => {
    const unicode = '你好世界 🌍 مرحبا';
    await engine.setItem('unicode', unicode);
    expect(await engine.getItem('unicode')).toBe(unicode);
  });

  it('should overwrite existing keys', async () => {
    await engine.setItem('key', 'value1');
    await engine.setItem('key', 'value2');
    expect(await engine.getItem('key')).toBe('value2');
  });

  it('should handle large values', async () => {
    const largeValue = 'x'.repeat(100000);
    await engine.setItem('large', largeValue);
    expect(await engine.getItem('large')).toBe(largeValue);
  });

  it('should handle concurrent operations', async () => {
    await Promise.all([
      engine.setItem('key1', 'value1'),
      engine.setItem('key2', 'value2'),
      engine.setItem('key3', 'value3'),
    ]);

    const results = await Promise.all([
      engine.getItem('key1'),
      engine.getItem('key2'),
      engine.getItem('key3'),
    ]);

    expect(results).toEqual(['value1', 'value2', 'value3']);
  });

  it('should close database connection', async () => {
    await engine.setItem('test', 'value');
    await engine.close();
    expect(engine).toBeDefined();
  });
});
