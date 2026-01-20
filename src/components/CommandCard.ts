import { Command } from '../db/index';
import { icons, categoryConfig } from '../utils/icons';
import { copyToClipboard } from '../utils/clipboard';
import { showToast } from './Toast';

export interface CommandCardOptions {
  command: Command;
  isFavorite: boolean;
  onToggleFavorite: (cmd: string) => void;
  onDelete?: (id: number) => void;
}

export function createCommandCard(options: CommandCardOptions): HTMLElement {
  const { command, isFavorite, onToggleFavorite, onDelete } = options;
  const config = categoryConfig[command.category];

  const card = document.createElement('div');
  card.className = 'card-interactive group relative';
  card.dataset.commandId = command.id?.toString() || '';

  const syntaxHtml = command.syntax
    ? `<code class="block mt-2 text-xs text-zinc-500 font-mono bg-base/50 px-2 py-1 rounded">${escapeHtml(command.syntax)}</code>`
    : '';

  const tagsHtml = command.tags?.length
    ? `<div class="flex flex-wrap gap-1 mt-2">${command.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const deleteBtn = command.isCustom && onDelete
    ? `<button class="delete-btn btn-ghost p-1 rounded opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300" title="Delete">
        ${icons.trash}
      </button>`
    : '';

  card.innerHTML = `
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="category-badge ${config.colorClass}">
            ${config.icon}
            ${config.label}
          </span>
          ${command.isCustom ? '<span class="tag bg-cyan-500/10 text-cyan-400">Custom</span>' : ''}
        </div>
        <h3 class="mt-2 text-lg font-mono text-indigo-400 truncate">${escapeHtml(command.cmd)}</h3>
        <p class="mt-1 text-sm text-zinc-400 line-clamp-2">${escapeHtml(command.description)}</p>
        ${syntaxHtml}
        ${tagsHtml}
      </div>
      <div class="flex flex-col gap-1">
        <button class="favorite-btn btn-ghost p-1 rounded ${isFavorite ? 'text-amber-400' : 'text-zinc-500 opacity-0 group-hover:opacity-100'}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFavorite ? icons.starFilled : icons.star}
        </button>
        ${deleteBtn}
      </div>
    </div>
  `;

  // Click to copy
  card.addEventListener('click', async (e) => {
    // Don't copy if clicking buttons
    if ((e.target as Element).closest('button')) return;

    const success = await copyToClipboard(command.cmd);
    if (success) {
      showToast(`Copied: ${command.cmd}`);
      // Track usage
      trackUsage(command.cmd);
    } else {
      showToast('Failed to copy', 'error');
    }
  });

  // Favorite toggle
  const favoriteBtn = card.querySelector('.favorite-btn');
  favoriteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggleFavorite(command.cmd);
  });

  // Delete button
  const deleteBtnEl = card.querySelector('.delete-btn');
  deleteBtnEl?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (command.id && onDelete) {
      onDelete(command.id);
    }
  });

  return card;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function trackUsage(cmd: string): Promise<void> {
  // Dynamic import to avoid circular dependency
  const { db } = await import('../db/index');
  const existing = await db.metadata.get(cmd);

  if (existing) {
    await db.metadata.update(cmd, {
      lastUsed: Date.now(),
      usageCount: existing.usageCount + 1
    });
  } else {
    await db.metadata.add({
      cmd,
      lastUsed: Date.now(),
      usageCount: 1
    });
  }
}
