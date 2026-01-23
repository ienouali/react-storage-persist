import { useState, useEffect, useCallback, useRef } from 'react';
import { getDefaultStorage } from '../core';
import type { StorageOptions } from '../types';

export function useStorage<T = any>(
    key: string,
    defaultValue: T,
    options?: StorageOptions
): [T, (value: T | ((prev: T) => T)) => Promise<void>] {
    const storage = getDefaultStorage();
    const [state, setState] = useState<T>(defaultValue);
    const [isInitialized, setIsInitialized] = useState(false);
    const isMountedRef = useRef(true);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadValue = async () => {
            try {
                const value = await storage.get<T>(key, defaultValue);
                if (!cancelled && isMountedRef.current) {
                    setState(value as T);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('useStorage: Failed to load value', error);
                if (!cancelled && isMountedRef.current) {
                    setState(defaultValue);
                    setIsInitialized(true);
                }
            }
        };

        loadValue();

        return () => {
            cancelled = true;
        };
    }, [key]);

    useEffect(() => {
        if (!isInitialized) return;

        const unsubscribe = storage.subscribe(key, (event) => {
            if (event.type === 'set' && isMountedRef.current) {
                setState(event.newValue as T);
            }
        });

        return unsubscribe;
    }, [key, isInitialized]);

    const setValue = useCallback(
        async (value: T | ((prev: T) => T)) => {
            if (!isMountedRef.current) return;

            try {
                const newValue = value instanceof Function ? value(stateRef.current) : value;
                setState(newValue);
                await storage.set(key, newValue, options);
            } catch (error) {
                console.error('useStorage: Failed to set value', error);
            }
        },
        [key, options]
    );

    return [state, setValue];
}
