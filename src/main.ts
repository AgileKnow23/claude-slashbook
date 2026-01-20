import './style.css';
import { db, needsSeeding } from './db/index';
import { seedDatabase } from './db/seed';
import { createSearchBar } from './components/SearchBar';
import { createSidebar, updateSidebarCounts } from './components/Sidebar';
import { renderCommandGrid } from './components/CommandGrid';
import { showToast } from './components/Toast';
import { showAddCustomModal, showImportModal } from './components/Modal';
import { searchCommands } from './services/search';
import { getFavorites, toggleFavorite } from './services/favorites';
import { exportData, importData, downloadAsJson, addCustomCommand, deleteCustomCommand } from './services/sync';
import { CategoryKey } from './utils/icons';
import { icons } from './utils/icons';

// App State
let currentCategory: CategoryKey = 'all';
let currentQuery = '';
let favorites: Set<string> = new Set();

// Initialize the app
async function init() {
  try {
    // Check if we need to seed the database
    if (await needsSeeding()) {
      await seedDatabase();
    }

    // Load favorites
    favorites = await getFavorites();

    // Initialize components
    await initSearchBar();
    await initSidebar();
    initFooterActions();

    // Initial render
    await renderCommands();

    console.log('Claude Slashbook initialized');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showToast('Failed to initialize app', 'error');
  }
}

// Initialize search bar
async function initSearchBar() {
  const container = document.getElementById('search-container');
  if (!container) return;

  const searchBar = createSearchBar({
    onSearch: async (query) => {
      currentQuery = query;
      await renderCommands();
    }
  });

  container.appendChild(searchBar);
}

// Initialize sidebar
async function initSidebar() {
  const container = document.getElementById('sidebar-nav');
  if (!container) return;

  const sidebar = await createSidebar({
    activeCategory: currentCategory,
    onCategorySelect: async (category) => {
      currentCategory = category;
      currentQuery = ''; // Clear search when changing category
      const input = document.getElementById('search-input') as HTMLInputElement;
      if (input) input.value = '';
      await renderCommands();
    }
  });

  container.appendChild(sidebar);
}

// Initialize footer action buttons
function initFooterActions() {
  const container = document.getElementById('footer-actions');
  if (!container) return;

  container.innerHTML = `
    <button id="btn-import" class="btn btn-secondary">
      ${icons.upload}
      Import
    </button>
    <button id="btn-export" class="btn btn-secondary">
      ${icons.download}
      Export
    </button>
    <button id="btn-add-custom" class="btn btn-primary">
      ${icons.plus}
      Add Custom
    </button>
  `;

  // Import button
  document.getElementById('btn-import')?.addEventListener('click', () => {
    showImportModal(async (jsonData) => {
      try {
        const result = await importData(jsonData);
        if (result.errors.length > 0) {
          showToast(`Import completed with errors: ${result.errors[0]}`, 'error');
        } else {
          showToast(`Imported ${result.added} commands (${result.skipped} skipped)`);
        }
        await refreshAll();
      } catch (error) {
        showToast('Import failed', 'error');
      }
    });
  });

  // Export button
  document.getElementById('btn-export')?.addEventListener('click', async () => {
    try {
      const data = await exportData();
      downloadAsJson(data);
      showToast('Export downloaded');
    } catch (error) {
      showToast('Export failed', 'error');
    }
  });

  // Add custom button
  document.getElementById('btn-add-custom')?.addEventListener('click', () => {
    showAddCustomModal(async (cmd, description) => {
      try {
        await addCustomCommand(cmd, description);
        showToast(`Added: ${cmd}`);
        await refreshAll();
      } catch (error) {
        showToast((error as Error).message || 'Failed to add command', 'error');
      }
    });
  });
}

// Render commands based on current state
async function renderCommands() {
  const commands = await searchCommands({
    query: currentQuery,
    category: currentCategory
  });

  renderCommandGrid({
    commands,
    favorites,
    category: currentCategory,
    searchQuery: currentQuery,
    onToggleFavorite: handleToggleFavorite,
    onDeleteCustom: handleDeleteCustom
  });
}

// Handle favorite toggle
async function handleToggleFavorite(cmd: string) {
  const isFav = await toggleFavorite(cmd);
  if (isFav) {
    favorites.add(cmd);
    showToast(`Added to favorites: ${cmd}`);
  } else {
    favorites.delete(cmd);
    showToast(`Removed from favorites: ${cmd}`);
  }
  await updateSidebarCounts();
  await renderCommands();
}

// Handle delete custom command
async function handleDeleteCustom(id: number) {
  try {
    const command = await db.commands.get(id);
    if (!command) return;

    await deleteCustomCommand(id);
    showToast(`Deleted: ${command.cmd}`);
    await refreshAll();
  } catch (error) {
    showToast((error as Error).message || 'Failed to delete', 'error');
  }
}

// Refresh all data
async function refreshAll() {
  favorites = await getFavorites();
  await updateSidebarCounts();
  await renderCommands();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
