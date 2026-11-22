import { useStorage } from './useStorage';
import type { StorageOptions } from '@storage-persist/core';

export function useStorageSync<T = any>(
  key: string,
  defaultValue: T,
  options?: StorageOptions
): [T, (value: T | ((prev: T) => T)) => Promise<void>] {
  return useStorage<T>(key, defaultValue, options);
}
