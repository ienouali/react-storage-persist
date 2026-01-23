import type { Middleware } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

export interface CompressionMiddlewareOptions {
    threshold?: number;
    algorithm?: 'simple-rle';
}

export function compressionMiddleware(
    options: CompressionMiddlewareOptions = {}
): Middleware {
    const { threshold = 1024, algorithm = 'simple-rle' } = options;

    const compress = (text: string): string => {
        try {
            if (algorithm === 'simple-rle') {
                return text.replace(/(.)\1+/g, (match, char) => {
                    return match.length > 3 ? `${char}*${match.length}` : match;
                });
            }
            return text;
        } catch (error) {
            throw new StorageError(
                'Compression failed',
                StorageErrorCode.COMPRESSION_FAILED,
                error as Error
            );
        }
    };

    const decompress = (text: string): string => {
        try {
            if (algorithm === 'simple-rle') {
                return text.replace(/(.)\*(\d+)/g, (match, char, count) => {
                    return char.repeat(parseInt(count, 10));
                });
            }
            return text;
        } catch (error) {
            throw new StorageError(
                'Decompression failed',
                StorageErrorCode.DECOMPRESSION_FAILED,
                error as Error
            );
        }
    };

    return {
        name: 'compression',
        beforeSet: async (key, value) => {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            if (stringValue.length < threshold) {
                return value;
            }

            const compressed = compress(stringValue);
            return typeof value === 'string' ? compressed : JSON.parse(compressed);
        },
        afterGet: async (key, value) => {
            if (value === null) return value;

            try {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                const decompressed = decompress(stringValue);
                return typeof value === 'string' ? decompressed : JSON.parse(decompressed);
            } catch {
                return value;
            }
        },
    };
}