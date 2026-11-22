# react-storage-persist

**This package has moved to [`@storage-persist/react`](https://www.npmjs.com/package/@storage-persist/react).**

Starting with 1.3, `react-storage-persist` re-exports `@storage-persist/react` and `@storage-persist/core`, so your existing imports (including `/core`, `/react` and `/middleware`) keep working.

## Migrate

The API is the same. Install the new package and update your imports:

```bash
npm install @storage-persist/react
```

```diff
- import { useStorage } from 'react-storage-persist';
+ import { useStorage } from '@storage-persist/react';
```

| Old import | New import |
|---|---|
| `react-storage-persist` | `@storage-persist/react` |
| `react-storage-persist/react` | `@storage-persist/react` |
| `react-storage-persist/core` | `@storage-persist/core` |
| `react-storage-persist/middleware` | `@storage-persist/react/middleware` |

## License

MIT
