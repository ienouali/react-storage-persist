import { useStorage } from '../../src/react/useStorage';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

export function BasicExample() {
  const [name, setName] = useStorage('demo.name', '');
  const [count, setCount] = useStorage('demo.count', 0);
  const [isEnabled, setIsEnabled] = useStorage('demo.enabled', false);

  return (
    <div className="example-container">
      <h1>Basic Usage</h1>
      <p>Simple examples of persistent state with useStorage hook</p>

      <ExampleCard title="Text Input">
        <div className="form-group">
          <label>Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input"
          />
          <p className="hint">
            Value persists across page refreshes: <strong>{name}</strong>
          </p>
        </div>

        <CodeBlock
          code={`const [name, setName] = useStorage('demo.name', '');

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>`}
        />
      </ExampleCard>

      <ExampleCard title="Counter">
        <div className="counter-group">
          <button onClick={() => setCount((c) => c - 1)} className="btn">
            -
          </button>
          <span className="counter-value">{count}</span>
          <button onClick={() => setCount((c) => c + 1)} className="btn">
            +
          </button>
          <button onClick={() => setCount(0)} className="btn btn-secondary">
            Reset
          </button>
        </div>

        <CodeBlock
          code={`const [count, setCount] = useStorage('demo.count', 0);

<button onClick={() => setCount(c => c + 1)}>+</button>
<button onClick={() => setCount(c => c - 1)}>-</button>`}
        />
      </ExampleCard>

      <ExampleCard title="Toggle Switch">
        <div className="form-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="checkbox"
            />
            Feature Enabled: <strong>{isEnabled ? 'Yes' : 'No'}</strong>
          </label>
        </div>

        <CodeBlock
          code={`const [isEnabled, setIsEnabled] = useStorage('demo.enabled', false);

<input
  type="checkbox"
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>`}
        />
      </ExampleCard>

      <div className="info-panel">
        <h3>💡 Key Features</h3>
        <ul>
          <li>Automatic persistence to localStorage</li>
          <li>Type-safe with TypeScript</li>
          <li>Works like useState but persists</li>
          <li>Supports functional updates</li>
        </ul>
      </div>
    </div>
  );
}
