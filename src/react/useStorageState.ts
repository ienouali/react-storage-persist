import { useState, useEffect, useCallback, useRef } from 'react';
import { getDefaultStorage } from '../core';
import type { StorageOptions, StorageError } from '../types';

export interface UseStorageStateResult<T> {
    loading: boolean;
    error: StorageError | null;
    sync: () => Promise<void>;
}

export function useStorageState<T = any>(
    key: string,
    defaultValue: T,
    options?: StorageOptions
): [T, (value: T | ((prev: T) => T)) => Promise<void>, UseStorageStateResult<T>] {
    const storage = getDefaultStorage();
    const [state, setState] = useState<T>(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<StorageError | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const sync = useCallback(async () => {
        if (!isMountedRef.current) return;

        setLoading(true);
        setError(null);

        try {
            const value = await storage.get<T>(key, defaultValue);
            if (isMountedRef.current) {
                setState(value as T);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err as StorageError);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [key, defaultValue]);

    useEffect(() => {
        sync();
    }, [sync]);

    useEffect(() => {
        const unsubscribe = storage.subscribe(key, (event) => {
            if (event.type === 'set' && isMountedRef.current) {
                setState(event.newValue as T);
            }
        });

        return unsubscribe;
    }, [key]);

    const setValue = useCallback(
        async (value: T | ((prev: T) => T)) => {
            if (!isMountedRef.current) return;

            setError(null);

            try {
                const newValue = value instanceof Function ? value(state) : value;
                setState(newValue);
                await storage.set(key, newValue, options);
            } catch (err) {
                if (isMountedRef.current) {
                    setError(err as StorageError);
                }
                throw err;
            }
        },
        [key, state, options]
    );

    return [state, setValue, { loading, error, sync }];
}