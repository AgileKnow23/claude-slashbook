import { categoryConfig, CategoryKey } from '../utils/icons';
import { db } from '../db/index';

export interface SidebarOptions {
  onCategorySelect: (category: CategoryKey) => void;
  activeCategory: CategoryKey;
}

export async function createSidebar(options: SidebarOptions): Promise<HTMLElement> {
  const { onCategorySelect, activeCategory } = options;

  const nav = document.createElement('nav');
  nav.className = 'space-y-1';

  // Get counts for each category
  const counts = await getCategoryCounts();

  const categories: { key: CategoryKey; count: number }[] = [
    { key: 'all', count: counts.total },
    { key: 'favorites', count: counts.favorites },
    { key: 'native', count: counts.native },
    { key: 'gsd', count: counts.gsd },
    { key: 'cli', count: counts.cli },
    { key: 'mcp', count: counts.mcp },
    { key: 'skills', count: counts.skills },
    { key: 'custom', count: counts.custom },
  ];

  categories.forEach(({ key, count }) => {
    const config = categoryConfig[key];
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

    nav.appendChild(item);
  });

  return nav;
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
