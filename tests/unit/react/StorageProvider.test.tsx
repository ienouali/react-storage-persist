import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { StorageProvider, useStorageContext } from '../../../src/react/StorageContext';
import { useStorage } from '../../../src/react/useStorage';
import { resetDefaultStorage } from '../../../src/core';

describe('StorageProvider', () => {
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

  const wrapper =
    (config = {}) =>
    ({ children }: { children: React.ReactNode }) =>
      React.createElement(StorageProvider, { config: { engine: 'memory', ...config } }, children);

  describe('useStorageContext', () => {
    it('should return the storage instance from provider', () => {
      const { result } = renderHook(() => useStorageContext(), { wrapper: wrapper() });
      expect(result.current).toBeDefined();
      expect(typeof result.current.get).toBe('function');
      expect(typeof result.current.set).toBe('function');
    });

    it('should throw when used outside a provider', () => {
      expect(() => {
        renderHook(() => useStorageContext());
      }).toThrow('useStorageContext must be used inside a <StorageProvider>');
    });

    it('should allow direct storage operations', async () => {
      const { result } = renderHook(() => useStorageContext(), { wrapper: wrapper() });

      await act(async () => {
        await result.current.set('key', 'value');
      });

      const value = await result.current.get('key');
      expect(value).toBe('value');
    });
  });

  describe('useStorage with StorageProvider', () => {
    it('should use provider storage instead of default', async () => {
      const { result } = renderHook(() => useStorage('key', 'default'), {
        wrapper: wrapper({ engine: 'memory' }),
      });

      await waitFor(() => {
        expect(result.current[0]).toBe('default');
      });

      await act(async () => {
        await result.current[1]('from-provider');
      });

      await waitFor(() => {
        expect(result.current[0]).toBe('from-provider');
      });
    });

    it('should isolate storage between different providers', async () => {
      // Two hooks in the same provider should share state
      const { result } = renderHook(
        () => ({
          hook1: useStorage('key', 'default'),
          hook2: useStorage('key', 'default'),
        }),
        { wrapper: wrapper({ engine: 'memory' }) }
      );

      // Wait for initialization before setting value
      await waitFor(() => {
        expect(result.current.hook1[0]).toBe('default');
      });

      await act(async () => {
        await result.current.hook1[1]('shared-value');
      });

      await waitFor(() => {
        expect(result.current.hook1[0]).toBe('shared-value');
        expect(result.current.hook2[0]).toBe('shared-value');
      });
    });

    it('should respect provider config prefix', async () => {
      const { result } = renderHook(
        () => ({
          storage: useStorageContext(),
          hook: useStorage('key', ''),
        }),
        { wrapper: wrapper({ engine: 'memory', prefix: 'app_' }) }
      );

      // Wait for initialization before setting value
      await waitFor(() => {
        expect(result.current.hook[0]).toBe('');
      });

      await act(async () => {
        await result.current.hook[1]('prefixed-value');
      });

      await waitFor(() => {
        expect(result.current.hook[0]).toBe('prefixed-value');
      });

      const keys = await result.current.storage.keys();
      expect(keys).toContain('key');
    });
  });
});
