import type { Middleware } from '../types';

export interface LoggerMiddlewareOptions {
    prefix?: string;
    logGet?: boolean;
    logSet?: boolean;
    logRemove?: boolean;
    logger?: {
        log: (...args: any[]) => void;
        error: (...args: any[]) => void;
    };
}

export function loggerMiddleware(options: LoggerMiddlewareOptions = {}): Middleware {
    const {
        prefix = '[Storage]',
        logGet = false,
        logSet = true,
        logRemove = true,
        logger = console,
    } = options;

    return {
        name: 'logger',
        beforeSet: async (key, value, opts) => {
            if (logSet) {
                logger.log(`${prefix} SET`, { key, value, options: opts });
            }
            return value;
        },
        afterGet: async (key, value, opts) => {
            if (logGet) {
                logger.log(`${prefix} GET`, { key, value });
            }
            return value;
        },
        beforeRemove: async (key) => {
            if (logRemove) {
                logger.log(`${prefix} REMOVE`, { key });
            }
        },
    };
}