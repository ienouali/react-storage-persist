import { Storage } from './storage';
import type { StorageConfig, StorageOptions, StorageChangeEvent } from '../types';

let defaultInstance: Storage | null = null;

export function createStorage(config?: StorageConfig): Storage {
  return new Storage(config);
}

export function getDefaultStorage(): Storage {
  if (!defaultInstance) {
    defaultInstance = new Storage();
  }
  return defaultInstance;
}

export function resetDefaultStorage(): void {
  if (defaultInstance) {
    defaultInstance.destroy();
    defaultInstance = null;
  }
}

export const get = <T = any>(key: string, defaultValue?: T): Promise<T | null> =>
    getDefaultStorage().get<T>(key, defaultValue);

export const set = <T = any>(key: string, value: T, options?: StorageOptions): Promise<void> =>
    getDefaultStorage().set(key, value, options);

export const remove = (key: string): Promise<void> =>
    getDefaultStorage().remove(key);

export const clear = (): Promise<void> =>
    getDefaultStorage().clear();

export const keys = (): Promise<string[]> =>
    getDefaultStorage().keys();

export const has = (key: string): Promise<boolean> =>
    getDefaultStorage().has(key);

export const size = (): Promise<number> =>
    getDefaultStorage().size();

export const length = (): Promise<number> =>
    getDefaultStorage().length();

export const subscribe = (
    keyOrCallback: string | ((event: StorageChangeEvent) => void),
    callback?: (event: StorageChangeEvent) => void
): (() => void) => getDefaultStorage().subscribe(keyOrCallback, callback);

export { Storage } from './storage';