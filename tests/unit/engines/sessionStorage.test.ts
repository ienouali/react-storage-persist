import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionStorageEngine } from '../../../src/engines/sessionStorage';

describe('SessionStorageEngine', () => {
  let engine: SessionStorageEngine;

  beforeEach(() => {
    engine = new SessionStorageEngine();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be available in browser environment', () => {
    expect(engine.isAvailable()).toBe(true);
  });

  it('should have correct name', () => {
    expect(engine.name).toBe('sessionStorage');
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

  it('should handle batch get operations', async () => {
    engine.setItem('key1', 'value1');
    engine.setItem('key2', 'value2');
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
    expect(engine.getItem('key1')).toBe('value1');
    expect(engine.getItem('key2')).toBe('value2');
  });

  it('should handle batch remove operations', async () => {
    engine.setItem('key1', 'value1');
    engine.setItem('key2', 'value2');
    engine.setItem('key3', 'value3');
    await engine.removeMany(['key1', 'key3']);
    expect(engine.getItem('key1')).toBeNull();
    expect(engine.getItem('key2')).toBe('value2');
    expect(engine.getItem('key3')).toBeNull();
  });

  it('should handle special characters in values', () => {
    const specialValue = '{"test": "value", "special": "!@#$%^&*()"}';
    engine.setItem('special', specialValue);
    expect(engine.getItem('special')).toBe(specialValue);
  });

  it('should handle empty string values', () => {
    engine.setItem('empty', '');
    expect(engine.getItem('empty')).toBe('');
  });

  it('should handle unicode characters', () => {
    const unicode = '你好世界 🌍 مرحبا';
    engine.setItem('unicode', unicode);
    expect(engine.getItem('unicode')).toBe(unicode);
  });

  it('should overwrite existing keys', () => {
    engine.setItem('key', 'value1');
    engine.setItem('key', 'value2');
    expect(engine.getItem('key')).toBe('value2');
  });

  it('should handle large values', () => {
    const largeValue = 'x'.repeat(10000);
    engine.setItem('large', largeValue);
    expect(engine.getItem('large')).toBe(largeValue);
  });
});
