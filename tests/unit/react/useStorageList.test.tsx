import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorageList } from '../../../src/react/useStorageList';
import { resetDefaultStorage } from '../../../src/core';

describe('useStorageList', () => {
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

  // ── Initialization ─────────────────────────────────────────────────────────

  it('initializes with the default value', () => {
    const { result } = renderHook(() => useStorageList('list', [1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it('initializes with an empty array when no default is given', () => {
    const { result } = renderHook(() => useStorageList('list'));
    expect(result.current[0]).toEqual([]);
  });

  it('loads a previously persisted list on remount', async () => {
    const { result: r1, unmount } = renderHook(() =>
      useStorageList<string>('fruits', [])
    );

    await waitFor(() => expect(r1.current[0]).toEqual([]));

    await act(async () => {
      await r1.current[1].push('apple');
      await r1.current[1].push('banana');
    });

    unmount();
    resetDefaultStorage();

    const { result: r2 } = renderHook(() => useStorageList<string>('fruits', []));

    await waitFor(() => expect(r2.current[0]).toEqual(['apple', 'banana']));
  });

  // ── push ──────────────────────────────────────────────────────────────────

  it('push: appends an item to the list', async () => {
    const { result } = renderHook(() => useStorageList<number>('nums', []));
    await waitFor(() => expect(result.current[0]).toEqual([]));

    await act(async () => {
      await result.current[1].push(42);
    });

    expect(result.current[0]).toEqual([42]);

    await act(async () => {
      await result.current[1].push(99);
    });

    expect(result.current[0]).toEqual([42, 99]);
  });

  // ── removeAt ─────────────────────────────────────────────────────────────

  it('removeAt: removes the item at the given index', async () => {
    const { result } = renderHook(() => useStorageList<string>('items', ['a', 'b', 'c']));
    await waitFor(() => expect(result.current[0]).toEqual(['a', 'b', 'c']));

    await act(async () => {
      await result.current[1].removeAt(1);
    });

    expect(result.current[0]).toEqual(['a', 'c']);
  });

  it('removeAt: does nothing when index is out of bounds', async () => {
    const { result } = renderHook(() => useStorageList<string>('items', ['a', 'b']));
    await waitFor(() => expect(result.current[0]).toEqual(['a', 'b']));

    await act(async () => {
      await result.current[1].removeAt(99);
    });

    expect(result.current[0]).toEqual(['a', 'b']);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('update: replaces the item at the given index', async () => {
    const { result } = renderHook(() =>
      useStorageList<string>('items', ['a', 'b', 'c'])
    );
    await waitFor(() => expect(result.current[0]).toEqual(['a', 'b', 'c']));

    await act(async () => {
      await result.current[1].update(1, 'B');
    });

    expect(result.current[0]).toEqual(['a', 'B', 'c']);
  });

  // ── set ───────────────────────────────────────────────────────────────────

  it('set: replaces the entire list', async () => {
    const { result } = renderHook(() =>
      useStorageList<number>('nums', [1, 2, 3])
    );
    await waitFor(() => expect(result.current[0]).toEqual([1, 2, 3]));

    await act(async () => {
      await result.current[1].set([10, 20]);
    });

    expect(result.current[0]).toEqual([10, 20]);
  });

  // ── clear ─────────────────────────────────────────────────────────────────

  it('clear: empties the list', async () => {
    const { result } = renderHook(() =>
      useStorageList<number>('nums', [1, 2, 3])
    );
    await waitFor(() => expect(result.current[0]).toEqual([1, 2, 3]));

    await act(async () => {
      await result.current[1].clear();
    });

    expect(result.current[0]).toEqual([]);
  });

  // ── insert ────────────────────────────────────────────────────────────────

  it('insert: adds an item at the given index', async () => {
    const { result } = renderHook(() =>
      useStorageList<string>('items', ['a', 'c'])
    );
    await waitFor(() => expect(result.current[0]).toEqual(['a', 'c']));

    await act(async () => {
      await result.current[1].insert(1, 'b');
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  it('insert: prepends when index is 0', async () => {
    const { result } = renderHook(() =>
      useStorageList<string>('items', ['b', 'c'])
    );
    await waitFor(() => expect(result.current[0]).toEqual(['b', 'c']));

    await act(async () => {
      await result.current[1].insert(0, 'a');
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  // ── move ──────────────────────────────────────────────────────────────────

  it('move: moves an item from one index to another', async () => {
    const { result } = renderHook(() =>
      useStorageList<string>('items', ['a', 'b', 'c', 'd'])
    );
    await waitFor(() => expect(result.current[0]).toEqual(['a', 'b', 'c', 'd']));

    await act(async () => {
      await result.current[1].move(0, 2);
    });

    expect(result.current[0]).toEqual(['b', 'c', 'a', 'd']);
  });

  // ── filter ────────────────────────────────────────────────────────────────

  it('filter: keeps only items matching the predicate', async () => {
    const { result } = renderHook(() =>
      useStorageList<number>('nums', [1, 2, 3, 4, 5])
    );
    await waitFor(() => expect(result.current[0]).toEqual([1, 2, 3, 4, 5]));

    await act(async () => {
      await result.current[1].filter((n) => n % 2 === 0);
    });

    expect(result.current[0]).toEqual([2, 4]);
  });

  // ── Persistence after each action ────────────────────────────────────────

  it('persists the list after push and reloads on remount', async () => {
    const { result: r1, unmount } = renderHook(() =>
      useStorageList<string>('todos', [])
    );
    await waitFor(() => expect(r1.current[0]).toEqual([]));

    await act(async () => {
      await r1.current[1].push('task 1');
      await r1.current[1].push('task 2');
    });

    expect(r1.current[0]).toEqual(['task 1', 'task 2']);
    unmount();
    resetDefaultStorage();

    const { result: r2 } = renderHook(() => useStorageList<string>('todos', []));
    await waitFor(() => expect(r2.current[0]).toEqual(['task 1', 'task 2']));
  });

  // ── Object items ─────────────────────────────────────────────────────────

  it('handles object items correctly', async () => {
    interface Todo { id: number; text: string; done: boolean }

    const { result } = renderHook(() =>
      useStorageList<Todo>('todos', [])
    );
    await waitFor(() => expect(result.current[0]).toEqual([]));

    await act(async () => {
      await result.current[1].push({ id: 1, text: 'Buy milk', done: false });
      await result.current[1].push({ id: 2, text: 'Read book', done: false });
    });

    expect(result.current[0]).toHaveLength(2);

    await act(async () => {
      await result.current[1].update(0, { id: 1, text: 'Buy milk', done: true });
    });

    expect(result.current[0][0].done).toBe(true);

    await act(async () => {
      await result.current[1].filter((todo) => !todo.done);
    });

    expect(result.current[0]).toEqual([{ id: 2, text: 'Read book', done: false }]);
  });
});
