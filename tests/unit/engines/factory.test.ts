import { describe, it, expect } from 'vitest';
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
      expect(() => {
        createEngine('unknown' as any);
      }).toThrow();
    });
  });

  describe('getAvailableEngine', () => {
    it('should return first available engine', () => {
      const engine = getAvailableEngine(['localStorage', 'sessionStorage', 'memory']);
      expect(engine).not.toBeNull();
      expect(engine?.isAvailable()).toBe(true);
    });

    it('should try engines in order', () => {
      const engine = getAvailableEngine(['memory']);
      expect(engine).toBeInstanceOf(MemoryStorageEngine);
    });

    it('should return null if no engines available', () => {
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('Not available');
        },
        configurable: true,
      });

      const engine = getAvailableEngine([]);
      expect(engine).toBeNull();
    });

    it('should skip unavailable engines', () => {
      const engine = getAvailableEngine(['memory', 'localStorage']);
      expect(engine).not.toBeNull();
      expect(engine?.isAvailable()).toBe(true);
    });
  });

  describe('getAvailableEngines', () => {
    it('should return list of available engines', () => {
      const engines = getAvailableEngines();
      expect(Array.isArray(engines)).toBe(true);
      expect(engines.length).toBeGreaterThan(0);
    });

    it('should include memory engine', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('memory');
    });

    it('should include localStorage if available', () => {
      const engines = getAvailableEngines();
      if (typeof window !== 'undefined' && window.localStorage) {
        expect(engines).toContain('localStorage');
      }
    });

    it('should include sessionStorage if available', () => {
      const engines = getAvailableEngines();
      if (typeof window !== 'undefined' && window.sessionStorage) {
        expect(engines).toContain('sessionStorage');
      }
    });
  });

  describe('testEngine', () => {
    it('should test localStorage engine', async () => {
      const engine = createEngine('localStorage');
      const result = await testEngine(engine);
      expect(result).toBe(true);
    });

    it('should test sessionStorage engine', async () => {
      const engine = createEngine('sessionStorage');
      const result = await testEngine(engine);
      expect(result).toBe(true);
    });

    it('should test memory engine', async () => {
      const engine = createEngine('memory');
      const result = await testEngine(engine);
      expect(result).toBe(true);
    });

    it('should test indexedDB engine', async () => {
      const engine = createEngine('indexedDB');
      const result = await testEngine(engine);
      expect(result).toBe(true);
    });

    it('should return false for unavailable engine', async () => {
      const mockEngine = {
        name: 'mock' as any,
        isAvailable: () => true,
        getItem: () => {
          throw new Error('Failed');
        },
        setItem: () => {
          throw new Error('Failed');
        },
        removeItem: () => {},
        clear: () => {},
        keys: () => [],
        length: () => 0,
      };

      const result = await testEngine(mockEngine);
      expect(result).toBe(false);
    });
  });

  describe('Engine Integration', () => {
    it('should create different engine instances', () => {
      const engine1 = createEngine('localStorage');
      const engine2 = createEngine('localStorage');
      expect(engine1).not.toBe(engine2);
    });

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
        const result = await engine.getItem('test');
        expect(result).toBe('value');

        await engine.removeItem('test');
        expect(await engine.getItem('test')).toBeNull();
      }
    });
  });
});
