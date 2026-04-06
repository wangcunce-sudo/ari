'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlaylistStore } from '@/store/playlistStore';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';

export default function PlaylistPage() {
  const tracks = usePlaylistStore(s => s.tracks);
  const removeTrack = usePlaylistStore(s => s.removeTrack);
  const clearPlaylist = usePlaylistStore(s => s.clearPlaylist);
  const savedEras = useEraFavoritesStore(s => s.savedEras);
  const removeEra = useEraFavoritesStore(s => s.removeEra);

  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearPlaylist();
    setConfirmClear(false);
    showToast('Playlist cleared');
  };

  const handleRemoveEra = (eraId: string, eraName: string) => {
    removeEra(eraId);
    showToast(`${eraName} unsaved`);
  };

  return (
    <div className="pt-20 pb-32 md:pb-16 min-h-screen bg-surface">
      <div className="px-8 py-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end gap-8 mb-12">
          <h1 className="font-headline italic text-5xl md:text-7xl text-on-surface">Playlist</h1>
          <div className="flex-grow h-px bg-outline-variant mb-3" />
          <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
            {tracks.length} Tracks
          </span>
        </div>

        {/* Saved Eras */}
        {savedEras.length > 0 && (
          <div className="mb-16">
            <h2 className="font-body uppercase tracking-[0.2em] text-xs font-bold text-on-surface-variant mb-6">
              Saved Eras
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {savedEras.map(era => (
                <div key={era.id} className="group relative">
                  <Link
                    href={`/era/${era.id}`}
                    className="block aspect-square overflow-hidden bg-surface-container-lowest relative"
                  >
                    <img
                      src={era.heroImage}
                      alt={era.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    {/* 2px accent color border at bottom */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: era.accentColor }}
                    />
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-headline italic text-sm text-on-surface leading-tight truncate">
                        {era.name}
                      </p>
                      <p className="text-[10px] font-body text-on-surface-variant">{era.year}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveEra(era.id, era.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Unsave era"
                    >
                      <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-on-surface">
                        close
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracklist */}
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4">
          <h2 className="font-body uppercase tracking-[0.2em] text-xs font-bold text-on-surface-variant">
            All Tracks
          </h2>
          {tracks.length > 0 && (
            <button
              onClick={handleClear}
              className={`font-label text-xs tracking-widest uppercase transition-all ${
                confirmClear
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {confirmClear ? 'Click again to confirm' : 'Clear All'}
            </button>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
              queue_music
            </span>
            <p className="font-headline italic text-2xl text-on-surface-variant mb-2">
              No tracks yet
            </p>
            <p className="font-body text-sm text-on-surface-variant/60 mb-8">
              Save an Era or add tracks from the player to build your playlist.
            </p>
            <Link
              href="/#archive"
              className="inline-flex items-center gap-2 border border-on-surface px-8 py-3 font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-surface-container-low transition-all duration-300"
            >
              <span className="material-symbols-outlined text-sm">subscriptions</span>
              Browse Eras
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container/50 transition-colors group/track"
              >
                <span className="w-5 text-center text-xs font-body text-on-surface-variant/60 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-grow min-w-0">
                  <span className="block text-sm font-body truncate text-on-surface">
                    {track.title}
                  </span>
                  <span className="block text-[10px] font-body text-on-surface-variant/60">
                    <Link
                      href={`/era/${track.eraId}`}
                      className="hover:underline"
                      style={{ color: track.accentColor }}
                    >
                      {track.eraName}
                    </Link>
                    {' · '}{track.eraYear}
                  </span>
                </span>
                <span className="text-xs font-body text-on-surface-variant/50 flex-shrink-0">
                  {track.duration || ''}
                </span>
                <button
                  onClick={() => {
                    removeTrack(track.id);
                    showToast(`${track.title} removed`);
                  }}
                  className="opacity-0 group-hover/track:opacity-100 transition-opacity flex-shrink-0 p-0.5"
                  title="Remove from playlist"
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-8 py-3 text-xs tracking-widest uppercase z-50 whitespace-nowrap show">
          {toast}
        </div>
      )}
    </div>
  );
}
