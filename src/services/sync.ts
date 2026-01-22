import { db, Command, CustomCategory, BUILTIN_CATEGORIES } from '../db/index';

export interface ExportData {
  version: string;
  exportedAt: string;
  commands: Command[];
  favorites: string[];
}

export async function exportData(): Promise<ExportData> {
  const commands = await db.commands.toArray();
  const favorites = await db.favorites.toArray();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    commands: commands.filter(c => c.isCustom), // Only export custom commands
    favorites: favorites.map(f => f.cmd)
  };
}

export async function importData(jsonString: string): Promise<{ added: number; skipped: number; errors: string[] }> {
  const result = { added: 0, skipped: 0, errors: [] as string[] };

  let data: ExportData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    result.errors.push('Invalid JSON format');
    return result;
  }

  // Validate structure
  if (!data || typeof data !== 'object') {
    result.errors.push('Invalid data structure');
    return result;
  }

  // Import custom commands
  if (Array.isArray(data.commands)) {
    for (const cmd of data.commands) {
      if (!cmd.cmd || !cmd.description) {
        result.errors.push(`Skipped invalid command: ${JSON.stringify(cmd)}`);
        result.skipped++;
        continue;
      }

      // Check for duplicates
      const existing = await db.commands.where('cmd').equals(cmd.cmd).first();
      if (existing) {
        result.skipped++;
        continue;
      }

      // Add the command
      await db.commands.add({
        cmd: cmd.cmd,
        description: cmd.description,
        syntax: cmd.syntax,
        category: 'custom',
        tags: cmd.tags || [],
        isCustom: true,
        createdAt: Date.now()
      });
      result.added++;
    }
  }

  // Import favorites
  if (Array.isArray(data.favorites)) {
    for (const cmdName of data.favorites) {
      if (typeof cmdName !== 'string') continue;

      // Check if the command exists
      const command = await db.commands.where('cmd').equals(cmdName).first();
      if (!command) continue;

      // Check if already favorited
      const existing = await db.favorites.where('cmd').equals(cmdName).first();
      if (!existing) {
        await db.favorites.add({
          cmd: cmdName,
          addedAt: Date.now()
        });
      }
    }
  }

  return result;
}

export function downloadAsJson(data: ExportData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `slashbook-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function addCustomCommand(cmd: string, description: string, category: string = 'custom'): Promise<void> {
  // Check for duplicates
  const existing = await db.commands.where('cmd').equals(cmd).first();
  if (existing) {
    throw new Error('Command already exists');
  }

  await db.commands.add({
    cmd,
    description,
    category,
    tags: [],
    isCustom: true,
    createdAt: Date.now()
  });
}

// Custom category management
export async function getCustomCategories(): Promise<CustomCategory[]> {
  return db.customCategories.toArray();
}

export async function addCustomCategory(label: string, colorClass: string): Promise<CustomCategory> {
  // Generate URL-safe key from label
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Check if key already exists (builtin or custom)
  if (BUILTIN_CATEGORIES.includes(key as any)) {
    throw new Error('Cannot use a built-in category name');
  }

  const existing = await db.customCategories.where('key').equals(key).first();
  if (existing) {
    throw new Error('Category already exists');
  }

  const id = await db.customCategories.add({
    key,
    label,
    colorClass,
    createdAt: Date.now()
  });

  return { id, key, label, colorClass, createdAt: Date.now() };
}

export async function deleteCustomCategory(id: number): Promise<void> {
  const category = await db.customCategories.get(id);
  if (!category) {
    throw new Error('Category not found');
  }

  // Move all commands in this category to 'custom'
  await db.commands.where('category').equals(category.key).modify({ category: 'custom' });

  // Delete the category
  await db.customCategories.delete(id);
}

export async function deleteCustomCommand(id: number): Promise<void> {
  const command = await db.commands.get(id);
  if (!command) {
    throw new Error('Command not found');
  }
  if (!command.isCustom) {
    throw new Error('Cannot delete built-in commands');
  }

  // Also remove from favorites
  await db.favorites.where('cmd').equals(command.cmd).delete();

  // Delete the command
  await db.commands.delete(id);
}
