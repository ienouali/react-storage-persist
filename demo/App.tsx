import { useState } from 'react';
import { BasicExample } from './examples/BasicExample';
import { TodoApp } from './examples/TodoApp';
import { SettingsPanel } from './examples/SettingsPanel';
import { ShoppingCart } from './examples/ShoppingCart';
import { FormPersistence } from './examples/FormPersistence';
import { MiddlewareExample } from './examples/MiddlewareExample';
import { CrossTabSync } from './examples/CrossTabSync';
import { StorageEngines } from './examples/StorageEngines';
import { AdvancedHooks } from './examples/AdvancedHooks';
import './styles.css';

const examples = [
  { id: 'basic', name: 'Basic Usage', component: BasicExample },
  { id: 'todo', name: 'Todo App', component: TodoApp },
  { id: 'settings', name: 'Settings Panel', component: SettingsPanel },
  { id: 'cart', name: 'Shopping Cart', component: ShoppingCart },
  { id: 'form', name: 'Form Persistence', component: FormPersistence },
  { id: 'middleware', name: 'Middleware', component: MiddlewareExample },
  { id: 'sync', name: 'Cross-Tab Sync', component: CrossTabSync },
  { id: 'engines', name: 'Storage Engines', component: StorageEngines },
  { id: 'hooks', name: 'Advanced Hooks', component: AdvancedHooks },
];

export function App() {
  const [activeExample, setActiveExample] = useState('basic');

  const ActiveComponent = examples.find((ex) => ex.id === activeExample)?.component || BasicExample;

  return (
    <div className="app">
      <header className="header">
        <h1>React Storage Persist - Demo</h1>
        <p>Comprehensive browser storage management for React</p>
      </header>

      <div className="container">
        <nav className="sidebar">
          <h2>Examples</h2>
          <ul className="nav-list">
            {examples.map((example) => (
              <li key={example.id}>
                <button
                  className={`nav-button ${activeExample === example.id ? 'active' : ''}`}
                  onClick={() => setActiveExample(example.id)}
                >
                  {example.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="info-box">
            <h3>Quick Tips</h3>
            <ul>
              <li>All data persists across page refreshes</li>
              <li>Open multiple tabs to see cross-tab sync</li>
              <li>Check browser DevTools for storage inspection</li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
