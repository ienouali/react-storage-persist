import type { Reducer, Dispatch } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorageInstance } from './useStorageInstance';
import type { StorageOptions } from '../types';

export function useStorageReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initialState: S,
  options?: StorageOptions
): [S, Dispatch<A>] {
  const storage = useStorageInstance();
  const [state, setState] = useState<S>(initialState);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);
  const hasDispatchedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await storage.get<S>(key);
        if (saved !== null && isMountedRef.current) {
          setState(saved);
        }
      } catch (error) {
        console.error('useStorageReducer: Failed to load state', error);
      } finally {
        if (isMountedRef.current) {
          isInitializedRef.current = true;
        }
      }
    };

    load();
  }, [key]);

  useEffect(() => {
    if (!isInitializedRef.current && !hasDispatchedRef.current) return;
    storage.set(key, state, options).catch((error) => {
      console.error('useStorageReducer: Failed to save state', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, key, options]);

  useEffect(() => {
    const unsubscribe = storage.subscribe(key, (event) => {
      if (event.type === 'set' && isMountedRef.current && event.newValue !== undefined) {
        setState(event.newValue as S);
      }
    });

    return unsubscribe;
  }, [key]);

  const dispatch = useCallback(
    (action: A) => {
      hasDispatchedRef.current = true;
      setState((prev) => reducer(prev, action));
    },
    [reducer]
  );

  return [state, dispatch];
}
