import { BaseStorageEngine } from './base';
import type { StorageEngine } from '../types';

export class MemoryStorageEngine extends BaseStorageEngine {
  readonly name: StorageEngine = 'memory';
  private store: Map<string, string> = new Map();

  isAvailable(): boolean {
    return true;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  length(): number {
    return this.store.size;
  }

  getMany(keys: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    for (const key of keys) {
      results.set(key, this.store.get(key) ?? null);
    }
    return Promise.resolve(results);
  }

  setMany(entries: Map<string, string>): Promise<void> {
    for (const [key, value] of entries) {
      this.store.set(key, value);
    }
    return Promise.resolve();
  }

  removeMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
    return Promise.resolve();
  }

  getStore(): Map<string, string> {
    return new Map(this.store);
  }

  getSize(): number {
    let size = 0;
    for (const [key, value] of this.store) {
      size += (key.length + value.length) * 2;
    }
    return size;
  }
}
