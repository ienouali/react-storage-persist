---
"@storage-persist/core": major
"@storage-persist/react": major
"react-storage-persist": minor
---

The library is now published as `@storage-persist/core` and `@storage-persist/react`.

`react-storage-persist` re-exports both packages, so existing imports (including `/core`, `/react` and `/middleware`) keep working. To migrate, replace `react-storage-persist` with `@storage-persist/react` and import core and middleware APIs from `@storage-persist/core`.
