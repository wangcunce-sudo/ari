'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaylistTrack } from '@/types';
import { useAuthStore } from './authStore';

interface PlaylistStore {
  tracks: PlaylistTrack[];
  _synced: boolean; // 标记是否已和远程同步过

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
}

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => ({
      tracks: [],
      _synced: false,

      addTrack: (track) => {
        const exists = get().tracks.some((t) => t.id === track.id);
        if (exists) return;
        set((s) => ({ tracks: [...s.tracks, track] }));
        // 异步同步到远程（fire-and-forget）
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

      /** 从远程数据库拉取播放列表并合并到本地 */
      fetchFromRemote: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const res = await fetch('/api/playlist', { credentials: 'include' });
          if (!res.ok) return;

          const remoteTracks: PlaylistTrack[] = await res.json();
          if (remoteTracks.length === 0) {
            // 远程为空，把本地数据推上去
            const localTracks = get().tracks;
            if (localTracks.length > 0) {
              await get().syncToRemote();
            }
            set({ _synced: true });
            return;
          }

          // 合并策略：以远程为主，本地去重追加
          const remoteIds = new Set(remoteTracks.map((t) => t.id));
          const localOnly = get().tracks.filter((t) => !remoteIds.has(t.id));
          const merged = [...remoteTracks, ...localOnly];

          set({ tracks: merged, _synced: true });
          // 如果有本地独有的，也同步上去
          if (localOnly.length > 0) {
            await get().syncToRemote();
          }
        } catch (e) {
          console.warn('[playlistStore] fetchFromRemote failed:', e);
        }
      },

      /** 将当前本地播放列表全量同步到远程 */
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
    }),
    { name: 'ariana-playlist', skipHydration: true }
  )
);
