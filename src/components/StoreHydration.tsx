'use client';

import { useEffect } from 'react';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useAuthStore } from './authStore';

export default function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Step 1: 从 localStorage 恢复本地状态
    usePlaylistStore.persist.rehydrate();
    useEraFavoritesStore.persist.rehydrate();

    // Step 2: 初始化 auth（从 cookie 恢复登录态）
    useAuthStore.getState().init().then(() => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const playlistSynced = usePlaylistStore.getState()._synced;
      const eraSynced = useEraFavoritesStore.getState()._synced;

      // Step 3: 登录状态下，从远程拉取并合并
      if (!playlistSynced) {
        usePlaylistStore.getState().fetchFromRemote();
      }
      if (!eraSynced) {
        useEraFavoritesStore.getState().fetchFromRemote();
      }
    });
  }, []);

  return <>{children}</>;
}
