import { icons } from '../utils/icons';

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
    closeModal();
    onConfirm?.();
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

export function showAddCustomModal(onAdd: (cmd: string, description: string) => void): void {
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
    </div>
  `;

  showModal({
    title: 'Add Custom Command',
    content,
    confirmText: 'Add Command',
    onConfirm: () => {
      const cmdInput = document.getElementById('custom-cmd') as HTMLInputElement;
      const descInput = document.getElementById('custom-desc') as HTMLInputElement;
      const cmd = cmdInput?.value.trim();
      const desc = descInput?.value.trim();

      if (cmd && desc) {
        onAdd(cmd, desc);
      }
    }
  });

  // Focus the first input
  setTimeout(() => {
    document.getElementById('custom-cmd')?.focus();
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
