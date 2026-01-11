import { Storage } from './storage';
import type { StorageConfig, StorageOptions } from '../types';

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

export const get = <T = any>(key: string, defaultValue?: T) =>
  getDefaultStorage().get<T>(key, defaultValue);

export const set = <T = any>(key: string, value: T, options?: StorageOptions) =>
  getDefaultStorage().set(key, value, options);

export const remove = (key: string) => getDefaultStorage().remove(key);

export const clear = () => getDefaultStorage().clear();

export const keys = () => getDefaultStorage().keys();

export const has = (key: string) => getDefaultStorage().has(key);

export const subscribe = (
  keyOrCallback: string | ((event: any) => void),
  callback?: (event: any) => void
) => getDefaultStorage().subscribe(keyOrCallback, callback);
