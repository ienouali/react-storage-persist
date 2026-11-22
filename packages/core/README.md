# @storage-persist/core

Persistent browser storage with one async API over localStorage, sessionStorage, IndexedDB and memory. Includes TTL, middleware (encryption, compression, validation, logging), cross-tab sync and automatic fallbacks.

Framework-agnostic. For React hooks, use [`@storage-persist/react`](https://www.npmjs.com/package/@storage-persist/react).

> **Preview:** 2.0 is in prerelease. Install with `@next` to try it.

## Install

```bash
npm install @storage-persist/core@next
```

## Quick start

```ts
import { createStorage } from '@storage-persist/core';

const storage = createStorage({
  engine: 'indexedDB',
  fallback: ['localStorage', 'memory'],
  prefix: 'myapp_',
  ttl: 3600, // default expiry in seconds
});

await storage.set('user', { name: 'Alice' });
const user = await storage.get('user');

await storage.set('session', 'abc', { ttl: 900 });
await storage.remove('session');

const unsubscribe = storage.subscribe('user', (event) => {
  console.log(event.type, event.newValue);
});
```

### Functional API

Uses a shared default instance (localStorage):

```ts
import { get, set, remove, subscribe } from '@storage-persist/core';

await set('theme', 'dark');
const theme = await get('theme', 'light');
```

## Storage instance

| Method | Description |
|---|---|
| `get(key, defaultValue?)` | Read a value |
| `set(key, value, options?)` | Write a value (`ttl`, `silent`) |
| `remove(key)` / `clear()` | Delete one key / all keys in the namespace |
| `has(key)`, `keys()`, `length()`, `size()` | Inspect stored data |
| `getMany(keys)`, `setMany(items)`, `removeMany(keys)` | Batch operations |
| `subscribe(key \| callback, callback?)` | Listen to `set`, `remove`, `clear`, `error` events |
| `use(middleware)` | Add middleware |
| `destroy()` | Remove listeners and timers |

## Middleware

```ts
import { createStorage } from '@storage-persist/core';
import { compressionMiddleware, encryptionMiddleware } from '@storage-persist/core/middleware';

const storage = createStorage();
storage.use(compressionMiddleware({ algorithm: 'gzip' }));
storage.use(encryptionMiddleware({ key: 'your-secret', algorithm: 'aes-gcm' }));
```

Middleware runs in registration order on write and in reverse order on read, so compress first, then encrypt.

Available: `encryptionMiddleware`, `compressionMiddleware`, `validationMiddleware` (with `validators`), `ttlMiddleware`, `loggerMiddleware`.

`aes-gcm` is real encryption (WebCrypto, PBKDF2-derived key). The `base64` and `simple-xor` options only obfuscate data and are deprecated.

## Engines

| Engine | Persists | Cross-tab sync |
|---|---|---|
| `localStorage` | Yes | Yes |
| `sessionStorage` | Until the tab closes | No (data is per tab) |
| `indexedDB` | Yes | Not yet |
| `memory` | No | No |

When the chosen engine isn't available (private mode, SSR), the first available `fallback` is used.

## License

MIT
