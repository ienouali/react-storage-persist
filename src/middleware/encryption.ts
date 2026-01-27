import type { Middleware } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

export interface EncryptionMiddlewareOptions {
  key: string;
  algorithm?: 'base64' | 'simple-xor';
}

export function encryptionMiddleware(options: EncryptionMiddlewareOptions): Middleware {
  const { key, algorithm = 'base64' } = options;

  if (!key) {
    throw new StorageError('Encryption key is required', StorageErrorCode.INVALID_CONFIG);
  }

  const encrypt = (text: string): string => {
    try {
      if (algorithm === 'base64') {
        return window.btoa(text);
      }

      if (algorithm === 'simple-xor') {
        return text
          .split('')
          .map((char, i) => {
            const keyChar = key.charCodeAt(i % key.length);
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
          })
          .join('');
      }

      return text;
    } catch (error) {
      throw StorageError.encryptionFailed(error as Error);
    }
  };

  const decrypt = (text: string): string => {
    try {
      if (algorithm === 'base64') {
        return window.atob(text);
      }

      if (algorithm === 'simple-xor') {
        return text
          .split('')
          .map((char, i) => {
            const keyChar = key.charCodeAt(i % key.length);
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
          })
          .join('');
      }

      return text;
    } catch (error) {
      throw StorageError.decryptionFailed(error as Error);
    }
  };

  return {
    name: 'encryption',
    beforeSet: async (_, value) => {
      if (typeof value === 'string') {
        return encrypt(value) as any;
      }
      const stringValue = JSON.stringify(value);
      return JSON.parse(encrypt(stringValue));
    },
    afterGet: async (_, value) => {
      if (value === null) return value;

      if (typeof value === 'string') {
        try {
          return decrypt(value) as any;
        } catch {
          return value;
        }
      }

      try {
        const stringValue = JSON.stringify(value);
        return JSON.parse(decrypt(stringValue));
      } catch {
        return value;
      }
    },
  };
}
