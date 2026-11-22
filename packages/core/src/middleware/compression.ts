import type { Middleware } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';
import {
  base64ToBytes,
  bytesToBase64,
  createEnvelope,
  isEnvelope,
  pipeBytes,
  utf8Decode,
  utf8Encode,
} from './utils';

export type CompressionAlgorithm = 'gzip' | 'deflate' | 'deflate-raw';

export interface CompressionMiddlewareOptions {
  /** Minimum serialized length (in characters) before compression is attempted. */
  threshold?: number;
  /**
   * Compression format used by the native `CompressionStream` API.
   * `'simple-rle'` is deprecated: it was lossy and is now treated as `'gzip'`.
   */
  algorithm?: CompressionAlgorithm | 'simple-rle';
}

export function compressionMiddleware(options: CompressionMiddlewareOptions = {}): Middleware {
  const { threshold = 1024 } = options;
  const algorithm: CompressionAlgorithm =
    !options.algorithm || options.algorithm === 'simple-rle' ? 'gzip' : options.algorithm;

  return {
    name: 'compression',
    beforeSet: async (_, value) => {
      if (value === undefined || typeof CompressionStream === 'undefined') return value;

      const json = JSON.stringify(value);
      if (json.length < threshold) return value;

      try {
        const compressed = await pipeBytes(utf8Encode(json), new CompressionStream(algorithm));
        const data = bytesToBase64(compressed);
        if (data.length >= json.length) return value;
        return createEnvelope('cmp', algorithm, data) as any;
      } catch {
        // Compression is an optimisation; store uncompressed rather than fail the write.
        return value;
      }
    },
    afterGet: async (_, value) => {
      if (!isEnvelope(value, 'cmp')) return value;

      try {
        if (typeof DecompressionStream === 'undefined') {
          throw new Error('DecompressionStream is not available in this environment');
        }
        const bytes = await pipeBytes(
          base64ToBytes(value.data),
          new DecompressionStream(value.alg as CompressionAlgorithm)
        );
        return JSON.parse(utf8Decode(bytes));
      } catch (error) {
        throw new StorageError(
          'Decompression failed',
          StorageErrorCode.DECOMPRESSION_FAILED,
          error as Error
        );
      }
    },
  };
}
