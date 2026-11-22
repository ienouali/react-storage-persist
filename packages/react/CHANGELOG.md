# @storage-persist/react

## 2.0.0-next.0

### Major Changes

- 2dd869f: The library is now published as `@storage-persist/core` and `@storage-persist/react`.

  `react-storage-persist` re-exports both packages, so existing imports (including `/core`, `/react` and `/middleware`) keep working. To migrate, replace `react-storage-persist` with `@storage-persist/react` and import core and middleware APIs from `@storage-persist/core`.

### Patch Changes

- Updated dependencies [2dd869f]
  - @storage-persist/core@2.0.0-next.0
