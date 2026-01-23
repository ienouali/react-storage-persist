import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorageState } from '../../../src/react/useStorageState';
import { resetDefaultStorage } from '../../../src/core';

describe('useStorageState', () => {
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

    it('should initialize with default value', async () => {
        const { result } = renderHook(() => useStorageState('key', 'default'));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });

        expect(result.current[0]).toBe('default');
    });

    it('should have loading state initially', () => {
        const { result } = renderHook(() => useStorageState('key', 'default'));
        expect(result.current[2].loading).toBe(true);
    });

    it('should set loading to false after initialization', async () => {
        const { result } = renderHook(() => useStorageState('key', 'default'));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });
    });

    it('should set and get value', async () => {
        const { result } = renderHook(() => useStorageState('key', ''));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });

        await act(async () => {
            await result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value');
    });

    it('should have no error on successful operations', async () => {
        const { result } = renderHook(() => useStorageState('key', 'value'));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });

        expect(result.current[2].error).toBeNull();
    });

    it('should sync value from storage', async () => {
        const { result: result1 } = renderHook(() => useStorageState('key', 'initial'));

        await waitFor(() => {
            expect(result1.current[2].loading).toBe(false);
        });

        await act(async () => {
            await result1.current[1]('updated');
        });

        const { result: result2 } = renderHook(() => useStorageState('key', 'initial'));

        await waitFor(() => {
            expect(result2.current[2].loading).toBe(false);
        });

        expect(result2.current[0]).toBe('updated');
    });

    it('should manually sync when sync is called', async () => {
        const { result: result1 } = renderHook(() => useStorageState('key', 'initial'));

        await waitFor(() => {
            expect(result1.current[2].loading).toBe(false);
        });

        const { result: result2 } = renderHook(() => useStorageState('key', 'initial'));

        await waitFor(() => {
            expect(result2.current[2].loading).toBe(false);
        });

        await act(async () => {
            await result1.current[1]('external update');
        });

        await act(async () => {
            await result2.current[2].sync();
        });

        await waitFor(() => {
            expect(result2.current[0]).toBe('external update');
        });
    });

    it('should work with objects', async () => {
        const { result } = renderHook(() =>
            useStorageState('user', { name: '', age: 0 })
        );

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
            expect(result.current[0]).toEqual({ name: '', age: 0 });
        });

        await act(async () => {
            await result.current[1]({ name: 'John', age: 30 });
        });

        await waitFor(() => {
            expect(result.current[0]).toEqual({ name: 'John', age: 30 });
        });
    });

    it('should support functional updates', async () => {
        const { result } = renderHook(() => useStorageState('count', 0));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });

        await act(async () => {
            await result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);

        await act(async () => {
            await result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(2);
    });

    it('should handle concurrent updates', async () => {
        const { result } = renderHook(() => useStorageState('key', 'initial'));

        await waitFor(() => {
            expect(result.current[2].loading).toBe(false);
        });

        await act(async () => {
            await Promise.all([
                result.current[1]('update1'),
                result.current[1]('update2'),
                result.current[1]('update3'),
            ]);
        });

        expect(result.current[0]).toBe('update3');
    });

    it('should sync across multiple hooks', async () => {
        const { result: result1 } = renderHook(() => useStorageState('shared', 'initial'));
        const { result: result2 } = renderHook(() => useStorageState('shared', 'initial'));

        await waitFor(() => {
            expect(result1.current[2].loading).toBe(false);
            expect(result2.current[2].loading).toBe(false);
        });

        await act(async () => {
            await result1.current[1]('synced');
        });

        await waitFor(() => {
            expect(result1.current[0]).toBe('synced');
            expect(result2.current[0]).toBe('synced');
        });
    });
});
