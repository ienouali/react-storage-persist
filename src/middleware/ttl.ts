import type { Middleware } from '../types';

export interface TTLMiddlewareOptions {
    defaultTTL?: number;
    onExpire?: (key: string) => void;
}

export function ttlMiddleware(options: TTLMiddlewareOptions = {}): Middleware {
    const { defaultTTL, onExpire } = options;

    return {
        name: 'ttl',
        beforeSet: async (key, value, opts) => {
            if (opts?.ttl || defaultTTL) {
                return value;
            }
            return value;
        },
        afterGet: async (key, value) => {
            if (value === null && onExpire) {
                onExpire(key);
            }
            return value;
        },
    };
}