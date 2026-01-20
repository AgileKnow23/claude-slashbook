import Dexie, { Table } from 'dexie';

export interface Command {
  id?: number;
  cmd: string;
  description: string;
  syntax?: string;
  category: 'native' | 'gsd' | 'cli' | 'mcp' | 'skills' | 'custom';
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

export class SlashbookDB extends Dexie {
  commands!: Table<Command>;
  favorites!: Table<Favorite>;
  metadata!: Table<Metadata>;

  constructor() {
    super('slashbook');
    this.version(1).stores({
      commands: '++id, cmd, category, *tags',
      favorites: '++id, cmd',
      metadata: 'cmd'
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
