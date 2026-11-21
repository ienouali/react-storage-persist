import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '../../../src/react/useStorage';
import { useStorageState } from '../../../src/react/useStorageState';
import { useStorageList } from '../../../src/react/useStorageList';
import { useStorageReducer } from '../../../src/react/useStorageReducer';
import { getDefaultStorage, resetDefaultStorage } from '../../../src/core';

const wrap = (value: unknown) => JSON.stringify({ value, metadata: { createdAt: Date.now() } });

const otherTabWrites = (key: string, value: unknown) =>
  act(async () => {
    window.dispatchEvent(
      new StorageEvent('storage', { key, newValue: wrap(value), storageArea: localStorage })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const otherTabRemoves = (key: string) =>
  act(async () => {
    window.dispatchEvent(
      new StorageEvent('storage', { key, newValue: null, storageArea: localStorage })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

afterEach(() => {
  resetDefaultStorage();
});

describe('hooks react to removals', () => {
  it('useStorage falls back to the default value after remove()', async () => {
    const { result } = renderHook(() => useStorage('name', 'guest'));
    await waitFor(() => expect(result.current[0]).toBe('guest'));
    await act(async () => {
      await result.current[1]('alice');
    });

    await act(async () => {
      await getDefaultStorage().remove('name');
    });

    expect(result.current[0]).toBe('guest');
  });

  it('useStorageState falls back to the default value after remove()', async () => {
    const { result } = renderHook(() => useStorageState('name', 'guest'));
    await waitFor(() => expect(result.current[2].loading).toBe(false));
    await act(async () => {
      await result.current[1]('alice');
    });

    await act(async () => {
      await getDefaultStorage().remove('name');
    });

    expect(result.current[0]).toBe('guest');
  });

  it('useStorageList falls back to the default list after remove()', async () => {
    const { result } = renderHook(() => useStorageList<number>('nums', [0]));
    await act(async () => {
      await result.current[1].push(1);
    });

    await act(async () => {
      await getDefaultStorage().remove('nums');
    });

    expect(result.current[0]).toEqual([0]);
  });
});

describe('hooks receive values from other tabs', () => {
  it('useStorage gets the plain value', async () => {
    const { result } = renderHook(() => useStorage('theme', 'light'));
    await waitFor(() => expect(result.current[0]).toBe('light'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    await otherTabWrites('theme', 'dark');
    expect(result.current[0]).toBe('dark');

    await otherTabRemoves('theme');
    expect(result.current[0]).toBe('light');
  });

  it('useStorageReducer applies remote state without writing it back', async () => {
    const reducer = (state: { n: number }, by: number) => ({ n: state.n + by });
    const { result } = renderHook(() => useStorageReducer('counter', reducer, { n: 0 }));
    await act(async () => {
      result.current[1](1);
    });
    await waitFor(async () => expect(await getDefaultStorage().get('counter')).toEqual({ n: 1 }));

    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    await otherTabWrites('counter', { n: 5 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current[0]).toEqual({ n: 5 });
    expect(setItem).not.toHaveBeenCalled();

    await otherTabRemoves('counter');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current[0]).toEqual({ n: 0 });
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
