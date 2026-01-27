import { useState } from 'react';
import { createStorage } from '../../src/core';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

export function StorageEngines() {
  const [localValue, setLocalValue] = useState('');
  const [sessionValue, setSessionValue] = useState('');
  const [indexedValue, setIndexedValue] = useState('');
  const [memoryValue, setMemoryValue] = useState('');

  const localStorage = createStorage({ engine: 'localStorage', prefix: 'demo_local_' });
  const sessionStorage = createStorage({ engine: 'sessionStorage', prefix: 'demo_session_' });
  const indexedStorage = createStorage({ engine: 'indexedDB', prefix: 'demo_indexed_' });
  const memoryStorage = createStorage({ engine: 'memory', prefix: 'demo_memory_' });

  const testEngine = async (
    storage: ReturnType<typeof createStorage>,
    value: string,
    key: string
  ) => {
    try {
      await storage.set(key, value);
      const retrieved = await storage.get(key);
      return retrieved;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  };

  return (
    <div className="example-container">
      <h1>Storage Engines</h1>
      <p>Compare different storage backends</p>

      <ExampleCard title="localStorage (Persistent)">
        <div className="form-group">
          <label>Persists across browser sessions</label>
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder="Enter value"
            className="input"
          />
          <button
            onClick={async () => {
              const result = await testEngine(localStorage, localValue, 'test');
              window.alert(`Saved and retrieved: ${result}`);
            }}
            className="btn btn-primary"
          >
            Test localStorage
          </button>
        </div>
        <ul className="feature-list">
          <li>✅ Persists across sessions</li>
          <li>✅ ~5-10MB storage limit</li>
          <li>✅ Synchronous API</li>
          <li>✅ Domain-specific</li>
        </ul>
      </ExampleCard>

      <ExampleCard title="sessionStorage (Session Only)">
        <div className="form-group">
          <label>Cleared when tab closes</label>
          <input
            type="text"
            value={sessionValue}
            onChange={(e) => setSessionValue(e.target.value)}
            placeholder="Enter value"
            className="input"
          />
          <button
            onClick={async () => {
              const result = await testEngine(sessionStorage, sessionValue, 'test');
              window.alert(`Saved and retrieved: ${result}`);
            }}
            className="btn btn-primary"
          >
            Test sessionStorage
          </button>
        </div>
        <ul className="feature-list">
          <li>⚠️ Cleared on tab close</li>
          <li>✅ ~5-10MB storage limit</li>
          <li>✅ Synchronous API</li>
          <li>✅ Tab-specific</li>
        </ul>
      </ExampleCard>

      <ExampleCard title="IndexedDB (Large Data)">
        <div className="form-group">
          <label>Best for large datasets</label>
          <input
            type="text"
            value={indexedValue}
            onChange={(e) => setIndexedValue(e.target.value)}
            placeholder="Enter value"
            className="input"
          />
          <button
            onClick={async () => {
              const result = await testEngine(indexedStorage, indexedValue, 'test');
              window.alert(`Saved and retrieved: ${result}`);
            }}
            className="btn btn-primary"
          >
            Test IndexedDB
          </button>
        </div>
        <ul className="feature-list">
          <li>Persists across sessions</li>
          <li>Large capacity (100s of MBs)</li>
          <li>Asynchronous API</li>
          <li>Structured data support</li>
        </ul>
      </ExampleCard>

      <ExampleCard title="Memory (Fallback)">
        <div className="form-group">
          <label>In-memory only (lost on reload)</label>
          <input
            type="text"
            value={memoryValue}
            onChange={(e) => setMemoryValue(e.target.value)}
            placeholder="Enter value"
            className="input"
          />
          <button
            onClick={async () => {
              const result = await testEngine(memoryStorage, memoryValue, 'test');
              window.alert(`Saved and retrieved: ${result}`);
            }}
            className="btn btn-primary"
          >
            Test Memory
          </button>
        </div>
        <ul className="feature-list">
          <li>⚠️ Lost on page reload</li>
          <li>✅ Unlimited capacity (RAM-based)</li>
          <li>✅ Always available</li>
          <li>✅ SSR-safe fallback</li>
        </ul>
      </ExampleCard>

      <CodeBlock
        code={`import { createStorage } from 'react-storage-persist';

// localStorage
const local = createStorage({ engine: 'localStorage' });

// sessionStorage
const session = createStorage({ engine: 'sessionStorage' });

// IndexedDB
const indexed = createStorage({ engine: 'indexedDB' });

// Memory (fallback)
const memory = createStorage({ engine: 'memory' });

// With automatic fallback
const storage = createStorage({
  engine: 'localStorage',
  fallback: ['sessionStorage', 'memory']
});`}
      />

      <div className="info-panel">
        <h3>🎯 When to Use Each</h3>
        <ul>
          <li>
            <strong>localStorage:</strong> User preferences, settings
          </li>
          <li>
            <strong>sessionStorage:</strong> Temporary session data
          </li>
          <li>
            <strong>indexedDB:</strong> Large datasets, offline apps
          </li>
          <li>
            <strong>memory:</strong> SSR, private browsing fallback
          </li>
        </ul>
      </div>
    </div>
  );
}
