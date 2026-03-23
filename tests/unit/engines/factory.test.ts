import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  createEngine,
  getAvailableEngine,
  getAvailableEngines,
  testEngine,
} from '../../../src/engines/factory';
import { LocalStorageEngine } from '../../../src/engines/localStorage';
import { SessionStorageEngine } from '../../../src/engines/sessionStorage';
import { IndexedDBEngine } from '../../../src/engines/indexedDB';
import { MemoryStorageEngine } from '../../../src/engines/memory';

describe('Engine Factory', () => {
  beforeEach(() => {
    // fresh IDBFactory per test prevents memory accumulation
    global.indexedDB = new IDBFactory();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('createEngine', () => {
    it('should create localStorage engine', () => {
      const engine = createEngine('localStorage');
      expect(engine).toBeInstanceOf(LocalStorageEngine);
      expect(engine.name).toBe('localStorage');
    });

    it('should create sessionStorage engine', () => {
      const engine = createEngine('sessionStorage');
      expect(engine).toBeInstanceOf(SessionStorageEngine);
      expect(engine.name).toBe('sessionStorage');
    });

    it('should create indexedDB engine', () => {
      const engine = createEngine('indexedDB');
      expect(engine).toBeInstanceOf(IndexedDBEngine);
      expect(engine.name).toBe('indexedDB');
    });

    it('should create memory engine', () => {
      const engine = createEngine('memory');
      expect(engine).toBeInstanceOf(MemoryStorageEngine);
      expect(engine.name).toBe('memory');
    });

    it('should throw error for unknown engine', () => {
      expect(() => createEngine('unknown' as any)).toThrow();
    });

    it('should create different instances each call', () => {
      const a = createEngine('memory');
      const b = createEngine('memory');
      expect(a).not.toBe(b);
    });
  });

  describe('getAvailableEngine', () => {
    it('should return first available engine', () => {
      const engine = getAvailableEngine(['localStorage', 'sessionStorage', 'memory']);
      expect(engine).not.toBeNull();
      expect(engine!.isAvailable()).toBe(true);
    });

    it('should return memory engine when requested', () => {
      const engine = getAvailableEngine(['memory']);
      expect(engine).toBeInstanceOf(MemoryStorageEngine);
    });

    it('should return null for empty list', () => {
      const engine = getAvailableEngine([]);
      expect(engine).toBeNull();
    });
  });

  describe('getAvailableEngines', () => {
    it('should return an array', () => {
      const engines = getAvailableEngines();
      expect(Array.isArray(engines)).toBe(true);
    });

    it('should include memory engine', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('memory');
    });

    it('should include localStorage in jsdom', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('localStorage');
    });

    it('should include sessionStorage in jsdom', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('sessionStorage');
    });
  });

  describe('testEngine', () => {
    it('should return true for memory engine', async () => {
      const engine = createEngine('memory');
      expect(await testEngine(engine)).toBe(true);
    });

    it('should return true for sessionStorage engine', async () => {
      const engine = createEngine('sessionStorage');
      expect(await testEngine(engine)).toBe(true);
    });

    it('should return true for localStorage engine', async () => {
      const engine = createEngine('localStorage');
      expect(await testEngine(engine)).toBe(true);
    });

    it('should return true for indexedDB engine', async () => {
      const engine = createEngine('indexedDB');
      expect(await testEngine(engine)).toBe(true);
    });

    it('should return false for a broken engine', async () => {
      const broken = {
        name: 'mock' as any,
        isAvailable: () => true,
        getItem: () => {
          throw new Error('broken');
        },
        setItem: () => {
          throw new Error('broken');
        },
        removeItem: () => {},
        clear: () => {},
        keys: () => [],
        length: () => 0,
      };
      expect(await testEngine(broken)).toBe(false);
    });
  });

  describe('Engine Integration', () => {
    it('should maintain engine independence', async () => {
      const local = createEngine('localStorage');
      const memory = createEngine('memory');

      await local.setItem('test', 'local-value');
      await memory.setItem('test', 'memory-value');

      expect(await local.getItem('test')).toBe('local-value');
      expect(await memory.getItem('test')).toBe('memory-value');
    });

    it('should handle all engines consistently', async () => {
      const engines = ['localStorage', 'sessionStorage', 'indexedDB', 'memory'] as const;

      for (const engineType of engines) {
        const engine = createEngine(engineType);
        expect(engine.isAvailable()).toBe(true);

        await engine.setItem('test', 'value');
        expect(await engine.getItem('test')).toBe('value');
        await engine.removeItem('test');
        expect(await engine.getItem('test')).toBeNull();
      }
    });
  });
});
