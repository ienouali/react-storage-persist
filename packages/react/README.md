# @storage-persist/react

React hooks for persistent state in localStorage, sessionStorage, IndexedDB or memory. TTL, middleware, cross-tab sync and TypeScript support included.

This package also re-exports everything from [`@storage-persist/core`](https://www.npmjs.com/package/@storage-persist/core), so one install is enough.

> **Preview:** 2.0 is in prerelease. Install with `@next` to try it.

## Install

```bash
npm install @storage-persist/react@next
```

Requires React 16.8 or newer.

## Quick start

```tsx
import { useStorage } from '@storage-persist/react';

function ThemeToggle() {
  const [theme, setTheme] = useStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  );
}
```

The value is saved to localStorage and stays in sync across tabs.

## Hooks

| Hook | Returns | Use it for |
|---|---|---|
| `useStorage(key, default, options?)` | `[value, setValue]` | Simple persisted values |
| `useStorageState(key, default, options?)` | `[value, setValue, { loading, error, sync }]` | Loading and error state |
| `useStorageReducer(key, reducer, initialState, options?)` | `[state, dispatch]` | Reducer-style state |
| `useStorageList(key, default?, options?)` | `[items, { push, removeAt, update, insert, move, filter, set, clear }]` | Arrays |
| `useStorageEvent(key, callback)` | `void` | Reacting to changes |
| `useStorageSync(key, default, options?)` | `[value, setValue]` | Explicit cross-tab sync |

`options` accepts `ttl` (seconds) and `silent`.

## Configure storage for your app

```tsx
import { StorageProvider } from '@storage-persist/react';

<StorageProvider config={{ engine: 'indexedDB', fallback: 'memory', prefix: 'myapp_', ttl: 3600 }}>
  <App />
</StorageProvider>
```

Hooks inside the provider use that storage. Outside a provider they use a shared default instance (localStorage).

## Middleware

```ts
import { getDefaultStorage } from '@storage-persist/react';
import { encryptionMiddleware } from '@storage-persist/react/middleware';

getDefaultStorage().use(encryptionMiddleware({ key: 'your-secret', algorithm: 'aes-gcm' }));
```

Register middleware once at startup, before your components read data. See the [core docs](https://www.npmjs.com/package/@storage-persist/core) for all middleware and engines.

## Migrating from `react-storage-persist`

The API is the same. Replace the package name in your imports:

```diff
- import { useStorage } from 'react-storage-persist';
+ import { useStorage } from '@storage-persist/react';

- import { encryptionMiddleware } from 'react-storage-persist/middleware';
+ import { encryptionMiddleware } from '@storage-persist/react/middleware';
```

## License

MIT
