import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '../../../src/react/useStorage';
import { resetDefaultStorage } from '../../../src/core';

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetDefaultStorage();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetDefaultStorage();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should set and get value', async () => {
    const { result } = renderHook(() => useStorage('key', ''));

    await waitFor(() => {
      expect(result.current[0]).toBe('');
    });

    await act(async () => {
      await result.current[1]('new value');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('new value');
    });
  });

  it('should persist value across remounts', async () => {
    const { result: result1, unmount } = renderHook(() => useStorage('key', 'default'));

    await act(async () => {
      await result1.current[1]('persisted');
    });

    unmount();

    const { result: result2 } = renderHook(() => useStorage('key', 'default'));

    await waitFor(() => {
      expect(result2.current[0]).toBe('persisted');
    });
  });

  it('should work with objects', async () => {
    const { result } = renderHook(() => useStorage('user', { name: '', age: 0 }));

    await waitFor(() => {
      expect(result.current[0]).toEqual({ name: '', age: 0 });
    });

    await act(async () => {
      await result.current[1]({ name: 'John', age: 30 });
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ name: 'John', age: 30 });
    });
  });

  it('should work with arrays', async () => {
    const { result } = renderHook(() => useStorage('items', [] as number[]));

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    await act(async () => {
      await result.current[1]([1, 2, 3]);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual([1, 2, 3]);
    });
  });

  it('should support functional updates', async () => {
    const { result } = renderHook(() => useStorage('count', 0));

    await act(async () => {
      await result.current[1](0);
    });

    await act(async () => {
      await result.current[1]((prev) => prev + 1);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(1);
    });

    await act(async () => {
      await result.current[1]((prev) => prev + 1);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(2);
    });
  });
});
