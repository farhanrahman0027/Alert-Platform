import { IRepository } from '../../domain/interfaces';

export abstract class InMemoryRepository<T extends { id: string }> implements IRepository<T> {
  protected data: Map<string, T> = new Map();

  findById(id: string): T | undefined {
    return this.data.get(id);
  }

  findAll(): T[] {
    return Array.from(this.data.values());
  }

  create(entity: T): T {
    this.data.set(entity.id, entity);
    return entity;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.data.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.data.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }

  protected filter(predicate: (entity: T) => boolean): T[] {
    return Array.from(this.data.values()).filter(predicate);
  }
}


