import Dexie, { Table } from 'dexie';

// Built-in categories (cannot be deleted)
export const BUILTIN_CATEGORIES = ['native', 'gsd', 'cli', 'mcp', 'skills', 'custom'] as const;
export type BuiltinCategory = typeof BUILTIN_CATEGORIES[number];

export interface Command {
  id?: number;
  cmd: string;
  description: string;
  syntax?: string;
  category: string; // Can be builtin or custom category
  tags?: string[];
  isCustom?: boolean;
  createdAt?: number;
}

export interface Favorite {
  id?: number;
  cmd: string;
  addedAt: number;
}

export interface Metadata {
  cmd: string;
  lastUsed?: number;
  usageCount: number;
}

export interface CustomCategory {
  id?: number;
  key: string; // URL-safe key (e.g., "my-tools")
  label: string; // Display name (e.g., "My Tools")
  colorClass: string; // Tailwind color class
  createdAt: number;
}

export class SlashbookDB extends Dexie {
  commands!: Table<Command>;
  favorites!: Table<Favorite>;
  metadata!: Table<Metadata>;
  customCategories!: Table<CustomCategory>;

  constructor() {
    super('slashbook');
    this.version(1).stores({
      commands: '++id, cmd, category, *tags',
      favorites: '++id, cmd',
      metadata: 'cmd'
    });
    // Version 2: Add custom categories table
    this.version(2).stores({
      commands: '++id, cmd, category, *tags',
      favorites: '++id, cmd',
      metadata: 'cmd',
      customCategories: '++id, key'
    });
  }
}

export const db = new SlashbookDB();

// Check if database needs seeding
export async function needsSeeding(): Promise<boolean> {
  const count = await db.commands.count();
  return count === 0;
}

// Clear and reseed database
export async function resetDatabase(): Promise<void> {
  await db.commands.clear();
  await db.favorites.clear();
  await db.metadata.clear();
}
