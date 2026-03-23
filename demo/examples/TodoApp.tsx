import { useState } from 'react';
import { useStorageReducer } from '../../src/react/useStorageReducer';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
}

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number }
  | { type: 'CLEAR_COMPLETED' };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.text,
            completed: false,
            createdAt: Date.now(),
          },
        ],
      };
    case 'TOGGLE':
      return {
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    case 'DELETE':
      return {
        todos: state.todos.filter((todo) => todo.id !== action.id),
      };
    case 'CLEAR_COMPLETED':
      return {
        todos: state.todos.filter((todo) => !todo.completed),
      };
    default:
      return state;
  }
}

export function TodoApp() {
  const [state, dispatch] = useStorageReducer('demo.todos', todoReducer, { todos: [] });
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD', text: inputValue });
      setInputValue('');
    }
  };

  const completedCount = state.todos.filter((t) => t.completed).length;
  const activeCount = state.todos.length - completedCount;

  return (
    <div className="example-container">
      <h1>Todo App with useStorageReducer</h1>
      <p>Full-featured todo app with persistent state using reducer pattern</p>

      <ExampleCard title="Todo List">
        <div className="todo-input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="What needs to be done?"
            className="input"
          />
          <button onClick={handleAdd} className="btn btn-primary">
            Add
          </button>
        </div>

        <div className="todo-stats">
          <span>{activeCount} active</span>
          <span>{completedCount} completed</span>
          <span>{state.todos.length} total</span>
        </div>

        <ul className="todo-list">
          {state.todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => dispatch({ type: 'TOGGLE', id: todo.id })}
                  className="checkbox"
                />
                <span className="todo-text">{todo.text}</span>
              </label>
              <button
                onClick={() => dispatch({ type: 'DELETE', id: todo.id })}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {completedCount > 0 && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
            className="btn btn-secondary"
          >
            Clear Completed
          </button>
        )}
      </ExampleCard>

      <CodeBlock
        code={`interface TodoState {
  todos: Todo[];
}

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number };

const [state, dispatch] = useStorageReducer(
  'todos',
  todoReducer,
  { todos: [] }
);

// Add todo
dispatch({ type: 'ADD', text: 'New task' });

// Toggle completion
dispatch({ type: 'TOGGLE', id: todoId });`}
      />

      <div className="info-panel">
        <h3>✨ Features</h3>
        <ul>
          <li>Automatic persistence with reducer pattern</li>
          <li>Type-safe actions and state</li>
          <li>Perfect for complex state logic</li>
          <li>Survives page refreshes</li>
        </ul>
      </div>
    </div>
  );
}
