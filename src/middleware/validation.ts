import type { Middleware } from '../types';
import { StorageError, StorageErrorCode } from '../types/errors';

export type ValidationRule<T = any> = (value: T) => boolean | string;

export interface ValidationMiddlewareOptions<T = any> {
  rules?: Record<string, ValidationRule<T>[]>;
  onValidationError?: (key: string, errors: string[]) => void;
}

export function validationMiddleware<T = any>(
  options: ValidationMiddlewareOptions<T> = {}
): Middleware {
  const { rules = {}, onValidationError } = options;

  const validate = (key: string, value: any): string[] => {
    const keyRules = rules[key] || [];
    const errors: string[] = [];

    for (const rule of keyRules) {
      const result = rule(value);
      if (result === false) {
        errors.push('Validation failed');
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    return errors;
  };

  return {
    name: 'validation',
    beforeSet: async (key, value) => {
      const errors = validate(key, value);

      if (errors.length > 0) {
        if (onValidationError) {
          onValidationError(key, errors);
        }
        throw new StorageError(
          `Validation failed for key "${key}": ${errors.join(', ')}`,
          StorageErrorCode.OPERATION_FAILED
        );
      }

      return value;
    },
  };
}

export const validators = {
  required: <T>(message = 'Value is required'): ValidationRule<T> => {
    return (value: T) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return true;
    };
  },

  minLength: (min: number, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (typeof value !== 'string' || value.length < min) {
        return message || `Value must be at least ${min} characters`;
      }
      return true;
    };
  },

  maxLength: (max: number, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (typeof value !== 'string' || value.length > max) {
        return message || `Value must be at most ${max} characters`;
      }
      return true;
    };
  },

  pattern: (regex: RegExp, message?: string): ValidationRule<string> => {
    return (value: string) => {
      if (typeof value !== 'string' || !regex.test(value)) {
        return message || 'Value does not match pattern';
      }
      return true;
    };
  },

  min: (min: number, message?: string): ValidationRule<number> => {
    return (value: number) => {
      if (typeof value !== 'number' || value < min) {
        return message || `Value must be at least ${min}`;
      }
      return true;
    };
  },

  max: (max: number, message?: string): ValidationRule<number> => {
    return (value: number) => {
      if (typeof value !== 'number' || value > max) {
        return message || `Value must be at most ${max}`;
      }
      return true;
    };
  },

  email: (message = 'Invalid email address'): ValidationRule<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value: string) => {
      if (typeof value !== 'string' || !emailRegex.test(value)) {
        return message;
      }
      return true;
    };
  },

  custom: <T>(fn: (value: T) => boolean, message: string): ValidationRule<T> => {
    return (value: T) => {
      if (!fn(value)) {
        return message;
      }
      return true;
    };
  },
};
