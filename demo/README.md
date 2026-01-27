# React Storage Persist - Demo Application

Comprehensive demo showcasing all features of react-storage-persist library.

## 🚀 Running the Demo

```bash
# Install dependencies (if not already done)
npm install

# Run the demo app
npm run demo

# Build the demo
npm run demo:build
```

The demo will be available at `http://localhost:5173`

## 📋 What's Included

### 1. **Basic Usage**
- Simple text input persistence
- Counter with functional updates
- Toggle switches

### 2. **Todo App**
- Full CRUD operations
- useStorageReducer demonstration
- Complex state management
- Automatic persistence

### 3. **Settings Panel**
- Complex object storage
- Multiple setting types
- Real-time updates
- Type-safe configuration

### 4. **Shopping Cart**
- TTL (Time To Live) demonstration
- Cart expires after 1 hour
- Quantity management
- Total calculation

### 5. **Form Persistence**
- Multi-field form
- Auto-save as you type
- Never lose form data
- Draft restoration

### 6. **Middleware**
- Validation middleware
- Encryption middleware
- Logger middleware
- Chaining multiple middleware

### 7. **Cross-Tab Sync**
- Real-time synchronization
- Open multiple tabs
- Instant updates
- Shared state

### 8. **Storage Engines**
- localStorage comparison
- sessionStorage comparison
- IndexedDB demonstration
- Memory fallback
- Engine characteristics

### 9. **Advanced Hooks**
- useStorageState with loading/error
- useStorageReducer with history
- Manual sync capability
- Complex state patterns

## 🎯 Features Demonstrated

- ✅ All storage engines
- ✅ All React hooks
- ✅ Middleware system
- ✅ TTL/Expiration
- ✅ Cross-tab synchronization
- ✅ Type safety
- ✅ Error handling
- ✅ Loading states
- ✅ Validation
- ✅ Encryption
- ✅ Form persistence
- ✅ Complex state management

## 💡 Tips

- **Multiple Tabs**: Open the Cross-Tab Sync example in multiple tabs to see real-time synchronization
- **DevTools**: Check browser DevTools → Application → Storage to see persisted data
- **Refresh**: Reload the page to verify persistence works correctly
- **Clear Data**: Use browser DevTools to clear storage if needed

## 📦 Project Structure

```
demo/
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
├── index.html              # HTML template
├── styles.css              # Global styles
├── components/
│   ├── CodeBlock.tsx       # Code display component
│   └── ExampleCard.tsx     # Card wrapper component
└── examples/
    ├── BasicExample.tsx
    ├── TodoApp.tsx
    ├── SettingsPanel.tsx
    ├── ShoppingCart.tsx
    ├── FormPersistence.tsx
    ├── MiddlewareExample.tsx
    ├── CrossTabSync.tsx
    ├── StorageEngines.tsx
    └── AdvancedHooks.tsx
```

## 🔧 Development

The demo is built with:
- React 18
- TypeScript
- Vite (for fast development)
- CSS (no framework dependencies)

## 📝 Notes

- All data is stored locally in your browser
- No backend or API calls
- Fully client-side
- Safe to experiment - just clear browser storage to reset