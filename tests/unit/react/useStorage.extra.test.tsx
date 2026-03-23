import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '../../../src/react/useStorage';
import { resetDefaultStorage } from '../../../src/core';

describe('useStorage (advanced)', () => {
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

  it('should sync across multiple hooks with same key', async () => {
    const { result: result1 } = renderHook(() => useStorage('shared', 'initial'));
    const { result: result2 } = renderHook(() => useStorage('shared', 'initial'));

    await waitFor(() => {
      expect(result1.current[0]).toBe('initial');
      expect(result2.current[0]).toBe('initial');
    });

    await act(async () => {
      await result1.current[1]('updated');
    });

    await waitFor(() => {
      expect(result1.current[0]).toBe('updated');
      expect(result2.current[0]).toBe('updated');
    });
  });

  it('should handle different keys independently', async () => {
    const { result: result1 } = renderHook(() => useStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useStorage('key2', 'value2'));

    await waitFor(() => {
      expect(result1.current[0]).toBe('value1');
      expect(result2.current[0]).toBe('value2');
    });

    await act(async () => {
      await result1.current[1]('new1');
    });

    await waitFor(() => {
      expect(result1.current[0]).toBe('new1');
      expect(result2.current[0]).toBe('value2');
    });
  });

  it('should accept TTL options and store value', async () => {
    // Verify that TTL option is accepted and value is stored normally before expiry
    const { result } = renderHook(() => useStorage('ttlkey', 'initial', { ttl: 60 }));

    await waitFor(() => {
      expect(result.current[0]).toBe('initial');
    });

    await act(async () => {
      await result.current[1]('with-ttl');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('with-ttl');
    });

    // Value should persist immediately after setting (TTL = 60s, not yet expired)
    const raw = localStorage.getItem('ttlkey');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.value).toBe('with-ttl');
    expect(parsed.metadata.expiresAt).toBeGreaterThan(Date.now());
  });

  it('should handle null values', async () => {
    const { result } = renderHook(() => useStorage<string | null>('key', 'initial'));

    await waitFor(() => {
      expect(result.current[0]).toBe('initial');
    });

    await act(async () => {
      await result.current[1](null);
    });

    await waitFor(() => {
      expect(result.current[0]).toBeNull();
    });
  });

  it('should handle boolean values', async () => {
    const { result } = renderHook(() => useStorage('flag', false));

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

  it('should handle number values including zero', async () => {
    const { result } = renderHook(() => useStorage('count', 5));

    await waitFor(() => {
      expect(result.current[0]).toBe(5);
    });

    await act(async () => {
      await result.current[1](0);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(0);
    });
  });
});
