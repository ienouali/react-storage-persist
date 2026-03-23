import { useState } from 'react';
import { createStorage } from '../../src/core';
import {
  encryptionMiddleware,
  validationMiddleware,
  validators,
  loggerMiddleware,
} from '../../src/middleware';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

export function MiddlewareExample() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const storage = createStorage({ engine: 'memory' });

  storage.use(
    loggerMiddleware({
      prefix: '[Demo]',
      logSet: true,
      logger: {
        log: (...args) => addLog(JSON.stringify(args)),
        error: console.error,
      },
    })
  );

  storage.use(
    validationMiddleware({
      rules: {
        email: [validators.required(), validators.email()],
        password: [validators.required(), validators.minLength(8)],
      },
      onValidationError: (key, errors) => {
        setError(`${key}: ${errors.join(', ')}`);
      },
    })
  );

  storage.use(encryptionMiddleware({ key: 'demo-secret', algorithm: 'base64' }));

  const handleSaveEmail = async () => {
    setError('');
    try {
      await storage.set('email', email);
      addLog(`Email saved: ${email}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSavePassword = async () => {
    setError('');
    try {
      await storage.set('password', password);
      addLog(`Password saved (encrypted)`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="example-container">
      <h1>Middleware System</h1>
      <p>Layer multiple middleware for validation, encryption, and logging</p>

      <ExampleCard title="Validation + Encryption + Logging">
        <div className="form">
          <div className="form-group">
            <label>Email (validated)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input"
            />
            <button onClick={handleSaveEmail} className="btn btn-primary">
              Save Email
            </button>
          </div>

          <div className="form-group">
            <label>Password (validated + encrypted, min 8 chars)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input"
            />
            <button onClick={handleSavePassword} className="btn btn-primary">
              Save Password
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
        </div>
      </ExampleCard>

      <ExampleCard title="Operation Logs">
        <div className="log-viewer">
          {logs.length === 0 ? (
            <p className="empty-state">No logs yet. Try saving some data above.</p>
          ) : (
            <ul className="log-list">
              {logs.map((log, index) => (
                <li key={index} className="log-item">
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => setLogs([])} className="btn btn-secondary">
          Clear Logs
        </button>
      </ExampleCard>

      <CodeBlock
        code={`import { createStorage } from 'react-storage-persist';
import {
  loggerMiddleware,
  validationMiddleware,
  validators,
  encryptionMiddleware
} from 'react-storage-persist/middleware';

const storage = createStorage({ engine: 'localStorage' });

// Add middleware in order
storage.use(loggerMiddleware({ prefix: '[App]' }));

storage.use(validationMiddleware({
  rules: {
    email: [validators.required(), validators.email()],
    password: [validators.minLength(8)]
  }
}));

storage.use(encryptionMiddleware({ key: 'secret' }));

// Now all operations use all middleware!
await storage.set('email', 'user@example.com');`}
      />

      <div className="info-panel">
        <h3>🔌 Available Middleware</h3>
        <ul>
          <li>
            <strong>Validation:</strong> Validate data before storing
          </li>
          <li>
            <strong>Encryption:</strong> Encrypt sensitive data
          </li>
          <li>
            <strong>Compression:</strong> Compress large values
          </li>
          <li>
            <strong>Logger:</strong> Log all operations
          </li>
          <li>
            <strong>TTL:</strong> Auto-expire old data
          </li>
        </ul>
      </div>
    </div>
  );
}
