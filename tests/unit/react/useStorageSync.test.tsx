import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorageSync } from '../../../src/react/useStorageSync';
import { resetDefaultStorage } from '../../../src/core';

describe('useStorageSync', () => {
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
    const { result } = renderHook(() => useStorageSync('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should set and get value', async () => {
    const { result } = renderHook(() => useStorageSync('key', ''));

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
    const { result: r1, unmount } = renderHook(() => useStorageSync('key', 'default'));

    await act(async () => {
      await r1.current[1]('persisted');
    });

    unmount();

    const { result: r2 } = renderHook(() => useStorageSync('key', 'default'));

    await waitFor(() => {
      expect(r2.current[0]).toBe('persisted');
    });
  });

  it('should work with objects', async () => {
    const { result } = renderHook(() => useStorageSync('obj', { x: 0 }));

    await waitFor(() => {
      expect(result.current[0]).toEqual({ x: 0 });
    });

    await act(async () => {
      await result.current[1]({ x: 42 });
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ x: 42 });
    });
  });

  it('should support functional updates', async () => {
    const { result } = renderHook(() => useStorageSync('count', 0));

    await act(async () => {
      await result.current[1](0);
    });

    await act(async () => {
      await result.current[1]((prev) => prev + 1);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(1);
    });
  });

  it('should sync across multiple hooks with same key', async () => {
    const { result: r1 } = renderHook(() => useStorageSync('shared', 'initial'));
    const { result: r2 } = renderHook(() => useStorageSync('shared', 'initial'));

    // Wait for both hooks to initialize and subscriptions to be established
    await waitFor(() => {
      expect(r1.current[0]).toBe('initial');
      expect(r2.current[0]).toBe('initial');
    });

    // Flush pending effects so both subscriptions are fully active
    await act(async () => {});

    await act(async () => {
      await r1.current[1]('updated');
    });

    await waitFor(() => {
      expect(r1.current[0]).toBe('updated');
      expect(r2.current[0]).toBe('updated');
    });
  });

  it('should handle boolean values', async () => {
    const { result } = renderHook(() => useStorageSync('flag', false));

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });

    await act(async () => {
      await result.current[1](true);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
    });

    await act(async () => {
      await result.current[1](false);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });
  });
});
