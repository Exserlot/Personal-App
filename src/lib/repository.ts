import { readJSON, writeJSON } from "@/lib/db";

export interface Entity {
  id: string;
  userId: string;
}

export class Repository<T extends Entity> {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  private async getAll(): Promise<T[]> {
    const items = await readJSON<T[]>(this.filename);
    return items || [];
  }

  private async saveAll(items: T[]): Promise<void> {
    await writeJSON(this.filename, items);
  }

  async getByUserId(userId: string): Promise<T[]> {
    const items = await this.getAll();
    return items.filter((item) => item.userId === userId);
  }

  async add(item: T): Promise<void> {
    const items = await this.getAll();
    items.unshift(item); // Add to top usually for lists
    await this.saveAll(items);
  }

  async update(id: string, userId: string, updates: Partial<T>): Promise<boolean> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id && item.userId === userId);

    if (index === -1) {
      return false;
    }

    items[index] = { ...items[index], ...updates };
    await this.saveAll(items);
    return true;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id && item.userId === userId);

    if (index === -1) {
      return false;
    }

    items.splice(index, 1);
    await this.saveAll(items);
    return true;
  }

  async findById(id: string, userId: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id && item.userId === userId) || null;
  }
}
