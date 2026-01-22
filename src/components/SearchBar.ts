import { icons } from '../utils/icons';

export interface SearchBarOptions {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function createSearchBar(options: SearchBarOptions): HTMLElement {
  const { onSearch, placeholder = 'Search commands... [/]' } = options;

  const container = document.createElement('div');
  container.className = 'relative';

  container.innerHTML = `
    <div class="relative flex items-center">
      <span class="absolute left-3 text-zinc-500">
        ${icons.search}
      </span>
      <input
        type="text"
        id="search-input"
        class="input pl-10 pr-10"
        placeholder="${placeholder}"
        autocomplete="off"
        spellcheck="false"
      />
      <button id="clear-search" class="absolute right-3 text-zinc-500 hover:text-zinc-300 hidden">
        ${icons.clear}
      </button>
    </div>
  `;

  const input = container.querySelector('#search-input') as HTMLInputElement;
  const clearBtn = container.querySelector('#clear-search') as HTMLButtonElement;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Debounced search
  input.addEventListener('input', () => {
    const query = input.value;

    // Show/hide clear button
    if (query.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }

    // Debounce search
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 150);
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    onSearch('');
    input.focus();
  });

  // Keyboard shortcut: / to focus search
  document.addEventListener('keydown', (e) => {
    // Don't capture "/" when user is typing in any input or textarea
    const activeEl = document.activeElement;
    const isTyping = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      input.focus();
    }
    // Escape to clear and unfocus
    if (e.key === 'Escape' && document.activeElement === input) {
      if (input.value) {
        input.value = '';
        clearBtn.classList.add('hidden');
        onSearch('');
      } else {
        input.blur();
      }
    }
  });

  return container;
}
