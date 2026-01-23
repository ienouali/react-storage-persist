import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorageReducer } from '../../../src/react/useStorageReducer';
import { resetDefaultStorage } from '../../../src/core';

type CounterState = { count: number };
type CounterAction =
    | { type: 'increment' }
    | { type: 'decrement' }
    | { type: 'set'; payload: number };

const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 };
        case 'decrement':
            return { count: state.count - 1 };
        case 'set':
            return { count: action.payload };
        default:
            return state;
    }
};

describe('useStorageReducer', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        resetDefaultStorage();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        resetDefaultStorage();
    });

    it('should initialize with initial state', () => {
        const { result } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        expect(result.current[0].count).toBe(0);
    });

    it('should handle increment action', () => {
        const { result } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        act(() => {
            result.current[1]({ type: 'increment' });
        });

        expect(result.current[0].count).toBe(1);
    });

    it('should handle decrement action', () => {
        const { result } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 5 })
        );

        act(() => {
            result.current[1]({ type: 'decrement' });
        });

        expect(result.current[0].count).toBe(4);
    });

    it('should handle set action', () => {
        const { result } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        act(() => {
            result.current[1]({ type: 'set', payload: 42 });
        });

        expect(result.current[0].count).toBe(42);
    });

    it('should persist state across remounts', async () => {
        const { result, unmount } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        act(() => {
            result.current[1]({ type: 'set', payload: 10 });
        });

        await waitFor(() => {
            expect(result.current[0].count).toBe(10);
        });

        unmount();

        const { result: result2 } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        await waitFor(() => {
            expect(result2.current[0].count).toBe(10);
        });
    });

    it('should handle multiple actions', () => {
        const { result } = renderHook(() =>
            useStorageReducer('counter', counterReducer, { count: 0 })
        );

        act(() => {
            result.current[1]({ type: 'increment' });
            result.current[1]({ type: 'increment' });
            result.current[1]({ type: 'increment' });
        });

        expect(result.current[0].count).toBe(3);
    });

    it('should work with complex state', () => {
        type TodoState = {
            todos: Array<{ id: number; text: string; done: boolean }>;
        };
        type TodoAction =
            | { type: 'add'; text: string }
            | { type: 'toggle'; id: number }
            | { type: 'remove'; id: number };

        const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
            switch (action.type) {
                case 'add':
                    return {
                        todos: [...state.todos, { id: Date.now(), text: action.text, done: false }],
                    };
                case 'toggle':
                    return {
                        todos: state.todos.map((todo) =>
                            todo.id === action.id ? { ...todo, done: !todo.done } : todo
                        ),
                    };
                case 'remove':
                    return {
                        todos: state.todos.filter((todo) => todo.id !== action.id),
                    };
                default:
                    return state;
            }
        };

        const { result } = renderHook(() =>
            useStorageReducer('todos', todoReducer, { todos: [] })
        );

        act(() => {
            result.current[1]({ type: 'add', text: 'Task 1' });
        });

        expect(result.current[0].todos).toHaveLength(1);
        expect(result.current[0].todos[0].text).toBe('Task 1');

        act(() => {
            result.current[1]({ type: 'add', text: 'Task 2' });
        });

        expect(result.current[0].todos).toHaveLength(2);

        const firstId = result.current[0].todos[0].id;

        act(() => {
            result.current[1]({ type: 'toggle', id: firstId });
        });

        expect(result.current[0].todos[0].done).toBe(true);

        act(() => {
            result.current[1]({ type: 'remove', id: firstId });
        });

        expect(result.current[0].todos).toHaveLength(1);
        expect(result.current[0].todos[0].text).toBe('Task 2');
    });
});
