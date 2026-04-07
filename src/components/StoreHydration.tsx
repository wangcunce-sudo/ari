'use client';

import { useEffect } from 'react';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useAuthStore } from '@/store/authStore';

export default function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      // 初始化 auth（从 cookie 恢复登录态）
      await useAuthStore.getState().init();

      const user = useAuthStore.getState().user;

      if (user) {
        // 登录态：清空 localStorage 缓存，完全从远程拉取
        usePlaylistStore.setState({ tracks: [] });
        useEraFavoritesStore.setState({ savedEras: [] });

        // 并行拉取远程数据
        await Promise.all([
          usePlaylistStore.getState().fetchFromRemote(),
          useEraFavoritesStore.getState().fetchFromRemote(),
        ]);
      } else {
        // 游客态：从 localStorage 恢复
        usePlaylistStore.persist.rehydrate();
        useEraFavoritesStore.persist.rehydrate();
      }
    };

    init();
  }, []);

  return <>{children}</>;
}
