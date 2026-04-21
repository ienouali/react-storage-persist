import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorageInstance } from './useStorageInstance';
import type { StorageOptions } from '../types';

export interface UseStorageListActions<T> {
  /** Append one item to the end of the list */
  push: (item: T) => Promise<void>;
  /** Remove the item at the given index */
  removeAt: (index: number) => Promise<void>;
  /** Update the item at the given index */
  update: (index: number, item: T) => Promise<void>;
  /** Replace the entire list */
  set: (items: T[]) => Promise<void>;
  /** Empty the list */
  clear: () => Promise<void>;
  /** Insert an item at the given index */
  insert: (index: number, item: T) => Promise<void>;
  /** Move an item from one index to another */
  move: (fromIndex: number, toIndex: number) => Promise<void>;
  /** Filter the list in-place */
  filter: (predicate: (item: T, index: number) => boolean) => Promise<void>;
}

export type UseStorageListResult<T> = [T[], UseStorageListActions<T>];

export function useStorageList<T = any>(
  key: string,
  defaultValue: T[] = [],
  options?: StorageOptions
): UseStorageListResult<T> {
  const storage = useStorageInstance();
  const [items, setItems] = useState<T[]>(defaultValue);
  const isMountedRef = useRef(true);
  const itemsRef = useRef(items);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load persisted value on mount / key change
  useEffect(() => {
    let cancelled = false;

    const loadValue = async () => {
      try {
        const value = await storage.get<T[]>(key, defaultValueRef.current);
        if (!cancelled && isMountedRef.current) {
          setItems(Array.isArray(value) ? value : defaultValueRef.current);
        }
      } catch (error) {
        console.error('useStorageList: Failed to load value', error);
        if (!cancelled && isMountedRef.current) {
          setItems(defaultValueRef.current);
        }
      }
    };

    loadValue();

    return () => {
      cancelled = true;
    };
  }, [key]);

  // Subscribe to external changes (cross-tab, StorageProvider, etc.)
  useEffect(() => {
    const unsubscribe = storage.subscribe(key, (event) => {
      if (event.type === 'set' && isMountedRef.current) {
        const incoming = event.newValue;
        setItems(Array.isArray(incoming) ? incoming : defaultValueRef.current);
      }
    });

    return unsubscribe;
  }, [key, storage]);

  // Internal helper: persist + update state.
  // We update itemsRef synchronously so that consecutive calls within the same
  // React batch (e.g. two awaited pushes inside one act()) always read the
  // latest value — React's setState is async so the ref is the source-of-truth
  // between renders.
  const persist = useCallback(
    async (nextItems: T[]): Promise<void> => {
      if (!isMountedRef.current) return;
      itemsRef.current = nextItems; // keep ref in sync immediately
      setItems(nextItems);
      await storage.set(key, nextItems, options);
    },
    [key, options, storage]
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const push = useCallback(
    async (item: T): Promise<void> => {
      await persist([...itemsRef.current, item]);
    },
    [persist]
  );

  const removeAt = useCallback(
    async (index: number): Promise<void> => {
      const next = itemsRef.current.filter((_, i) => i !== index);
      await persist(next);
    },
    [persist]
  );

  const update = useCallback(
    async (index: number, item: T): Promise<void> => {
      const next = itemsRef.current.map((existing, i) => (i === index ? item : existing));
      await persist(next);
    },
    [persist]
  );

  const set = useCallback(
    async (newItems: T[]): Promise<void> => {
      await persist(newItems);
    },
    [persist]
  );

  const clear = useCallback(async (): Promise<void> => {
    await persist([]);
  }, [persist]);

  const insert = useCallback(
    async (index: number, item: T): Promise<void> => {
      const next = [...itemsRef.current];
      next.splice(index, 0, item);
      await persist(next);
    },
    [persist]
  );

  const move = useCallback(
    async (fromIndex: number, toIndex: number): Promise<void> => {
      const next = [...itemsRef.current];
      const [moved] = next.splice(fromIndex, 1) as [T];
      next.splice(toIndex, 0, moved);
      await persist(next);
    },
    [persist]
  );

  const filter = useCallback(
    async (predicate: (item: T, index: number) => boolean): Promise<void> => {
      await persist(itemsRef.current.filter(predicate));
    },
    [persist]
  );

  const actions: UseStorageListActions<T> = {
    push,
    removeAt,
    update,
    set,
    clear,
    insert,
    move,
    filter,
  };

  return [items, actions];
}
