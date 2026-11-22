import type { StorageEngine, IStorageEngine } from '../types';
import { LocalStorageEngine } from './localStorage';
import { SessionStorageEngine } from './sessionStorage';
import { IndexedDBEngine } from './indexedDB';
import { MemoryStorageEngine } from './memory';
import { StorageError, StorageErrorCode } from '../types/errors';

export function createEngine(type: StorageEngine): IStorageEngine {
  switch (type) {
    case 'localStorage':
      return new LocalStorageEngine();
    case 'sessionStorage':
      return new SessionStorageEngine();
    case 'indexedDB':
      return new IndexedDBEngine();
    case 'memory':
      return new MemoryStorageEngine();
    default:
      throw new StorageError(`Unknown storage engine: ${type}`, StorageErrorCode.INVALID_KEY);
  }
}

export function getAvailableEngine(engines: StorageEngine[]): IStorageEngine | null {
  for (const engineType of engines) {
    const engine = createEngine(engineType);
    if (engine.isAvailable()) {
      return engine;
    }
  }
  return null;
}

export function getAvailableEngines(): StorageEngine[] {
  const allEngines: StorageEngine[] = ['localStorage', 'sessionStorage', 'indexedDB', 'memory'];

  return allEngines.filter((type) => {
    const engine = createEngine(type);
    return engine.isAvailable();
  });
}

export async function testEngine(engine: IStorageEngine): Promise<boolean> {
  try {
    const testKey = '__storage_test__';
    const testValue = 'test';

    await engine.setItem(testKey, testValue);
    const result = await engine.getItem(testKey);
    await engine.removeItem(testKey);

    return result === testValue;
  } catch {
    return false;
  }
}
