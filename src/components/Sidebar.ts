import { categoryConfig, CategoryKey, getCategoryConfig, icons } from '../utils/icons';
import { db } from '../db/index';

export interface SidebarOptions {
  onCategorySelect: (category: CategoryKey) => void;
  onAddCategory?: () => void;
  activeCategory: CategoryKey;
}

export async function createSidebar(options: SidebarOptions): Promise<HTMLElement> {
  const { onCategorySelect, onAddCategory, activeCategory } = options;

  const nav = document.createElement('nav');
  nav.className = 'space-y-1';

  // Get counts for each category
  const counts = await getCategoryCounts();

  // Get custom categories
  const customCategories = await db.customCategories.toArray();

  // Built-in categories
  const builtinCategories: { key: CategoryKey; count: number }[] = [
    { key: 'all', count: counts.total },
    { key: 'favorites', count: counts.favorites },
    { key: 'native', count: counts.native },
    { key: 'gsd', count: counts.gsd },
    { key: 'cli', count: counts.cli },
    { key: 'mcp', count: counts.mcp },
    { key: 'skills', count: counts.skills },
    { key: 'custom', count: counts.custom },
  ];

  // Render built-in categories
  builtinCategories.forEach(({ key, count }) => {
    const config = categoryConfig[key];
    const item = createSidebarItem(key, config, count, activeCategory, onCategorySelect, nav);
    nav.appendChild(item);
  });

  // Render custom categories (if any)
  if (customCategories.length > 0) {
    const divider = document.createElement('div');
    divider.className = 'border-t border-zinc-700 my-2';
    nav.appendChild(divider);

    for (const cat of customCategories) {
      const count = await db.commands.where('category').equals(cat.key).count();
      const config = getCategoryConfig(cat.key, cat.label, cat.colorClass);
      const item = createSidebarItem(cat.key, config, count, activeCategory, onCategorySelect, nav);
      nav.appendChild(item);
    }
  }

  // Add "New Category" button
  if (onAddCategory) {
    const addBtn = document.createElement('button');
    addBtn.className = 'sidebar-item w-full text-zinc-500 hover:text-zinc-300 mt-2';
    addBtn.innerHTML = `
      <span class="text-zinc-500">${icons.plus}</span>
      <span class="flex-1 text-left text-sm">New Category</span>
    `;
    addBtn.addEventListener('click', onAddCategory);
    nav.appendChild(addBtn);
  }

  return nav;
}

function createSidebarItem(
  key: string,
  config: { icon: string; label: string; colorClass: string },
  count: number,
  activeCategory: CategoryKey,
  onCategorySelect: (category: CategoryKey) => void,
  nav: HTMLElement
): HTMLButtonElement {
  const item = document.createElement('button');
  item.className = `sidebar-item w-full ${activeCategory === key ? 'active' : ''}`;
  item.dataset.category = key;

  item.innerHTML = `
    <span class="${config.colorClass}">${config.icon}</span>
    <span class="flex-1 text-left">${config.label}</span>
    <span class="text-xs text-zinc-500">${count}</span>
  `;

  item.addEventListener('click', () => {
    // Update active state
    nav.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    onCategorySelect(key);
  });

  return item;
}

async function getCategoryCounts(): Promise<{
  total: number;
  favorites: number;
  native: number;
  gsd: number;
  cli: number;
  mcp: number;
  skills: number;
  custom: number;
}> {
  const [total, favorites, native, gsd, cli, mcp, skills, custom] = await Promise.all([
    db.commands.count(),
    db.favorites.count(),
    db.commands.where('category').equals('native').count(),
    db.commands.where('category').equals('gsd').count(),
    db.commands.where('category').equals('cli').count(),
    db.commands.where('category').equals('mcp').count(),
    db.commands.where('category').equals('skills').count(),
    db.commands.where('category').equals('custom').count(),
  ]);

  return { total, favorites, native, gsd, cli, mcp, skills, custom };
}

export async function updateSidebarCounts(): Promise<void> {
  const counts = await getCategoryCounts();
  const sidebar = document.getElementById('sidebar-nav');
  if (!sidebar) return;

  const countMap: Record<string, number> = {
    all: counts.total,
    favorites: counts.favorites,
    native: counts.native,
    gsd: counts.gsd,
    cli: counts.cli,
    mcp: counts.mcp,
    skills: counts.skills,
    custom: counts.custom,
  };

  sidebar.querySelectorAll('.sidebar-item').forEach(item => {
    const category = (item as HTMLElement).dataset.category;
    if (category && category in countMap) {
      const countSpan = item.querySelector('.text-xs');
      if (countSpan) {
        countSpan.textContent = countMap[category].toString();
      }
    }
  });
}
