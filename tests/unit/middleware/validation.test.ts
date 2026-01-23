import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStorage } from '../../../src/core';
import { validationMiddleware, validators } from '../../../src/middleware/validation';

describe('validationMiddleware', () => {
    let storage: ReturnType<typeof createStorage>;

    beforeEach(() => {
        localStorage.clear();
        storage = createStorage({ engine: 'memory' });
    });

    afterEach(() => {
        storage.destroy();
        localStorage.clear();
    });

    it('should validate required values', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    username: [validators.required()],
                },
            })
        );

        await expect(storage.set('username', '')).rejects.toThrow();
        await expect(storage.set('username', 'john')).resolves.not.toThrow();
    });

    it('should validate min length', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    password: [validators.minLength(8)],
                },
            })
        );

        await expect(storage.set('password', 'short')).rejects.toThrow();
        await expect(storage.set('password', 'longpassword')).resolves.not.toThrow();
    });

    it('should validate max length', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    username: [validators.maxLength(20)],
                },
            })
        );

        await expect(storage.set('username', 'a'.repeat(25))).rejects.toThrow();
        await expect(storage.set('username', 'john')).resolves.not.toThrow();
    });

    it('should validate email format', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    email: [validators.email()],
                },
            })
        );

        await expect(storage.set('email', 'invalid')).rejects.toThrow();
        await expect(storage.set('email', 'test@example.com')).resolves.not.toThrow();
    });

    it('should validate pattern', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    phone: [validators.pattern(/^\d{10}$/, 'Phone must be 10 digits')],
                },
            })
        );

        await expect(storage.set('phone', '123')).rejects.toThrow();
        await expect(storage.set('phone', '1234567890')).resolves.not.toThrow();
    });

    it('should validate min/max for numbers', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    age: [validators.min(0), validators.max(150)],
                },
            })
        );

        await expect(storage.set('age', -1)).rejects.toThrow();
        await expect(storage.set('age', 200)).rejects.toThrow();
        await expect(storage.set('age', 25)).resolves.not.toThrow();
    });

    it('should support multiple rules', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    password: [
                        validators.required(),
                        validators.minLength(8),
                        validators.pattern(/[A-Z]/, 'Must contain uppercase'),
                    ],
                },
            })
        );

        await expect(storage.set('password', '')).rejects.toThrow();
        await expect(storage.set('password', 'short')).rejects.toThrow();
        await expect(storage.set('password', 'nouppercase')).rejects.toThrow();
        await expect(storage.set('password', 'ValidPass123')).resolves.not.toThrow();
    });

    it('should call onValidationError callback', async () => {
        const onError = vi.fn();

        storage.use(
            validationMiddleware({
                rules: {
                    email: [validators.email()],
                },
                onValidationError: onError,
            })
        );

        await expect(storage.set('email', 'invalid')).rejects.toThrow();
        expect(onError).toHaveBeenCalledWith('email', expect.any(Array));
    });

    it('should support custom validators', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    username: [
                        validators.custom(
                            (value: string) => !value.includes(' '),
                            'Username cannot contain spaces'
                        ),
                    ],
                },
            })
        );

        await expect(storage.set('username', 'user name')).rejects.toThrow();
        await expect(storage.set('username', 'username')).resolves.not.toThrow();
    });

    it('should allow keys without rules', async () => {
        storage.use(
            validationMiddleware({
                rules: {
                    email: [validators.email()],
                },
            })
        );

        await expect(storage.set('other', 'anything')).resolves.not.toThrow();
    });
});