import type { Middleware } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';
import {
  base64ToBytes,
  bytesToBase64,
  createEnvelope,
  isEnvelope,
  utf8Decode,
  utf8Encode,
} from './utils';

export type EncryptionAlgorithm = 'aes-gcm' | 'base64' | 'simple-xor';

export interface EncryptionMiddlewareOptions {
  key: string;
  /**
   * `'aes-gcm'` is real authenticated encryption (WebCrypto, secure contexts only).
   * `'base64'` and `'simple-xor'` only obfuscate data and are deprecated.
   * Defaults to `'base64'` for backward compatibility; this will change in the next major.
   */
  algorithm?: EncryptionAlgorithm;
  /** PBKDF2 salt used to derive the AES key from `key` (aes-gcm only). */
  salt?: string;
  /** PBKDF2 iterations (aes-gcm only). */
  iterations?: number;
}

const DEFAULT_SALT = 'react-storage-persist';
const DEFAULT_ITERATIONS = 100_000;
const IV_LENGTH = 12;

let obfuscationWarningShown = false;

export function encryptionMiddleware(options: EncryptionMiddlewareOptions): Middleware {
  const {
    key,
    algorithm = 'base64',
    salt = DEFAULT_SALT,
    iterations = DEFAULT_ITERATIONS,
  } = options;

  if (!key) {
    throw new StorageError('Encryption key is required', StorageErrorCode.INVALID_CONFIG);
  }

  if (algorithm !== 'aes-gcm' && !obfuscationWarningShown) {
    obfuscationWarningShown = true;
    console.warn(
      `[react-storage-persist] encryptionMiddleware algorithm "${algorithm}" only obfuscates data ` +
        'and is deprecated. Use { algorithm: "aes-gcm" } for real encryption.'
    );
  }

  let aesKey: Promise<CryptoKey> | null = null;
  const getAesKey = (): Promise<CryptoKey> => {
    if (!aesKey) {
      aesKey = deriveAesKey(key, salt, iterations).catch((error) => {
        aesKey = null;
        throw error;
      });
    }
    return aesKey;
  };

  const xor = (bytes: Uint8Array): Uint8Array => {
    const keyBytes = utf8Encode(key);
    return bytes.map((byte, i) => byte ^ (keyBytes[i % keyBytes.length] ?? 0));
  };

  const encrypt = async (plaintext: string) => {
    if (algorithm === 'aes-gcm') {
      const subtle = getSubtle();
      const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      const ciphertext = await subtle.encrypt(
        { name: 'AES-GCM', iv },
        await getAesKey(),
        utf8Encode(plaintext)
      );
      return createEnvelope(
        'enc',
        algorithm,
        bytesToBase64(new Uint8Array(ciphertext)),
        bytesToBase64(iv)
      );
    }
    const bytes = utf8Encode(plaintext);
    return createEnvelope(
      'enc',
      algorithm,
      bytesToBase64(algorithm === 'simple-xor' ? xor(bytes) : bytes)
    );
  };

  const decrypt = async (envelope: { alg: string; data: string; iv?: string }) => {
    if (envelope.alg === 'aes-gcm') {
      if (!envelope.iv) throw new Error('Missing IV');
      const plaintext = await getSubtle().decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(envelope.iv) },
        await getAesKey(),
        base64ToBytes(envelope.data)
      );
      return utf8Decode(new Uint8Array(plaintext));
    }
    if (envelope.alg === 'simple-xor') {
      return utf8Decode(xor(base64ToBytes(envelope.data)));
    }
    if (envelope.alg === 'base64') {
      return utf8Decode(base64ToBytes(envelope.data));
    }
    throw new Error(`Unknown encryption algorithm "${envelope.alg}"`);
  };

  // Strings written by <=1.2.0 were stored without an envelope.
  const decodeLegacyString = (value: string): string => {
    try {
      if (algorithm === 'base64') return globalThis.atob(value);
      if (algorithm === 'simple-xor') {
        return value
          .split('')
          .map((char, i) =>
            String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
          )
          .join('');
      }
    } catch {
      // not legacy-encoded
    }
    return value;
  };

  return {
    name: 'encryption',
    beforeSet: async (_, value) => {
      if (value === undefined) return value;
      try {
        return (await encrypt(JSON.stringify(value))) as any;
      } catch (error) {
        throw error instanceof StorageError ? error : StorageError.encryptionFailed(error as Error);
      }
    },
    afterGet: async (_, value) => {
      if (isEnvelope(value, 'enc')) {
        try {
          return JSON.parse(await decrypt(value));
        } catch (error) {
          throw error instanceof StorageError
            ? error
            : StorageError.decryptionFailed(error as Error);
        }
      }
      if (typeof value === 'string') {
        return decodeLegacyString(value) as any;
      }
      return value;
    },
  };
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new StorageError(
      'AES-GCM encryption requires the Web Crypto API (available only in secure contexts)',
      StorageErrorCode.ENCRYPTION_FAILED
    );
  }
  return subtle;
}

async function deriveAesKey(secret: string, salt: string, iterations: number): Promise<CryptoKey> {
  const subtle = getSubtle();
  const material = await subtle.importKey('raw', utf8Encode(secret), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: utf8Encode(salt), iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
