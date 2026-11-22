import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createStorage, getDefaultStorage } from '@storage-persist/core';
import type { Storage } from '@storage-persist/core';
import type { StorageConfig } from '@storage-persist/core';

export const StorageContext = createContext<Storage | null>(null);

export interface StorageProviderProps {
  config: StorageConfig;
  children: ReactNode;
}

export function StorageProvider({ config, children }: StorageProviderProps): JSX.Element {
  const storage = useMemo(() => createStorage(config), []);

  return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>;
}

export function useStorageContext(): Storage {
  const storage = useContext(StorageContext);
  if (!storage) {
    throw new Error('useStorageContext must be used inside a <StorageProvider>');
  }
  return storage;
}

export function useStorageInstance(): Storage {
  const contextStorage = useContext(StorageContext);
  return contextStorage ?? getDefaultStorage();
}
