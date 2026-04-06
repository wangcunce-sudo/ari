'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaylistTrack } from '@/types';

interface PlaylistStore {
  tracks: PlaylistTrack[];

  // Actions
  addTrack: (track: PlaylistTrack) => void;
  removeTrack: (id: string) => void;
  clearPlaylist: () => void;
  addTracksBulk: (tracks: PlaylistTrack[]) => void;
  hasTrack: (id: string) => boolean;
  removeTracksByEra: (eraId: string) => void;
}

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => ({
      tracks: [],

      addTrack: (track) => {
        const exists = get().tracks.some(t => t.id === track.id);
        if (exists) return;
        set(s => ({ tracks: [...s.tracks, track] }));
      },

      removeTrack: (id) => {
        set(s => ({ tracks: s.tracks.filter(t => t.id !== id) }));
      },

      clearPlaylist: () => {
        set({ tracks: [] });
      },

      addTracksBulk: (newTracks) => {
        set(s => {
          const existingIds = new Set(s.tracks.map(t => t.id));
          const unique = newTracks.filter(t => !existingIds.has(t.id));
          return { tracks: [...s.tracks, ...unique] };
        });
      },

      hasTrack: (id) => {
        return get().tracks.some(t => t.id === id);
      },

      removeTracksByEra: (eraId) => {
        set(s => ({ tracks: s.tracks.filter(t => t.eraId !== eraId) }));
      },
    }),
    { name: 'ariana-playlist', skipHydration: true }
  )
);
