import { icons, customCategoryColors } from '../utils/icons';
import { db } from '../db/index';

export interface ModalOptions {
  title: string;
  content: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function showModal(options: ModalOptions): void {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const {
    title,
    content,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showCancel = true
  } = options;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content bg-surface border border-card-border rounded-xl shadow-2xl max-w-md w-full">
      <div class="flex items-center justify-between p-4 border-b border-card-border">
        <h3 class="text-lg font-semibold text-zinc-100">${escapeHtml(title)}</h3>
        <button class="modal-close btn-ghost p-1 rounded-lg">
          ${icons.close}
        </button>
      </div>
      <div class="p-4">
        ${content}
      </div>
      <div class="flex justify-end gap-2 p-4 border-t border-card-border">
        ${showCancel ? `<button class="modal-cancel btn btn-secondary">${escapeHtml(cancelText)}</button>` : ''}
        <button class="modal-confirm btn btn-primary">${escapeHtml(confirmText)}</button>
      </div>
    </div>
  `;

  // Close handlers
  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('.modal-close')?.addEventListener('click', () => {
    closeModal();
    onCancel?.();
  });

  modal.querySelector('.modal-cancel')?.addEventListener('click', () => {
    closeModal();
    onCancel?.();
  });

  modal.querySelector('.modal-confirm')?.addEventListener('click', () => {
    // Call onConfirm BEFORE closing modal so it can read input values
    onConfirm?.();
    closeModal();
  });

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
      onCancel?.();
    }
  });

  // Escape key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      onCancel?.();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  container.appendChild(modal);
}

export async function showAddCustomModal(onAdd: (cmd: string, description: string, category: string) => void): Promise<void> {
  // Get custom categories for the dropdown
  const customCategories = await db.customCategories.toArray();

  const categoryOptions = [
    '<option value="custom">Custom (default)</option>',
    ...customCategories.map(cat => `<option value="${cat.key}">${cat.label}</option>`)
  ].join('');

  const content = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-1">Command</label>
        <input type="text" id="custom-cmd" class="input font-mono" placeholder="/my-command" />
      </div>
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-1">Description</label>
        <input type="text" id="custom-desc" class="input" placeholder="What does this command do?" />
      </div>
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-1">Category</label>
        <select id="custom-category" class="input">
          ${categoryOptions}
        </select>
      </div>
    </div>
  `;

  showModal({
    title: 'Add Custom Command',
    content,
    confirmText: 'Add Command',
    onConfirm: () => {
      const cmdInput = document.getElementById('custom-cmd') as HTMLInputElement;
      const descInput = document.getElementById('custom-desc') as HTMLInputElement;
      const categorySelect = document.getElementById('custom-category') as HTMLSelectElement;
      const cmd = cmdInput?.value.trim();
      const desc = descInput?.value.trim();
      const category = categorySelect?.value || 'custom';

      if (cmd && desc) {
        onAdd(cmd, desc, category);
      }
    }
  });

  // Focus the first input
  setTimeout(() => {
    document.getElementById('custom-cmd')?.focus();
  }, 100);
}

export function showAddCategoryModal(onAdd: (label: string, colorClass: string) => void): void {
  const colorOptions = customCategoryColors.map((color, i) =>
    `<label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="category-color" value="${color.class}" ${i === 0 ? 'checked' : ''} class="hidden peer" />
      <span class="w-6 h-6 rounded-full border-2 border-transparent peer-checked:border-white ${color.class} bg-current"></span>
      <span class="text-sm text-zinc-400">${color.name}</span>
    </label>`
  ).join('');

  const content = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-1">Category Name</label>
        <input type="text" id="category-name" class="input" placeholder="My Tools" maxlength="30" />
      </div>
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-2">Color</label>
        <div class="grid grid-cols-2 gap-2">
          ${colorOptions}
        </div>
      </div>
    </div>
  `;

  showModal({
    title: 'New Category',
    content,
    confirmText: 'Create Category',
    onConfirm: () => {
      const nameInput = document.getElementById('category-name') as HTMLInputElement;
      const colorInput = document.querySelector('input[name="category-color"]:checked') as HTMLInputElement;
      const name = nameInput?.value.trim();
      const colorClass = colorInput?.value || customCategoryColors[0].class;

      if (name) {
        onAdd(name, colorClass);
      }
    }
  });

  // Focus the first input
  setTimeout(() => {
    document.getElementById('category-name')?.focus();
  }, 100);
}

export function showImportModal(onImport: (data: string) => void): void {
  const content = `
    <div class="space-y-4">
      <p class="text-sm text-zinc-400">Paste your exported JSON data below to import commands and favorites.</p>
      <textarea id="import-data" class="input h-32 resize-none font-mono text-sm" placeholder='{"commands": [...], "favorites": [...]}'></textarea>
    </div>
  `;

  showModal({
    title: 'Import Data',
    content,
    confirmText: 'Import',
    onConfirm: () => {
      const textarea = document.getElementById('import-data') as HTMLTextAreaElement;
      const data = textarea?.value.trim();
      if (data) {
        onImport(data);
      }
    }
  });

  setTimeout(() => {
    document.getElementById('import-data')?.focus();
  }, 100);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
