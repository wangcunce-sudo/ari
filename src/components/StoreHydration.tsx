'use client';

import { useEffect } from 'react';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';
import { usePlaylistStore } from '@/store/playlistStore';

export default function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manually rehydrate persisted stores on client only, after mount.
    // Both stores use skipHydration: true to prevent SSR ↔ client mismatch.
    usePlaylistStore.persist.rehydrate();
    useEraFavoritesStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
