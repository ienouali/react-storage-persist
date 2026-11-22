import { describe, it, expect } from 'vitest';
import { StorageError, StorageErrorCode } from '../../../src/types/errors';

describe('StorageErrorCode', () => {
  it('should define all error codes', () => {
    expect(StorageErrorCode.NOT_AVAILABLE).toBe('NOT_AVAILABLE');
    expect(StorageErrorCode.QUOTA_EXCEEDED).toBe('QUOTA_EXCEEDED');
    expect(StorageErrorCode.SERIALIZATION_FAILED).toBe('SERIALIZATION_FAILED');
    expect(StorageErrorCode.DESERIALIZATION_FAILED).toBe('DESERIALIZATION_FAILED');
    expect(StorageErrorCode.ENCRYPTION_FAILED).toBe('ENCRYPTION_FAILED');
    expect(StorageErrorCode.DECRYPTION_FAILED).toBe('DECRYPTION_FAILED');
    expect(StorageErrorCode.COMPRESSION_FAILED).toBe('COMPRESSION_FAILED');
    expect(StorageErrorCode.DECOMPRESSION_FAILED).toBe('DECOMPRESSION_FAILED');
    expect(StorageErrorCode.INVALID_KEY).toBe('INVALID_KEY');
    expect(StorageErrorCode.OPERATION_FAILED).toBe('OPERATION_FAILED');
    expect(StorageErrorCode.INVALID_CONFIG).toBe('INVALID_CONFIG');
  });

  it('should have exactly 11 error codes', () => {
    const codes = Object.keys(StorageErrorCode);
    expect(codes).toHaveLength(11);
  });
});

describe('StorageError', () => {
  it('should create error with message and code', () => {
    const error = new StorageError('test error', StorageErrorCode.OPERATION_FAILED);
    expect(error.message).toBe('test error');
    expect(error.code).toBe(StorageErrorCode.OPERATION_FAILED);
    expect(error.name).toBe('StorageError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StorageError);
  });

  it('should store original error', () => {
    const original = new Error('original');
    const error = new StorageError('wrapped', StorageErrorCode.OPERATION_FAILED, original);
    expect(error.originalError).toBe(original);
  });

  it('should have undefined originalError when not provided', () => {
    const error = new StorageError('test', StorageErrorCode.NOT_AVAILABLE);
    expect(error.originalError).toBeUndefined();
  });

  it('should have a stack trace', () => {
    const error = new StorageError('test', StorageErrorCode.OPERATION_FAILED);
    expect(error.stack).toBeDefined();
  });

  describe('is()', () => {
    it('should return true for matching code', () => {
      const error = new StorageError('test', StorageErrorCode.QUOTA_EXCEEDED);
      expect(error.is(StorageErrorCode.QUOTA_EXCEEDED)).toBe(true);
    });

    it('should return false for non-matching code', () => {
      const error = new StorageError('test', StorageErrorCode.QUOTA_EXCEEDED);
      expect(error.is(StorageErrorCode.NOT_AVAILABLE)).toBe(false);
    });
  });

  describe('toJSON()', () => {
    it('should serialize without original error', () => {
      const error = new StorageError('test', StorageErrorCode.INVALID_KEY);
      const json = error.toJSON();

      expect(json.name).toBe('StorageError');
      expect(json.message).toBe('test');
      expect(json.code).toBe('INVALID_KEY');
      expect(json.stack).toBeDefined();
      expect(json.originalError).toBeUndefined();
    });

    it('should serialize with original error', () => {
      const original = new Error('cause');
      const error = new StorageError('test', StorageErrorCode.OPERATION_FAILED, original);
      const json = error.toJSON();

      expect(json.originalError).toBeDefined();
      expect(json.originalError!.name).toBe('Error');
      expect(json.originalError!.message).toBe('cause');
      expect(json.originalError!.stack).toBeDefined();
    });
  });

  describe('static factory methods', () => {
    it('quotaExceeded()', () => {
      const error = StorageError.quotaExceeded('myKey');
      expect(error.code).toBe(StorageErrorCode.QUOTA_EXCEEDED);
      expect(error.message).toContain('myKey');
    });

    it('quotaExceeded() with original error', () => {
      const original = new Error('out of space');
      const error = StorageError.quotaExceeded('myKey', original);
      expect(error.originalError).toBe(original);
    });

    it('notAvailable()', () => {
      const error = StorageError.notAvailable('localStorage');
      expect(error.code).toBe(StorageErrorCode.NOT_AVAILABLE);
      expect(error.message).toContain('localStorage');
    });

    it('serializationFailed()', () => {
      const error = StorageError.serializationFailed();
      expect(error.code).toBe(StorageErrorCode.SERIALIZATION_FAILED);
    });

    it('serializationFailed() with original error', () => {
      const original = new Error('circular');
      const error = StorageError.serializationFailed(original);
      expect(error.originalError).toBe(original);
    });

    it('deserializationFailed()', () => {
      const error = StorageError.deserializationFailed();
      expect(error.code).toBe(StorageErrorCode.DESERIALIZATION_FAILED);
    });

    it('encryptionFailed()', () => {
      const error = StorageError.encryptionFailed();
      expect(error.code).toBe(StorageErrorCode.ENCRYPTION_FAILED);
    });

    it('decryptionFailed()', () => {
      const error = StorageError.decryptionFailed();
      expect(error.code).toBe(StorageErrorCode.DECRYPTION_FAILED);
    });

    it('invalidKey()', () => {
      const error = StorageError.invalidKey('bad key');
      expect(error.code).toBe(StorageErrorCode.INVALID_KEY);
      expect(error.message).toContain('bad key');
    });

    it('operationFailed()', () => {
      const error = StorageError.operationFailed('set', 'key1');
      expect(error.code).toBe(StorageErrorCode.OPERATION_FAILED);
      expect(error.message).toContain('set');
      expect(error.message).toContain('key1');
    });

    it('operationFailed() with original error', () => {
      const original = new Error('network');
      const error = StorageError.operationFailed('get', 'k', original);
      expect(error.originalError).toBe(original);
    });
  });
});
