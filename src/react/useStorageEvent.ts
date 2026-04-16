import { useEffect, useRef } from 'react';
import { useStorageInstance } from './useStorageInstance';
import type { StorageChangeEvent } from '../types';

export function useStorageEvent(key: string, callback: (event: StorageChangeEvent) => void): void {
  const storage = useStorageInstance();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = storage.subscribe(key, (event) => {
      callbackRef.current(event);
    });

    return unsubscribe;
  }, [key, storage]);
}
