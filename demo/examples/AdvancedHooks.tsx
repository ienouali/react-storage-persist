import { useStorageState } from '../../src/react/useStorageState';
import { useStorageReducer } from '../../src/react/useStorageReducer';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

interface CounterState {
  count: number;
  history: number[];
}

type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; value: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return {
        count: state.count + 1,
        history: [...state.history, state.count + 1],
      };
    case 'decrement':
      return {
        count: state.count - 1,
        history: [...state.history, state.count - 1],
      };
    case 'reset':
      return {
        count: 0,
        history: [0],
      };
    case 'set':
      return {
        count: action.value,
        history: [...state.history, action.value],
      };
    default:
      return state;
  }
}

export function AdvancedHooks() {
  const [user, setUser, { loading, error, sync }] = useStorageState('demo.advancedUser', {
    name: '',
    age: 0,
  });

  const [counterState, dispatch] = useStorageReducer('demo.advancedCounter', counterReducer, {
    count: 0,
    history: [0],
  });

  return (
    <div className="example-container">
      <h1>Advanced Hooks</h1>
      <p>useStorageState and useStorageReducer with enhanced features</p>

      <ExampleCard title="useStorageState (with loading/error)">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                value={user.age || ''}
                onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div className="button-group">
              <button onClick={sync} className="btn btn-secondary">
                Reload from Storage
              </button>
            </div>

            {error && <div className="alert alert-error">{error.message}</div>}

            <div className="info-box">
              <h4>State Object:</h4>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </>
        )}

        <CodeBlock
          code={`const [user, setUser, { loading, error, sync }] = useStorageState(
  'user',
  { name: '', age: 0 }
);

// Access loading state
if (loading) return <Loading />;

// Handle errors
if (error) return <Error message={error.message} />;

// Manually sync from storage
<button onClick={sync}>Reload</button>`}
        />
      </ExampleCard>

      <ExampleCard title="useStorageReducer (with history)">
        <div className="counter-display">
          <h2>Count: {counterState.count}</h2>
        </div>

        <div className="button-group">
          <button onClick={() => dispatch({ type: 'decrement' })} className="btn">
            Decrement
          </button>
          <button onClick={() => dispatch({ type: 'increment' })} className="btn">
            Increment
          </button>
          <button onClick={() => dispatch({ type: 'reset' })} className="btn btn-secondary">
            Reset
          </button>
        </div>

        <div className="form-group">
          <label>Jump to value:</label>
          <input
            type="number"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt((e.target as any).value);
                dispatch({ type: 'set', value });
                (e.target as any).value = '';
              }
            }}
            placeholder="Enter number and press Enter"
            className="input"
          />
        </div>

        <div className="history-panel">
          <h4>History ({counterState.history.length} values):</h4>
          <div className="history-list">
            {counterState.history.slice(-10).map((value, index) => (
              <span key={index} className="history-item">
                {value}
              </span>
            ))}
            {counterState.history.length > 10 && <span>...</span>}
          </div>
        </div>

        <CodeBlock
          code={`interface State {
  count: number;
  history: number[];
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return {
        count: state.count + 1,
        history: [...state.history, state.count + 1]
      };
    // ... other cases
  }
}

const [state, dispatch] = useStorageReducer(
  'counter',
  reducer,
  { count: 0, history: [0] }
);`}
        />
      </ExampleCard>

      <div className="info-panel">
        <h3>🚀 Advanced Features</h3>
        <ul>
          <li>
            <strong>useStorageState:</strong> Loading states, error handling, manual sync
          </li>
          <li>
            <strong>useStorageReducer:</strong> Complex state logic, immutable updates
          </li>
          <li>Both hooks persist automatically</li>
          <li>Perfect for complex applications</li>
        </ul>
      </div>
    </div>
  );
}
