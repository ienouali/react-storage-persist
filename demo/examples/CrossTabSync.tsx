import { useStorageSync } from '../../src/react/useStorageSync';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

export function CrossTabSync() {
  const [message, setMessage] = useStorageSync('demo.syncMessage', '');
  const [counter, setCounter] = useStorageSync('demo.syncCounter', 0);
  const [color, setColor] = useStorageSync('demo.syncColor', '#3b82f6');
  const [isOnline, setIsOnline] = useStorageSync('demo.syncOnline', true);

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f59e0b' },
  ];

  return (
    <div className="example-container">
      <h1>Cross-Tab Synchronization</h1>
      <p>Open this page in multiple tabs to see real-time sync</p>

      <div className="alert alert-info">
        💡 Try opening this demo in multiple browser tabs or windows!
      </div>

      <ExampleCard title="Shared Message">
        <div className="form-group">
          <label>Type a message (syncs across tabs):</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something..."
            className="input"
          />
          <p className="hint">
            Current message: <strong>{message || '(empty)'}</strong>
          </p>
        </div>
      </ExampleCard>

      <ExampleCard title="Shared Counter">
        <div className="counter-group">
          <button onClick={() => setCounter((c) => c - 1)} className="btn">
            -
          </button>
          <span className="counter-value large">{counter}</span>
          <button onClick={() => setCounter((c) => c + 1)} className="btn">
            +
          </button>
          <button onClick={() => setCounter(0)} className="btn btn-secondary">
            Reset
          </button>
        </div>
        <p className="hint">Try clicking buttons in different tabs!</p>
      </ExampleCard>

      <ExampleCard title="Shared Theme Color">
        <div className="color-picker-group">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className="color-button"
              style={{
                backgroundColor: c.value,
                border: color === c.value ? '3px solid #000' : '1px solid #ddd',
              }}
              title={c.name}
            />
          ))}
        </div>
        <div
          className="color-preview"
          style={{
            backgroundColor: color,
            color: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        >
          <h3>Current Color: {colors.find((c) => c.value === color)?.name}</h3>
          <p>This box updates in all tabs</p>
        </div>
      </ExampleCard>

      <ExampleCard title="Online Status">
        <div className="status-group">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`btn ${isOnline ? 'btn-success' : 'btn-danger'}`}
          >
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </button>
          <p className="hint">Toggle in one tab to update all tabs</p>
        </div>
      </ExampleCard>

      <CodeBlock
        code={`import { useStorageSync } from 'react-storage-persist';

function App() {
  // Automatically syncs across all tabs
  const [message, setMessage] = useStorageSync('message', '');
  const [counter, setCounter] = useStorageSync('counter', 0);

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={() => setCounter(c => c + 1)}>
        Count: {counter}
      </button>
    </div>
  );
}`}
      />

      <div className="info-panel">
        <h3>🔄 How It Works</h3>
        <ul>
          <li>Uses localStorage&#39;s &#39;storage&#39; event</li>
          <li>Changes in one tab trigger updates in all tabs</li>
          <li>Instant synchronization</li>
          <li>No server or polling required</li>
        </ul>
      </div>
    </div>
  );
}
