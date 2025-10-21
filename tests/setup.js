import { vi } from 'vitest';

// Mock Web Crypto API
global.crypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
  },
  getRandomValues: vi.fn(arr => arr),
};

// Mock IndexedDB
global.indexedDB = {
  open: vi.fn(),
};

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
