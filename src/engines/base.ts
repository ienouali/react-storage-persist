import type { IStorageEngine, StorageEngine } from '../types';

export abstract class BaseStorageEngine implements IStorageEngine {
  abstract readonly name: StorageEngine;

  abstract isAvailable(): boolean;

  abstract getItem(key: string): string | null | Promise<string | null>;

  abstract setItem(key: string, value: string): void | Promise<void>;

  abstract removeItem(key: string): void | Promise<void>;

  abstract clear(): void | Promise<void>;

  abstract keys(): string[] | Promise<string[]>;

  abstract length(): number | Promise<number>;

  async has(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }

  async getMany(keys: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.getItem(key);
        results.set(key, value);
      })
    );
    return results;
  }

  async setMany(entries: Map<string, string>): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) => this.setItem(key, value))
    );
  }

  async removeMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.removeItem(key)));
  }
}
