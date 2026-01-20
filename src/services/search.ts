import { db, Command } from '../db/index';
import { CategoryKey } from '../utils/icons';

export interface SearchOptions {
  query?: string;
  category?: CategoryKey;
}

export async function searchCommands(options: SearchOptions): Promise<Command[]> {
  const { query, category } = options;

  let commands: Command[];

  // Handle favorites category specially
  if (category === 'favorites') {
    const favoritesCmds = await db.favorites.toArray();
    const favoriteCmdNames = new Set(favoritesCmds.map(f => f.cmd));
    commands = await db.commands.filter(c => favoriteCmdNames.has(c.cmd)).toArray();
  } else if (category && category !== 'all') {
    commands = await db.commands.where('category').equals(category).toArray();
  } else {
    commands = await db.commands.toArray();
  }

  // Apply text search if query provided
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    commands = commands.filter(cmd => {
      const cmdLower = cmd.cmd.toLowerCase();
      const descLower = cmd.description.toLowerCase();
      const syntaxLower = (cmd.syntax || '').toLowerCase();
      const tagsLower = (cmd.tags || []).join(' ').toLowerCase();

      return (
        cmdLower.includes(searchTerm) ||
        descLower.includes(searchTerm) ||
        syntaxLower.includes(searchTerm) ||
        tagsLower.includes(searchTerm)
      );
    });
  }

  // Sort: custom commands last, then alphabetically
  commands.sort((a, b) => {
    // Custom commands go to the end
    if (a.isCustom && !b.isCustom) return 1;
    if (!a.isCustom && b.isCustom) return -1;
    // Then sort alphabetically
    return a.cmd.localeCompare(b.cmd);
  });

  return commands;
}
