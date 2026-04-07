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

  // Actions
  toggleEra: (era: SavedEra) => boolean;
  removeEra: (id: string) => void;
  isEraSaved: (id: string) => boolean;

  // Remote sync
  fetchFromRemote: () => Promise<void>;
  syncToRemote: () => Promise<void>;

  // Internal
  _clearLocal: () => void;
}

export const useEraFavoritesStore = create<EraFavoritesStore>()(
  persist(
    (set, get) => ({
      savedEras: [],

      toggleEra: (era) => {
        const isSaved = get().savedEras.some((e) => e.id === era.id);
        if (isSaved) {
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
        usePlaylistStore.getState().removeTracksByEra(id);
        set((s) => ({ savedEras: s.savedEras.filter((e) => e.id !== id) }));
        get().syncToRemote();
      },

      isEraSaved: (id) => {
        return get().savedEras.some((e) => e.id === id);
      },

      /** 从远程拉取，直接替换本地数据（登录态专用） */
      fetchFromRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const res = await fetch('/api/era-favorites', { credentials: 'include' });
          if (!res.ok) return;

          const remoteEras: SavedEra[] = await res.json();
          // 登录态：远程数据为准，直接替换
          set({ savedEras: remoteEras });
        } catch (e) {
          console.warn('[eraFavoritesStore] fetchFromRemote failed:', e);
        }
      },

      /** 全量同步到远程 */
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

      /** 清空本地 localStorage 缓存（登出时调用） */
      _clearLocal: () => {
        set({ savedEras: [] });
      },
    }),
    { name: 'era-favorites-storage', skipHydration: true }
  )
);
