import { Command } from '../db/index';
import { createCommandCard } from './CommandCard';
import { CategoryKey, categoryConfig } from '../utils/icons';

export interface CommandGridOptions {
  commands: Command[];
  favorites: Set<string>;
  category: CategoryKey;
  searchQuery: string;
  onToggleFavorite: (cmd: string) => void;
  onDeleteCustom: (id: number) => void;
}

export function renderCommandGrid(options: CommandGridOptions): void {
  const { commands, favorites, category, searchQuery, onToggleFavorite, onDeleteCustom } = options;

  const grid = document.getElementById('command-grid');
  const header = document.getElementById('category-header');
  const countEl = document.getElementById('command-count');

  if (!grid || !header) return;

  // Update header
  const config = categoryConfig[category];
  const headerText = searchQuery
    ? `Search results for "${searchQuery}"`
    : config.label;

  header.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="${config.colorClass}">${config.icon}</span>
      <h2 class="text-xl font-semibold text-zinc-100">${escapeHtml(headerText)}</h2>
      <span class="text-sm text-zinc-500">(${commands.length})</span>
    </div>
  `;

  // Update count in footer
  if (countEl) {
    countEl.textContent = `${commands.length} command${commands.length !== 1 ? 's' : ''}`;
  }

  // Clear grid
  grid.innerHTML = '';

  // Empty state
  if (commands.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-lg">No commands found</p>
        ${searchQuery ? '<p class="text-sm mt-1">Try a different search term</p>' : ''}
      </div>
    `;
    return;
  }

  // Render command cards
  commands.forEach(command => {
    const card = createCommandCard({
      command,
      isFavorite: favorites.has(command.cmd),
      onToggleFavorite,
      onDelete: command.isCustom ? onDeleteCustom : undefined
    });
    grid.appendChild(card);
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
