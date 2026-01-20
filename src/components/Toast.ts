import { icons } from '../utils/icons';

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Clear existing toast
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  container.innerHTML = '';

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `
    toast-enter
    flex items-center gap-2 px-4 py-3 rounded-lg
    ${type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}
    shadow-lg backdrop-blur-sm
  `;

  toast.innerHTML = `
    <span class="flex-shrink-0">${type === 'success' ? icons.check : icons.close}</span>
    <span class="text-sm font-medium">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Auto-dismiss after 2 seconds
  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 200);
  }, 2000);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
