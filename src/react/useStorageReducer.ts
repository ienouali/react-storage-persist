import type { Reducer, Dispatch } from 'react';
import { useReducer, useEffect, useCallback, useRef } from 'react';
import { getDefaultStorage } from '../core';
import type { StorageOptions } from '../types';

export function useStorageReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initialState: S,
  options?: StorageOptions
): [S, Dispatch<A>] {
  const storage = getDefaultStorage();
  const isMountedRef = useRef(true);
  const isInitialized = useRef(false);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await storage.get<S>(key);
        if (savedState !== null && isMountedRef.current && !isInitialized.current) {
          const restoredState = savedState;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          Object.keys(restoredState).forEach((k) => {
            (state as any)[k] = (restoredState as any)[k];
          });
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('useStorageReducer: Failed to load state', error);
      }
    };

    loadState();
  }, [key]);

  useEffect(() => {
    if (!isInitialized.current && state !== initialState) {
      isInitialized.current = true;
    }

    if (isInitialized.current) {
      storage.set(key, state, options).catch((error) => {
        console.error('useStorageReducer: Failed to save state', error);
      });
    }
  }, [state, key, options]);

  useEffect(() => {
    const unsubscribe = storage.subscribe(key, (event) => {
      if (event.type === 'set' && isMountedRef.current && event.newValue) {
        const externalState = event.newValue as S;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        Object.keys(externalState).forEach((k) => {
          (state as any)[k] = (externalState as any)[k];
        });
      }
    });

    return unsubscribe;
  }, [key]);

  const enhancedDispatch = useCallback(
    (action: A) => {
      dispatch(action);
    },
    [dispatch]
  );

  return [state, enhancedDispatch];
}
