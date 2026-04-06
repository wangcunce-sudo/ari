'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlaylistStore } from './playlistStore';

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
  toggleEra: (era: SavedEra) => boolean; // returns true if now saved
  removeEra: (id: string) => void;       // also removes era's tracks from playlist
  isEraSaved: (id: string) => boolean;
}

export const useEraFavoritesStore = create<EraFavoritesStore>()(
  persist(
    (set, get) => ({
      savedEras: [],

      toggleEra: (era) => {
        const isSaved = get().savedEras.some(e => e.id === era.id);
        if (isSaved) {
          // Unsave: remove era + its tracks from playlist
          usePlaylistStore.getState().removeTracksByEra(era.id);
          set(s => ({ savedEras: s.savedEras.filter(e => e.id !== era.id) }));
          return false;
        } else {
          set(s => ({ savedEras: [...s.savedEras, era] }));
          return true;
        }
      },

      removeEra: (id) => {
        // Also clear this era's tracks from playlist
        usePlaylistStore.getState().removeTracksByEra(id);
        set(s => ({ savedEras: s.savedEras.filter(e => e.id !== id) }));
      },

      isEraSaved: (id) => {
        return get().savedEras.some(e => e.id === id);
      },
    }),
    { name: 'era-favorites-storage', skipHydration: true }
  )
);
