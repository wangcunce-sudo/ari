'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlaylistStore } from './playlistStore';
import { useAuthStore } from './authStore';

export interface SavedEra {
  id: string;
  name: string;
  year: number;
  accentColor: string;
  heroImage: string;
}

interface EraFavoritesStore {
  savedEras: SavedEra[];
  _synced: boolean;

  // Actions
  toggleEra: (era: SavedEra) => boolean; // returns true if now saved
  removeEra: (id: string) => void;       // also removes era's tracks from playlist
  isEraSaved: (id: string) => boolean;

  // Remote sync
  fetchFromRemote: () => Promise<void>;
  syncToRemote: () => Promise<void>;
}

export const useEraFavoritesStore = create<EraFavoritesStore>()(
  persist(
    (set, get) => ({
      savedEras: [],
      _synced: false,

      toggleEra: (era) => {
        const isSaved = get().savedEras.some((e) => e.id === era.id);
        if (isSaved) {
          // Unsave: remove era + its tracks from playlist
          usePlaylistStore.getState().removeTracksByEra(era.id);
          set((s) => ({ savedEras: s.savedEras.filter((e) => e.id !== era.id) }));
          get().syncToRemote();
          return false;
        } else {
          set((s) => ({ savedEras: [...s.savedEras, era] }));
          get().syncToRemote();
          return true;
        }
      },

      removeEra: (id) => {
        // Also clear this era's tracks from playlist
        usePlaylistStore.getState().removeTracksByEra(id);
        set((s) => ({ savedEras: s.savedEras.filter((e) => e.id !== id) }));
        get().syncToRemote();
      },

      isEraSaved: (id) => {
        return get().savedEras.some((e) => e.id === id);
      },

      /** 从远程数据库拉取收藏 Era 并合并到本地 */
      fetchFromRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const res = await fetch('/api/era-favorites', { credentials: 'include' });
          if (!res.ok) return;

          const remoteEras: SavedEra[] = await res.json();
          if (remoteEras.length === 0) {
            const localEras = get().savedEras;
            if (localEras.length > 0) {
              await get().syncToRemote();
            }
            set({ _synced: true });
            return;
          }

          // 合并：远程为主，本地独有的追加
          const remoteIds = new Set(remoteEras.map((e) => e.id));
          const localOnly = get().savedEras.filter((e) => !remoteIds.has(e.id));
          const merged = [...remoteEras, ...localOnly];

          set({ savedEras: merged, _synced: true });
          if (localOnly.length > 0) {
            await get().syncToRemote();
          }
        } catch (e) {
          console.warn('[eraFavoritesStore] fetchFromRemote failed:', e);
        }
      },

      /** 将当前收藏 Era 全量同步到远程 */
      syncToRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          await fetch('/api/era-favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ eras: get().savedEras }),
          });
        } catch (e) {
          console.warn('[eraFavoritesStore] syncToRemote failed:', e);
        }
      },
    }),
    { name: 'era-favorites-storage', skipHydration: true }
  )
);
