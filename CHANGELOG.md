# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-26

### Added

#### Core Features
- Complete storage engine implementations (localStorage, sessionStorage, indexedDB, memory)
- Unified storage API with automatic JSON serialization
- TTL (Time To Live) support with automatic expiration
- Cross-tab synchronization via storage events
- Event system for storage changes
- Namespace support with prefix/suffix
- Graceful fallback mechanism
- SSR-safe with memory fallback

#### React Hooks
- `useStorage` - Basic persistent state hook
- `useStorageState` - Advanced hook with loading/error states
- `useStorageReducer` - Persist reducer state
- `useStorageSync` - Explicit cross-tab synchronization

#### Middleware System
- Validation middleware with built-in validators
- Encryption middleware (base64, simple-xor)
- Compression middleware (simple-rle)
- Logger middleware with configurable logging
- TTL middleware with expiration callbacks
- Extensible middleware architecture

#### TypeScript Support
- Full TypeScript support with strict typing
- Generic type inference
- Type-safe configuration
- Comprehensive type definitions

#### Testing
- Comprehensive unit test coverage (90%+)
- Engine-specific tests
- React hooks tests
- Middleware tests
- E2E test setup with Playwright

#### Documentation
- Complete README with examples
- API reference documentation
- Contributing guidelines
- Security policy
- Code of conduct
- Full demo application

#### Build & Tooling
- Optimized Vite build configuration
- Multiple export formats (ESM, CJS)
- Tree-shakeable modules
- Source maps generation
- TypeScript declaration files
- ESLint and Prettier setup

### Developer Experience
- VS Code recommended settings
- Comprehensive demo application
- Interactive examples for all features
- Code examples with syntax highlighting
- Professional landing page structure

---

## [Unreleased]

### Planned
- React Native adapter
- Svelte/Vue adapters
- WebWorker support
- Additional middleware (rate limiting, deduplication)
- Performance optimizations
- Bundle size reduction

---

## Release Guidelines

### Major Version (x.0.0)
- Breaking changes
- Major new features
- API changes

### Minor Version (1.x.0)
- New features
- Backward-compatible changes
- New middleware

### Patch Version (1.0.x)
- Bug fixes
- Documentation updates
- Performance improvements

[1.0.0]: https://github.com/tenouali/react-storage-persist/releases/tag/v1.0.0