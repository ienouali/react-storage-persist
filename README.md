# React Storage Persist

[![npm version](https://badge.fury.io/js/react-storage-persist.svg)](https://www.npmjs.com/package/react-storage-persist)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-storage-persist)](https://bundlephobia.com/package/react-storage-persist)

A comprehensive, type-safe browser storage management library for React and TypeScript. Handle localStorage, sessionStorage, and IndexedDB with a unified API, automatic fallbacks, TTL support, and powerful React hooks.

## ✨ Features

- 🎯 **Unified API** - Single interface for localStorage, sessionStorage, IndexedDB, and in-memory storage
- 🔄 **Automatic Fallbacks** - Graceful degradation when storage is unavailable or blocked
- ⏱️ **TTL Support** - Built-in expiration with automatic cleanup
- 🎨 **React Hooks** - First-class React integration with intuitive hooks
- 🔒 **Type-Safe** - Full TypeScript support with intelligent type inference
- 🔐 **Encryption** - Optional encryption layer for sensitive data
- 📦 **Namespacing** - Prefix/suffix support to avoid key collisions
- 🔔 **Event System** - Subscribe to storage changes across tabs
- 🎭 **Middleware** - Extensible plugin system for custom functionality
- 🪶 **Lightweight** - Tree-shakeable and optimized for minimal bundle size
- 🧪 **Well-Tested** - Comprehensive test coverage with Vitest and Playwright
- 🌐 **SSR Safe** - Works seamlessly with Next.js and other SSR frameworks

---

## 📦 Installation

```bash
npm install react-storage-persist
```

```bash
yarn add react-storage-persist
```

```bash
pnpm add react-storage-persist
```

---

## 🚀 Quick Start

### Basic Hook Usage

```tsx
import { useStorage } from 'react-storage-persist';

function MyComponent() {
  const [name, setName] = useStorage('user.name', 'Guest');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}
```

### Core API Usage

```typescript
import { createStorage } from 'react-storage-persist/core';

const storage = createStorage({
  engine: 'localStorage',
  prefix: 'myapp_',
  ttl: 3600, // 1 hour in seconds
});

// Set data
await storage.set('user', { name: 'John', age: 30 });

// Get data
const user = await storage.get('user');

// Remove data
await storage.remove('user');

// Check existence
const exists = await storage.has('user');

// Get all keys
const keys = await storage.keys();
```

---

## 📚 Documentation

### Table of Contents

- [Core Concepts](#-core-concepts)
- [Storage Engines](#-storage-engines)
- [React Hooks](#-react-hooks)
- [Configuration Options](#%EF%B8%8F-configuration-options)
- [Middleware & Plugins](#-middleware--plugins)
- [Event System](#-event-system)
- [TypeScript Usage](#-typescript-usage)
- [Advanced Examples](#-advanced-examples)
- [API Reference](#-api-reference)

---

## 🎯 Core Concepts

### Storage Engines

The library supports multiple storage backends with automatic fallbacks:

- **localStorage** - Persistent storage across browser sessions
- **sessionStorage** - Session-only storage (cleared when tab closes)
- **indexedDB** - Large-scale structured data storage
- **memory** - In-memory fallback (useful for SSR or when storage is blocked)

### Automatic Fallbacks

If the primary engine is unavailable (e.g., private browsing mode), the library automatically falls back to the next available engine:

```typescript
const storage = createStorage({
  engine: 'localStorage',
  fallback: ['sessionStorage', 'memory'], // Try these in order
});
```

---

## 🗄️ Storage Engines

### LocalStorage

```typescript
import { createStorage } from 'react-storage-persist/core';

const storage = createStorage({ engine: 'localStorage' });
```

**Characteristics:**
- Persistent across browser sessions
- ~5-10MB storage limit
- Synchronous API
- Domain-specific

### SessionStorage

```typescript
const storage = createStorage({ engine: 'sessionStorage' });
```

**Characteristics:**
- Cleared when browser tab closes
- ~5-10MB storage limit
- Synchronous API
- Tab-specific

### IndexedDB

```typescript
const storage = createStorage({ engine: 'indexedDB' });
```

**Characteristics:**
- Large storage capacity (100s of MBs)
- Asynchronous API
- Structured data support
- Best for large datasets

### Memory (Fallback)

```typescript
const storage = createStorage({ engine: 'memory' });
```

**Characteristics:**
- Always available (SSR-safe)
- Lost on page reload
- Unlimited capacity (RAM-based)
- Useful for testing

---

## 🪝 React Hooks

### `useStorage`

The primary hook for persisting state to storage.

```tsx
import { useStorage } from 'react-storage-persist';

function Example() {
  const [count, setCount] = useStorage('counter', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**With options:**

```tsx
const [data, setData] = useStorage('key', defaultValue, {
  engine: 'localStorage',
  ttl: 3600, // Expire after 1 hour
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
});
```

### `useStorageState`

Similar to `useStorage` but with more control over syncing.

```tsx
import { useStorageState } from 'react-storage-persist';

function Example() {
  const [state, setState, { loading, error, sync }] = useStorageState('user', {
    name: '',
    email: '',
  });

  // Manually sync from storage
  const refresh = () => sync();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        value={state.name}
        onChange={(e) => setState({ ...state, name: e.target.value })}
      />
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### `useStorageReducer`

Persist reducer state automatically.

```tsx
import { useStorageReducer } from 'react-storage-persist';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Example() {
  const [state, dispatch] = useStorageReducer('counter', reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

### `useStorageSync`

Sync state across multiple components and browser tabs.

```tsx
import { useStorageSync } from 'react-storage-persist';

function ComponentA() {
  const [theme, setTheme] = useStorageSync('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Switch Theme</button>;
}

function ComponentB() {
  const [theme] = useStorageSync('theme', 'light');
  return <div className={theme}>Current theme: {theme}</div>;
}
```

---

## ⚙️ Configuration Options

### Storage Configuration

```typescript
interface StorageConfig {
  engine?: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';
  prefix?: string;           // Key prefix (e.g., 'myapp_')
  suffix?: string;           // Key suffix
  ttl?: number;             // Default TTL in seconds
  fallback?: StorageEngine | StorageEngine[];
  serializer?: {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  };
  encrypt?: boolean;
  encryptionKey?: string;
  compression?: boolean;
  onError?: (error: StorageError) => void;
  onChange?: (event: StorageChangeEvent) => void;
  debug?: boolean;          // Enable debug logging
}
```

### Operation Options

```typescript
interface StorageOptions {
  ttl?: number;            // Override default TTL
  encrypt?: boolean;       // Override encryption
  compress?: boolean;      // Override compression
  silent?: boolean;        // Don't emit events
}
```

**Example:**

```typescript
const storage = createStorage({
  engine: 'localStorage',
  prefix: 'myapp_',
  ttl: 86400, // 24 hours
  fallback: ['sessionStorage', 'memory'],
  debug: process.env.NODE_ENV === 'development',
  onError: (error) => console.error('Storage error:', error),
});

// Set with custom TTL
await storage.set('session', userData, { ttl: 3600 }); // 1 hour
```

---

## 🔌 Middleware & Plugins

### Using Middleware

```typescript
import { createStorage } from 'react-storage-persist/core';
import { encryption, compression } from 'react-storage-persist/middleware';

const storage = createStorage({ engine: 'localStorage' });

// Add encryption middleware
storage.use(encryption({ key: 'your-secret-key' }));

// Add compression middleware
storage.use(compression({ threshold: 1024 })); // Compress if > 1KB
```

### Creating Custom Middleware

```typescript
import type { Middleware } from 'react-storage-persist';

const logger: Middleware = {
  name: 'logger',
  beforeSet: async (key, value, options) => {
    console.log(`Setting ${key}:`, value);
    return value;
  },
  afterGet: async (key, value, options) => {
    console.log(`Getting ${key}:`, value);
    return value;
  },
  beforeRemove: async (key) => {
    console.log(`Removing ${key}`);
  },
};

storage.use(logger);
```

---

## 🔔 Event System

### Subscribe to Changes

```typescript
// Subscribe to specific key
const unsubscribe = storage.subscribe('user', (event) => {
  console.log('User changed:', event.newValue);
});

// Subscribe to all changes
storage.subscribe((event) => {
  console.log(`${event.type} on ${event.key}`);
});

// Cleanup
unsubscribe();
```

### Event Types

```typescript
type StorageEventType = 'set' | 'get' | 'remove' | 'clear' | 'error';

interface StorageChangeEvent<T = any> {
  type: StorageEventType;
  key: string;
  oldValue?: T;
  newValue?: T;
  timestamp: number;
}
```

### React Hook for Events

```tsx
import { useStorageEvent } from 'react-storage-persist';

function Example() {
  useStorageEvent('user', (event) => {
    console.log('User data changed!', event.newValue);
  });

  return <div>Listening to user changes...</div>;
}
```

---

## 📘 TypeScript Usage

### Type-Safe Storage

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Type inference
const user = await storage.get<User>('user');
// user is User | null

// With default value
const user = await storage.get<User>('user', { id: 0, name: '', email: '' });
// user is User

// Setting with type safety
await storage.set<User>('user', {
  id: 1,
  name: 'John',
  email: 'john@example.com',
});
```

### Typed Hooks

```tsx
interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
}

function Example() {
  const [settings, setSettings] = useStorage<Settings>('settings', {
    theme: 'light',
    notifications: true,
  });

  // Type-safe updates
  setSettings({ ...settings, theme: 'dark' });
}
```

---

## 🎓 Advanced Examples

### Form State Persistence

```tsx
import { useStorage } from 'react-storage-persist';

function SignupForm() {
  const [formData, setFormData] = useStorage('signup-draft', {
    email: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form
    await submitForm(formData);
    // Clear draft after successful submission
    setFormData({ email: '', username: '', password: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="Username"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Shopping Cart with TTL

```tsx
import { useStorage } from 'react-storage-persist';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function ShoppingCart() {
  const [cart, setCart] = useStorage<CartItem[]>('cart', [], {
    ttl: 86400, // Cart expires after 24 hours
  });

  const addItem = (item: CartItem) => {
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Cart ({cart.length} items)</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity} = ${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
```

### Multi-Tab Synchronization

```tsx
import { useStorageSync } from 'react-storage-persist';

function AuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useStorageSync(
    'auth.status',
    false
  );

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <div>
      <p>Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}</p>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login</button>
      )}
      <small>Open this page in multiple tabs to see sync in action!</small>
    </div>
  );
}
```

### IndexedDB for Large Data

```tsx
import { createStorage } from 'react-storage-persist/core';
import { useEffect, useState } from 'react';

const storage = createStorage({ engine: 'indexedDB' });

function DataManager() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await storage.get('large-dataset', []);
    setRecords(data);
  };

  const saveRecords = async (newRecords: any[]) => {
    await storage.set('large-dataset', newRecords);
    setRecords(newRecords);
  };

  return (
    <div>
      <h2>Managing {records.length} records</h2>
      {/* Your UI here */}
    </div>
  );
}
```

---

## 📖 API Reference

### Core Storage API

#### `createStorage(config?: StorageConfig): Storage`

Create a new storage instance.

#### `get<T>(key: string, defaultValue?: T): Promise<T | null>`

Retrieve a value from storage.

#### `set<T>(key: string, value: T, options?: StorageOptions): Promise<void>`

Store a value in storage.

#### `remove(key: string): Promise<void>`

Remove a key from storage.

#### `clear(): Promise<void>`

Clear all keys (respecting prefix/suffix).

#### `has(key: string): Promise<boolean>`

Check if a key exists.

#### `keys(): Promise<string[]>`

Get all keys (without prefix/suffix).

#### `size(): Promise<number>`

Get approximate storage size in bytes.

#### `subscribe(key: string | callback, callback?): () => void`

Subscribe to storage changes. Returns unsubscribe function.

#### `use(middleware: Middleware): void`

Add middleware to the storage instance.

### React Hooks API

#### `useStorage<T>(key, defaultValue, options?): [T, (value: T) => void]`

Persist state to storage with automatic syncing.

#### `useStorageState<T>(key, defaultValue, options?): [T, Dispatch<T>, Utils]`

Advanced state management with loading/error states.

#### `useStorageReducer<S, A>(key, reducer, initialState, options?): [S, Dispatch<A>]`

Persist reducer state automatically.

#### `useStorageSync<T>(key, defaultValue, options?): [T, (value: T) => void]`

Synchronize state across components and tabs.

#### `useStorageEvent(key, callback): void`

Listen to storage change events.

---

## 🧪 Testing

The library includes comprehensive test coverage:

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Testing Your Code

```tsx
import { createStorage } from 'react-storage-persist/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock storage for tests
const storage = createStorage({ engine: 'memory' });

test('persists user input', async () => {
  const user = userEvent.setup();
  render(<MyComponent storage={storage} />);

  const input = screen.getByRole('textbox');
  await user.type(input, 'Hello');

  const value = await storage.get('user-input');
  expect(value).toBe('Hello');
});
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ienouali/react-storage-persist.git
cd react-storage-persist

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

---

## 📄 License

MIT © [ienouali](https://github.com/ienouali)

---

## 🙏 Acknowledgments

Inspired by libraries like [localforage](https://github.com/localForage/localForage), [zustand](https://github.com/pmndrs/zustand), and [jotai](https://github.com/pmndrs/jotai).

---

## 📞 Support

- 📫 [Report Issues](https://github.com/ienouali/react-storage-persist/issues)
- 💬 [Discussions](https://github.com/ienouali/react-storage-persist/discussions)
- 📖 [Documentation](https://react-storage-persist.vercel.app/)

---

<div align="center">
Made with ❤️ by <a href="https://ienouali.com/">ienouali</a>
</div>
