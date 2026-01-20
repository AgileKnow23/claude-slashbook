# Claude Slashbook - Installation Guide

A professional-grade, local-first PWA command reference tool for Claude Code CLI.

## Quick Start

```bash
cd ~/claude-slashbook
npm install
npm run dev
```

Open http://localhost:5173/claude-slashbook/ in your browser.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate PWA Icons (Optional for Development)

For production, generate proper PNG icons from the SVG:

**Option A: Using pwa-asset-generator**
```bash
npx pwa-asset-generator public/favicon.svg public/ --icon-only --favicon
```

**Option B: Online Tools**
- [RealFaviconGenerator](https://realfavicongenerator.net)
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

Upload `public/favicon.svg` and download the generated icons.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:5173/claude-slashbook/

## Production Build

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deploy to GitHub Pages

### 1. Create GitHub Repository

Create a new repository named `claude-slashbook` on GitHub.

### 2. Initialize Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/claude-slashbook.git
git push -u origin main
```

### 3. Deploy

```bash
npm run deploy
```

Or manually:
```bash
npm run build
npx gh-pages -d dist
```

### 4. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` / `root`
5. Save

Your app will be available at: `https://YOUR_USERNAME.github.io/claude-slashbook/`

## Features

### Core Features
- **104 Built-in Commands**: Claude Native, GSD Extension, CLI Options, MCP Tools, and Skills
- **Real-time Search**: Press `/` to focus search, filter across all command fields
- **Favorites**: Star commands for quick access
- **Custom Commands**: Add your own commands and snippets
- **Copy on Click**: Single-click to copy any command

### PWA Features
- **Offline Support**: Works without internet after first load
- **Installable**: Add to home screen on mobile/desktop
- **Fast Loading**: Cached assets for instant startup

### Data Management
- **Local-first**: All data stored in IndexedDB
- **Export**: Download your custom commands and favorites as JSON
- **Import**: Restore from backup with duplicate detection

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Escape` | Clear search / unfocus |

## Tech Stack

- **Vite**: Build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **Dexie.js**: IndexedDB wrapper for local storage
- **Tailwind CSS**: Utility-first styling
- **vite-plugin-pwa**: Service worker and PWA manifest

## Project Structure

```
claude-slashbook/
├── index.html          # App shell
├── package.json        # Dependencies
├── vite.config.ts      # Vite + PWA configuration
├── tailwind.config.js  # Tailwind theme
├── public/
│   ├── favicon.svg     # App icon (SVG source)
│   ├── icon-192.png    # PWA icon (192x192)
│   ├── icon-512.png    # PWA icon (512x512)
│   └── manifest.json   # PWA manifest
└── src/
    ├── main.ts         # App entry point
    ├── style.css       # Tailwind + custom styles
    ├── db/             # Dexie database
    ├── components/     # UI components
    ├── services/       # Business logic
    └── utils/          # Helpers
```

## Customization

### Adding Commands to Seed Data

Edit `src/db/seed.ts` to add more built-in commands:

```typescript
{
  cmd: '/my-command',
  description: 'What it does',
  syntax: '/my-command [args]',
  category: 'native', // native, gsd, cli, mcp, skills, custom
  tags: ['tag1', 'tag2']
}
```

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  base: '#0a0a0a',      // Background
  surface: '#141414',    // Elevated surfaces
  'card-bg': '#1a1a1e',  // Card backgrounds
  'card-border': '#2d2d35', // Borders
}
```

## Troubleshooting

### PWA Not Installing

1. Ensure you're using HTTPS (or localhost)
2. Check that `manifest.json` is being served
3. Verify icons exist at specified paths
4. Open DevTools > Application > Manifest to debug

### Database Not Persisting

1. Check browser storage settings
2. Ensure IndexedDB isn't blocked
3. Try clearing site data and refreshing

### Build Errors

```bash
# Clear caches and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## License

MIT
