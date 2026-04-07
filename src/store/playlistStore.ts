'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaylistTrack } from '@/types';
import { useAuthStore } from './authStore';

interface PlaylistStore {
  tracks: PlaylistTrack[];

  // Actions
  addTrack: (track: PlaylistTrack) => void;
  removeTrack: (id: string) => void;
  clearPlaylist: () => void;
  addTracksBulk: (tracks: PlaylistTrack[]) => void;
  hasTrack: (id: string) => boolean;
  removeTracksByEra: (eraId: string) => void;

  // Remote sync
  fetchFromRemote: () => Promise<void>;
  syncToRemote: () => Promise<void>;

  // Internal
  _clearLocal: () => void;
}

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => ({
      tracks: [],

      addTrack: (track) => {
        const exists = get().tracks.some((t) => t.id === track.id);
        if (exists) return;
        set((s) => ({ tracks: [...s.tracks, track] }));
        get().syncToRemote();
      },

      removeTrack: (id) => {
        set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) }));
        get().syncToRemote();
      },

      clearPlaylist: () => {
        set({ tracks: [] });
        get().syncToRemote();
      },

      addTracksBulk: (newTracks) => {
        set((s) => {
          const existingIds = new Set(s.tracks.map((t) => t.id));
          const unique = newTracks.filter((t) => !existingIds.has(t.id));
          return { tracks: [...s.tracks, ...unique] };
        });
        get().syncToRemote();
      },

      hasTrack: (id) => {
        return get().tracks.some((t) => t.id === id);
      },

      removeTracksByEra: (eraId) => {
        set((s) => ({ tracks: s.tracks.filter((t) => t.eraId !== eraId) }));
        get().syncToRemote();
      },

      /** 从远程拉取，直接替换本地数据（登录态专用） */
      fetchFromRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const res = await fetch('/api/playlist', { credentials: 'include' });
          if (!res.ok) return;

          const remoteTracks: PlaylistTrack[] = await res.json();
          // 登录态：远程数据为准，直接替换
          set({ tracks: remoteTracks });
        } catch (e) {
          console.warn('[playlistStore] fetchFromRemote failed:', e);
        }
      },

      /** 全量同步到远程 */
      syncToRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          await fetch('/api/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tracks: get().tracks }),
          });
        } catch (e) {
          console.warn('[playlistStore] syncToRemote failed:', e);
        }
      },

      /** 清空本地 localStorage 缓存（登出时调用） */
      _clearLocal: () => {
        set({ tracks: [] });
      },
    }),
    { name: 'ariana-playlist', skipHydration: true }
  )
);
