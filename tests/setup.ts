import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
});

global.indexedDB = {} as IDBFactory;

// Setup console mocks
global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
};