export enum StorageErrorCode {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERIALIZATION_FAILED = 'SERIALIZATION_FAILED',
  DESERIALIZATION_FAILED = 'DESERIALIZATION_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  DECOMPRESSION_FAILED = 'DECOMPRESSION_FAILED',
  INVALID_KEY = 'INVALID_KEY',
  OPERATION_FAILED = 'OPERATION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
}

export class StorageError extends Error {
  public readonly code: StorageErrorCode;
  public readonly originalError?: Error;

  constructor(message: string, code: StorageErrorCode, originalError?: Error) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }

  is(code: StorageErrorCode): boolean {
    return this.code === code;
  }

  static quotaExceeded(key: string, originalError?: Error): StorageError {
    return new StorageError(
      `Storage quota exceeded when setting "${key}"`,
      StorageErrorCode.QUOTA_EXCEEDED,
      originalError
    );
  }

  static notAvailable(engine: string): StorageError {
    return new StorageError(
      `Storage engine "${engine}" is not available`,
      StorageErrorCode.NOT_AVAILABLE
    );
  }

  static serializationFailed(originalError?: Error): StorageError {
    return new StorageError(
      'Failed to serialize value',
      StorageErrorCode.SERIALIZATION_FAILED,
      originalError
    );
  }

  static deserializationFailed(originalError?: Error): StorageError {
    return new StorageError(
      'Failed to deserialize value',
      StorageErrorCode.DESERIALIZATION_FAILED,
      originalError
    );
  }

  static encryptionFailed(originalError?: Error): StorageError {
    return new StorageError(
      'Failed to encrypt value',
      StorageErrorCode.ENCRYPTION_FAILED,
      originalError
    );
  }

  static decryptionFailed(originalError?: Error): StorageError {
    return new StorageError(
      'Failed to decrypt value',
      StorageErrorCode.DECRYPTION_FAILED,
      originalError
    );
  }

  static invalidKey(key: string): StorageError {
    return new StorageError(`Invalid key: "${key}"`, StorageErrorCode.INVALID_KEY);
  }

  static operationFailed(operation: string, key: string, originalError?: Error): StorageError {
    return new StorageError(
      `Storage ${operation} failed for key "${key}"`,
      StorageErrorCode.OPERATION_FAILED,
      originalError
    );
  }
}
