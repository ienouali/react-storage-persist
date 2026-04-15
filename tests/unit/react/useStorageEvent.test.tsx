import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStorageEvent } from '../../../src/react/useStorageEvent';
import { resetDefaultStorage, getDefaultStorage } from '../../../src/core';

describe('useStorageEvent', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDefaultStorage();
  });

  afterEach(() => {
    localStorage.clear();
    resetDefaultStorage();
  });

  it('should call callback when a key is set', async () => {
    const callback = vi.fn();
    renderHook(() => useStorageEvent('user', callback));

    const storage = getDefaultStorage();
    await act(async () => {
      await storage.set('user', { name: 'John' });
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'set',
        key: 'user',
        newValue: { name: 'John' },
      })
    );
  });

  it('should not call callback for a different key', async () => {
    const callback = vi.fn();
    renderHook(() => useStorageEvent('user', callback));

    const storage = getDefaultStorage();
    await act(async () => {
      await storage.set('other-key', 'value');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useStorageEvent('user', callback));

    unmount();

    const storage = getDefaultStorage();
    await act(async () => {
      await storage.set('user', { name: 'John' });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should use the latest callback without re-subscribing', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useStorageEvent('user', cb), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });

    const storage = getDefaultStorage();
    await act(async () => {
      await storage.set('user', { name: 'John' });
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledOnce();
  });

  it('should call callback on key removal', async () => {
    const callback = vi.fn();
    const storage = getDefaultStorage();
    await storage.set('user', { name: 'John' });

    renderHook(() => useStorageEvent('user', callback));

    await act(async () => {
      await storage.remove('user');
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'remove', key: 'user' })
    );
  });
});
