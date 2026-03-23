import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// track all 'storage' event listeners added to window so we can remove them in afterEach,
// preventing memory leaks from Storage.setupSync() leaving stale listeners across tests
const storageListeners: EventListenerOrEventListenerObject[] = [];
const originalAddEventListener = window.addEventListener.bind(window);
const originalRemoveEventListener = window.removeEventListener.bind(window);

window.addEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  if (type === 'storage') {
    storageListeners.push(listener);
  }
  return originalAddEventListener(type, listener, options);
};

window.removeEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
) => {
  if (type === 'storage') {
    const idx = storageListeners.indexOf(listener);
    if (idx !== -1) storageListeners.splice(idx, 1);
  }
  return originalRemoveEventListener(type, listener, options);
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  // remove all tracked 'storage' listeners to prevent memory leaks from Storage.setupSync()
  for (const listener of storageListeners.splice(0)) {
    originalRemoveEventListener('storage', listener);
  }
});

global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
