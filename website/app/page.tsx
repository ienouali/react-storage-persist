'use client';

import { useState, useEffect } from 'react';
import {
  Code2,
  Database,
  Zap,
  Shield,
  Copy,
  Check,
  Github,
  Linkedin,
  Globe,
  Menu,
  X,
  Lock,
  Layers,
  Radio,
  Cog,
  BookOpen,
} from 'lucide-react';

const NAVIGATION = [
  {
    title: 'Getting Started',
    items: [
      { id: 'intro', label: 'Introduction' },
      { id: 'features', label: 'Features' },
      { id: 'install', label: 'Installation' },
      { id: 'quick-start', label: 'Quick Start' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { id: 'storage-engines', label: 'Storage Engines' },
      { id: 'fallback-system', label: 'Automatic Fallbacks' },
    ],
  },
  {
    title: 'Storage Engines',
    items: [
      { id: 'local-storage', label: 'LocalStorage' },
      { id: 'session-storage', label: 'SessionStorage' },
      { id: 'indexeddb', label: 'IndexedDB' },
      { id: 'memory-storage', label: 'Memory Storage' },
    ],
  },
  {
    title: 'React Hooks',
    items: [
      { id: 'use-storage', label: 'useStorage' },
      { id: 'use-storage-state', label: 'useStorageState' },
      { id: 'use-storage-reducer', label: 'useStorageReducer' },
      { id: 'use-storage-sync', label: 'useStorageSync' },
      { id: 'use-storage-event', label: 'useStorageEvent' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { id: 'config-options', label: 'Configuration' },
      { id: 'middleware', label: 'Middleware & Plugins' },
      { id: 'event-system', label: 'Event System' },
      { id: 'typescript', label: 'TypeScript Usage' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { id: 'form-persistence', label: 'Form Persistence' },
      { id: 'shopping-cart', label: 'Shopping Cart' },
      { id: 'multi-tab-sync', label: 'Multi-Tab Sync' },
      { id: 'large-data', label: 'Large Data (IndexedDB)' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { id: 'core-api', label: 'Core Storage API' },
      { id: 'hooks-api', label: 'Hooks API' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'testing', label: 'Testing' },
      { id: 'contributing', label: 'Contributing' },
      { id: 'developer', label: 'About Developer' },
    ],
  },
];

const CodeBlock = ({
  code,
  language = 'typescript',
  id,
  copyToClipboard,
  copiedCode,
}: {
  code: string;
  language?: string;
  id: string;
  copyToClipboard: (text: string, id: string) => void;
  copiedCode: string | null;
}) => (
  <div className="relative group">
    <div className="rounded-lg border border-border overflow-hidden bg-muted">
      <div className="bg-card px-4 py-2 text-xs font-mono text-muted-foreground uppercase border-b border-border">
        {language}
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
    <button
      onClick={() => copyToClipboard(code, id)}
      className="absolute right-4 top-12 p-2 rounded-md bg-card border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
    >
      {copiedCode === id ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  </div>
);

export default function Home() {
  const [activeSection, setActiveSection] = useState('intro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      const sectionId = section.id;
      const isNavigable = NAVIGATION.flatMap((group) => group.items).some(
        (item) => item.id === sectionId
      );
      if (isNavigable) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Database className="mr-2 h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">react-storage-persist</span>
        </div>
        <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAVIGATION.map((group) => (
            <div key={group.title}>
              <h4 className="px-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveSection(item.id);
                      }}
                      className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 lg:hidden border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">react-storage-persist</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 rounded-md hover:bg-accent"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
          {/* Introduction */}
          <section id="intro" className="space-y-6 mb-20 scroll-mt-24">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              React Storage Persist
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Persistent state management for React. Store data reliably across sessions with
              automatic fallbacks, built-in TTL, and seamless TypeScript support.
            </p>
          </section>

          {/* Features */}
          <section id="features" className="space-y-8 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: 'Unified API',
                  desc: 'Single interface for all storage engines',
                },
                {
                  icon: Radio,
                  title: 'Automatic Fallbacks',
                  desc: 'Graceful degradation when unavailable',
                },
                { icon: Clock, title: 'TTL Support', desc: 'Built-in expiration with cleanup' },
                { icon: Code2, title: 'React Hooks', desc: 'First-class React integration' },
                { icon: Shield, title: 'Type-Safe', desc: 'Full TypeScript with type inference' },
                { icon: Lock, title: 'Encryption', desc: 'Optional encryption for sensitive data' },
                { icon: Layers, title: 'Namespacing', desc: 'Prefix/suffix support for keys' },
                { icon: Radio, title: 'Event System', desc: 'Subscribe to storage changes' },
                { icon: Cog, title: 'Middleware', desc: 'Extensible plugin system' },
                { icon: BookOpen, title: 'Lightweight', desc: 'Tree-shakeable, optimized bundle' },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Installation */}
          <section id="install" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">📦 Installation</h2>
            <CodeBlock
              code="npm install react-storage-persist"
              language="bash"
              id="install-npm"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CodeBlock
                code="yarn add react-storage-persist"
                language="bash"
                id="install-yarn"
                copyToClipboard={copyToClipboard}
                copiedCode={copiedCode}
              />
              <CodeBlock
                code="pnpm add react-storage-persist"
                language="bash"
                id="install-pnpm"
                copyToClipboard={copyToClipboard}
                copiedCode={copiedCode}
              />
            </div>
          </section>

          {/* Quick Start */}
          <section id="quick-start" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🚀 Quick Start</h2>
            <p className="text-muted-foreground">
              Get up and running in seconds with our React hooks.
            </p>
            <CodeBlock
              code={`import { useStorage } from 'react-storage-persist';

function MyComponent() {
  const [name, setName] = useStorage('user.name', 'Guest');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}`}
              id="quick-start-hook"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Core API */}
          <section id="core-api" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">Core API Usage</h2>
            <CodeBlock
              code={`import { createStorage } from 'react-storage-persist/core';

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
const keys = await storage.keys();`}
              id="core-api-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* Storage Engines Overview */}
          <section id="storage-engines" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🗄️ Storage Engines</h2>
            <p className="text-muted-foreground">
              The library supports multiple storage backends with automatic fallbacks.
            </p>
          </section>

          {/* LocalStorage */}
          <section id="local-storage" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">LocalStorage</h3>
            <p className="text-muted-foreground">
              Persistent storage across browser sessions (~5-10MB limit).
            </p>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Characteristics:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Persistent across browser sessions</li>
                <li>~5-10MB storage limit</li>
                <li>Synchronous API</li>
                <li>Domain-specific</li>
              </ul>
            </div>
            <CodeBlock
              code={`const storage = createStorage({ engine: 'localStorage' });

await storage.set('settings', { theme: 'dark' });
const settings = await storage.get('settings');`}
              id="local-storage-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* SessionStorage */}
          <section id="session-storage" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">SessionStorage</h3>
            <p className="text-muted-foreground">
              Cleared when browser tab closes (~5-10MB limit).
            </p>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Characteristics:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Cleared when browser tab closes</li>
                <li>~5-10MB storage limit</li>
                <li>Synchronous API</li>
                <li>Tab-specific</li>
              </ul>
            </div>
            <CodeBlock
              code={`const storage = createStorage({ engine: 'sessionStorage' });

await storage.set('temp_data', { id: 123 });
const data = await storage.get('temp_data');`}
              id="session-storage-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* IndexedDB */}
          <section id="indexeddb" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">IndexedDB</h3>
            <p className="text-muted-foreground">
              Large-scale structured data storage with asynchronous API.
            </p>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Characteristics:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Large storage capacity (100s of MBs)</li>
                <li>Asynchronous API</li>
                <li>Structured data support</li>
                <li>Best for large datasets</li>
              </ul>
            </div>
            <CodeBlock
              code={`const storage = createStorage({ engine: 'indexedDB' });

await storage.set('large-dataset', { records: [...] });
const data = await storage.get('large-dataset');`}
              id="indexeddb-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Memory Storage */}
          <section id="memory-storage" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">Memory (Fallback)</h3>
            <p className="text-muted-foreground">Always available, perfect for SSR and testing.</p>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Characteristics:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Always available (SSR-safe)</li>
                <li>Lost on page reload</li>
                <li>Unlimited capacity (RAM-based)</li>
                <li>Useful for testing</li>
              </ul>
            </div>
            <CodeBlock
              code={`const storage = createStorage({ engine: 'memory' });

await storage.set('temp', { value: 'test' });
const temp = await storage.get('temp');`}
              id="memory-storage-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Fallback System */}
          <section id="fallback-system" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">Automatic Fallbacks</h3>
            <p className="text-muted-foreground">
              If the primary engine is unavailable, automatically falls back to the next available
              engine.
            </p>
            <CodeBlock
              code={`const storage = createStorage({
  engine: 'localStorage',
  fallback: ['sessionStorage', 'memory'],
});`}
              id="fallback-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* React Hooks */}
          <section id="use-storage" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🪝 React Hooks</h2>
            <h3 className="text-2xl font-bold">useStorage</h3>
            <p className="text-muted-foreground">
              Primary hook for persisting state to storage with automatic syncing.
            </p>
            <CodeBlock
              code={`import { useStorage } from 'react-storage-persist';

function Example() {
  const [count, setCount] = useStorage('counter', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`}
              id="use-storage-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <p className="text-muted-foreground text-sm">With options:</p>
            <CodeBlock
              code={`const [data, setData] = useStorage('key', defaultValue, {
  engine: 'localStorage',
  ttl: 3600, // Expire after 1 hour
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
});`}
              id="use-storage-options"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* useStorageState */}
          <section id="use-storage-state" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">useStorageState</h3>
            <p className="text-muted-foreground">
              Advanced state management with loading/error states and manual sync.
            </p>
            <CodeBlock
              code={`import { useStorageState } from 'react-storage-persist';

function Example() {
  const [state, setState, { loading, error, sync }] = useStorageState('user', {
    name: '',
    email: '',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        value={state.name}
        onChange={(e) => setState({ ...state, name: e.target.value })}
      />
      <button onClick={sync}>Refresh</button>
    </div>
  );
}`}
              id="use-storage-state-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* useStorageReducer */}
          <section id="use-storage-reducer" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">useStorageReducer</h3>
            <p className="text-muted-foreground">Persist reducer state automatically.</p>
            <CodeBlock
              code={`import { useStorageReducer } from 'react-storage-persist';

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
}`}
              id="use-storage-reducer-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* useStorageSync */}
          <section id="use-storage-sync" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">useStorageSync</h3>
            <p className="text-muted-foreground">
              Sync state across multiple components and browser tabs.
            </p>
            <CodeBlock
              code={`import { useStorageSync } from 'react-storage-persist';

function ComponentA() {
  const [theme, setTheme] = useStorageSync('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Switch Theme</button>;
}

function ComponentB() {
  const [theme] = useStorageSync('theme', 'light');
  return <div className={theme}>Current theme: {theme}</div>;
}`}
              id="use-storage-sync-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* useStorageEvent */}
          <section id="use-storage-event" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">useStorageEvent</h3>
            <p className="text-muted-foreground">Listen to storage change events.</p>
            <CodeBlock
              code={`import { useStorageEvent } from 'react-storage-persist';

function Example() {
  useStorageEvent('user', (event) => {
    console.log('User data changed!', event.newValue);
  });

  return <div>Listening to user changes...</div>;
}`}
              id="use-storage-event-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* Configuration */}
          <section id="config-options" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">⚙️ Configuration</h2>
            <CodeBlock
              code={`interface StorageConfig {
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
}`}
              id="config-interface"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <CodeBlock
              code={`const storage = createStorage({
  engine: 'localStorage',
  prefix: 'myapp_',
  ttl: 86400, // 24 hours
  fallback: ['sessionStorage', 'memory'],
  debug: process.env.NODE_ENV === 'development',
  onError: (error) => console.error('Storage error:', error),
});

// Set with custom TTL
await storage.set('session', userData, { ttl: 3600 }); // 1 hour`}
              id="config-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Middleware */}
          <section id="middleware" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🔌 Middleware & Plugins</h2>
            <h3 className="text-2xl font-bold">Using Middleware</h3>
            <CodeBlock
              code={`import { createStorage } from 'react-storage-persist/core';
import { encryption, compression } from 'react-storage-persist/middleware';

const storage = createStorage({ engine: 'localStorage' });

// Add encryption middleware
storage.use(encryption({ key: 'your-secret-key' }));

// Add compression middleware
storage.use(compression({ threshold: 1024 })); // Compress if > 1KB`}
              id="middleware-usage"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <h3 className="text-2xl font-bold mt-8">Creating Custom Middleware</h3>
            <CodeBlock
              code={`import type { Middleware } from 'react-storage-persist';

const logger: Middleware = {
  name: 'logger',
  beforeSet: async (key, value, options) => {
    console.log(\`Setting \${key}:\`, value);
    return value;
  },
  afterGet: async (key, value, options) => {
    console.log(\`Getting \${key}:\`, value);
    return value;
  },
  beforeRemove: async (key) => {
    console.log(\`Removing \${key}\`);
  },
};

storage.use(logger);`}
              id="custom-middleware"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Event System */}
          <section id="event-system" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🔔 Event System</h2>
            <h3 className="text-2xl font-bold">Subscribe to Changes</h3>
            <CodeBlock
              code={`// Subscribe to specific key
const unsubscribe = storage.subscribe('user', (event) => {
  console.log('User changed:', event.newValue);
});

// Subscribe to all changes
storage.subscribe((event) => {
  console.log(\`\${event.type} on \${event.key}\`);
});

// Cleanup
unsubscribe();`}
              id="event-subscribe"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* TypeScript */}
          <section id="typescript" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">📘 TypeScript Usage</h2>
            <h3 className="text-2xl font-bold">Type-Safe Storage</h3>
            <CodeBlock
              code={`interface User {
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
});`}
              id="typescript-storage"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <h3 className="text-2xl font-bold mt-8">Typed Hooks</h3>
            <CodeBlock
              code={`interface Settings {
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
}`}
              id="typescript-hooks"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* Examples */}
          <section id="form-persistence" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🎓 Advanced Examples</h2>
            <h3 className="text-2xl font-bold">Form State Persistence</h3>
            <CodeBlock
              code={`import { useStorage } from 'react-storage-persist';

function SignupForm() {
  const [formData, setFormData] = useStorage('signup-draft', {
    email: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData);
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
}`}
              id="form-persistence-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Shopping Cart */}
          <section id="shopping-cart" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">Shopping Cart with TTL</h3>
            <CodeBlock
              code={`import { useStorage } from 'react-storage-persist';

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
            {item.name} × {item.quantity} = \${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>Total: \${total.toFixed(2)}</p>
    </div>
  );
}`}
              id="shopping-cart-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Multi-Tab Sync */}
          <section id="multi-tab-sync" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">Multi-Tab Synchronization</h3>
            <CodeBlock
              code={`import { useStorageSync } from 'react-storage-persist';

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
}`}
              id="multi-tab-sync-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Large Data */}
          <section id="large-data" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">IndexedDB for Large Data</h3>
            <CodeBlock
              code={`import { createStorage } from 'react-storage-persist/core';
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
}`}
              id="large-data-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* Core API Reference */}
          <section id="core-api" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">📖 API Reference</h2>
            <h3 className="text-2xl font-bold">Core Storage API</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'createStorage(config?: StorageConfig): Storage',
                  desc: 'Create a new storage instance.',
                },
                {
                  name: 'get<T>(key: string, defaultValue?: T): Promise<T | null>',
                  desc: 'Retrieve a value from storage.',
                },
                {
                  name: 'set<T>(key: string, value: T, options?: StorageOptions): Promise<void>',
                  desc: 'Store a value in storage.',
                },
                { name: 'remove(key: string): Promise<void>', desc: 'Remove a key from storage.' },
                {
                  name: 'clear(): Promise<void>',
                  desc: 'Clear all keys (respecting prefix/suffix).',
                },
                { name: 'has(key: string): Promise<boolean>', desc: 'Check if a key exists.' },
                {
                  name: 'keys(): Promise<string[]>',
                  desc: 'Get all keys (without prefix/suffix).',
                },
                { name: 'size(): Promise<number>', desc: 'Get approximate storage size in bytes.' },
                {
                  name: 'subscribe(key: string | callback, callback?): () => void',
                  desc: 'Subscribe to storage changes. Returns unsubscribe function.',
                },
                {
                  name: 'use(middleware: Middleware): void',
                  desc: 'Add middleware to the storage instance.',
                },
              ].map(({ name, desc }) => (
                <div key={name} className="border border-border rounded-lg p-4 bg-card/50">
                  <code className="text-sm font-mono text-primary">{name}</code>
                  <p className="text-sm text-muted-foreground mt-2">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Hooks API Reference */}
          <section id="hooks-api" className="space-y-6 mb-20 scroll-mt-24">
            <h3 className="text-2xl font-bold">Hooks API</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'useStorage<T>(key, defaultValue, options?): [T, (value: T) => void]',
                  desc: 'Persist state to storage with automatic syncing.',
                },
                {
                  name: 'useStorageState<T>(key, defaultValue, options?): [T, Dispatch<T>, Utils]',
                  desc: 'Advanced state management with loading/error states.',
                },
                {
                  name: 'useStorageReducer<S, A>(key, reducer, initialState, options?): [S, Dispatch<A>]',
                  desc: 'Persist reducer state automatically.',
                },
                {
                  name: 'useStorageSync<T>(key, defaultValue, options?): [T, (value: T) => void]',
                  desc: 'Synchronize state across components and tabs.',
                },
                {
                  name: 'useStorageEvent(key, callback): void',
                  desc: 'Listen to storage change events.',
                },
              ].map(({ name, desc }) => (
                <div key={name} className="border border-border rounded-lg p-4 bg-card/50">
                  <code className="text-sm font-mono text-primary">{name}</code>
                  <p className="text-sm text-muted-foreground mt-2">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-border my-20" />

          {/* Testing */}
          <section id="testing" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🧪 Testing</h2>
            <p className="text-muted-foreground">
              The library includes comprehensive test coverage.
            </p>
            <CodeBlock
              code={`# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e`}
              language="bash"
              id="testing-commands"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
            <h3 className="text-2xl font-bold mt-8">Testing Your Code</h3>
            <CodeBlock
              code={`import { createStorage } from 'react-storage-persist/core';
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
});`}
              id="testing-example"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Contributing */}
          <section id="contributing" className="space-y-6 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">🤝 Contributing</h2>
            <p className="text-muted-foreground">
              Contributions are welcome! Here's how to get started:
            </p>
            <CodeBlock
              code={`# Clone the repository
git clone https://github.com/ienouali/react-storage-persist.git
cd react-storage-persist

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build`}
              language="bash"
              id="contributing-setup"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </section>

          {/* Developer Profile */}
          <section
            id="developer"
            className="space-y-8 mb-20 scroll-mt-24 pt-12 border-t border-border"
          >
            <h2 className="text-3xl font-bold tracking-tight">About Developer</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="space-y-4 flex-1">
                <p className="text-muted-foreground">
                  Passionate about building tools that simplify the modern web ecosystem. Created
                  react-storage-persist to provide developers with a type-safe, unified solution for
                  browser storage management.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  <a
                    href="https://github.com/ienouali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ienouali/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                  <a
                    href="https://ienouali.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm"
                  >
                    <Globe className="h-4 w-4" /> Website
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p className="text-sm font-semibold text-foreground">📄 License</p>
              <p className="text-sm text-muted-foreground">
                MIT © ienouali. This library is open source and available for everyone to use.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20 pt-12 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Made with ❤️ by <a href="https://ienouali.com">ienouali</a>
            </p>
            <p className="mt-2">
              <a
                href="https://github.com/ienouali/react-storage-persist"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

const Clock = Database;
