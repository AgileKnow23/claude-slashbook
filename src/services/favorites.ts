import { db } from '../db/index';

export async function getFavorites(): Promise<Set<string>> {
  const favorites = await db.favorites.toArray();
  return new Set(favorites.map(f => f.cmd));
}

export async function addFavorite(cmd: string): Promise<void> {
  const existing = await db.favorites.where('cmd').equals(cmd).first();
  if (!existing) {
    await db.favorites.add({
      cmd,
      addedAt: Date.now()
    });
  }
}

export async function removeFavorite(cmd: string): Promise<void> {
  await db.favorites.where('cmd').equals(cmd).delete();
}

export async function toggleFavorite(cmd: string): Promise<boolean> {
  const existing = await db.favorites.where('cmd').equals(cmd).first();
  if (existing) {
    await removeFavorite(cmd);
    return false; // no longer a favorite
  } else {
    await addFavorite(cmd);
    return true; // now a favorite
  }
}

export async function isFavorite(cmd: string): Promise<boolean> {
  const existing = await db.favorites.where('cmd').equals(cmd).first();
  return !!existing;
}
