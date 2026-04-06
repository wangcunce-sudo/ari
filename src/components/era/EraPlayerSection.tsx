'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Track, PlaylistTrack } from '@/types';
import { usePlaylistStore } from '@/store/playlistStore';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';

interface Props {
  tracks: Track[];
  accentColor: string;
  albumArt?: string;
  albumTitle: string;
  albumYear: number;
  spotifyUrl?: string;
  eraId?: string;
  eraAccentColor?: string;
  eraHeroImage?: string;
  eraName?: string;
}

export default function EraPlayerSection({ tracks, accentColor, albumArt, albumTitle, albumYear, spotifyUrl, eraId, eraAccentColor, eraHeroImage, eraName }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState('0:00');
  const [toast, setToast] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addTrack = usePlaylistStore(s => s.addTrack);
  const addTracksBulk = usePlaylistStore(s => s.addTracksBulk);
  const hasTrack = usePlaylistStore(s => s.hasTrack);
  const playlistTracks = usePlaylistStore(s => s.tracks);
  const savedEras = useEraFavoritesStore(s => s.savedEras);
  const toggleEra = useEraFavoritesStore(s => s.toggleEra);
  const isEraSaved = eraId ? savedEras.some(e => e.id === eraId) : false;

  const currentTrack = tracks[currentIdx];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const makePlaylistTrack = (track: Track, idx: number): PlaylistTrack => ({
    ...track,
    id: `${eraId ?? 'unknown'}:${track.title}`,
    eraId: eraId ?? 'unknown',
    eraName: eraName ?? albumTitle,
    eraYear: albumYear,
    accentColor: eraAccentColor ?? accentColor,
    albumArt,
  });

  const handleAddTrack = (track: Track, idx: number) => {
    const pt = makePlaylistTrack(track, idx);
    if (hasTrack(pt.id)) {
      showToast('Already in playlist');
      return;
    }
    addTrack(pt);
    showToast('Added to playlist');
  };

  const handleSaveEra = () => {
    if (!eraId || !eraName || !eraHeroImage) return;
    const nowSaved = toggleEra({
      id: eraId,
      name: eraName,
      year: albumYear,
      accentColor: eraAccentColor ?? accentColor,
      heroImage: eraHeroImage,
    });
    if (nowSaved) {
      // 首次保存 Era：批量添加所有曲目到播放列表
      const playlistTracks = tracks.map((t, i) => makePlaylistTrack(t, i));
      addTracksBulk(playlistTracks);
      showToast(`${eraName} saved — ${playlistTracks.length} tracks added`);
    } else {
      showToast(`${eraName} unsaved`);
    }
  };

  const loadTrack = useCallback((idx: number, autoPlay = false) => {
    const track = tracks[idx];
    if (!track?.audioSrc) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = track.audioSrc;
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
    setProgress(0);
    setCurrentTime('0:00');
    setDurationStr(track.duration || '0:00');
  }, [tracks]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(formatTime(audio.currentTime));
      }
    });
    audio.addEventListener('durationchange', () => {
      setDurationStr(formatTime(audio.duration));
    });
    audio.addEventListener('ended', () => {
      const nextIdx = (currentIdx + 1) % tracks.length;
      setCurrentIdx(nextIdx);
      setTimeout(() => loadTrack(nextIdx, true), 50);
    });

    loadTrack(0, false);
    return () => { audio.pause(); audio.src = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioSrc) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === window.location.href) {
        loadTrack(currentIdx, true);
        return;
      }
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const goTo = (idx: number) => {
    setCurrentIdx(idx);
    loadTrack(idx, isPlaying);
  };

  // 点击曲目列表时，强制播放（无论之前是否在播放）
  const goToAndPlay = (idx: number) => {
    setCurrentIdx(idx);
    loadTrack(idx, true);
  };

  const handlePrev = () => goTo((currentIdx - 1 + tracks.length) % tracks.length);
  const handleNext = () => goTo((currentIdx + 1) % tracks.length);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  return (
    /* 桌面 2 列：左播放器控制 / 右 Tracklist；移动端单列堆叠 */
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

      {/* ─── 左：播放器控制 ─── */}
      <div className="lg:sticky lg:top-24 space-y-6">
        {/* Album Art */}
        <div className="w-40 md:w-full aspect-square bg-surface-container-low p-3 md:p-4 shadow-sm overflow-hidden mx-auto md:mx-0">
          {albumArt ? (
            <img src={albumArt} alt="Album Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">album</span>
            </div>
          )}
        </div>

        {/* Album info */}
        <div>
          <h3 className="font-headline text-2xl md:text-3xl italic mb-1 text-on-surface">
            {albumTitle}
          </h3>
          {currentTrack && (
            <p
              className="font-headline italic text-base truncate mb-0.5 transition-colors duration-300"
              style={{ color: isPlaying ? accentColor : 'transparent' }}
            >
              {currentTrack.title}
            </p>
          )}
          <p className="text-on-surface-variant font-body uppercase tracking-widest text-xs">
            Ariana Grande — {albumYear}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="progress-bar w-full cursor-pointer" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-body tracking-widest uppercase opacity-50">
            <span>{currentTime}</span>
            <span>{durationStr}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={handlePrev}
            className="material-symbols-outlined text-3xl text-on-surface/70 hover:text-primary transition-colors"
            aria-label="Previous"
          >
            skip_previous
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-on-surface text-surface flex items-center justify-center hover:bg-primary transition-all duration-300"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={handleNext}
            className="material-symbols-outlined text-3xl text-on-surface/70 hover:text-primary transition-colors"
            aria-label="Next"
          >
            skip_next
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-container px-6 py-3 font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-tertiary-container transition-all duration-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">music_note</span>
              Listen on Spotify
            </a>
          )}
          {eraId && (
            <button
              onClick={handleSaveEra}
              className={`flex items-center gap-2 border px-6 py-3 font-body font-bold uppercase tracking-[0.15em] text-xs transition-all duration-300 ${
                isEraSaved
                  ? 'border-current'
                  : 'border-on-surface hover:bg-surface-container-low'
              }`}
              style={isEraSaved ? { borderColor: accentColor, color: accentColor } : {}}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={isEraSaved ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {isEraSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
              {isEraSaved ? 'Saved' : 'Save Era'}
            </button>
          )}
          <Link
            href="/playlist"
            className="flex items-center gap-2 border border-on-surface/30 px-6 py-3 font-body font-bold uppercase tracking-[0.15em] text-xs text-on-surface-variant hover:bg-surface-container-low transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm">queue_music</span>
            Playlist
          </Link>
        </div>
      </div>

      {/* ─── 右：Tracklist ─── */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4">
          <h4 className="font-body uppercase tracking-[0.2em] text-xs font-bold text-on-surface-variant">
            Tracklist
          </h4>
          <span className="text-xs font-body text-on-surface-variant">{tracks.length} Tracks</span>
        </div>
        <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1 tracklist-scroll">
          {tracks.map((track, idx) => {
            const isActive = idx === currentIdx;
            const trackId = `${eraId ?? 'unknown'}:${track.title}`;
            const inPlaylist = playlistTracks.some(t => t.id === trackId);
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-sm transition-colors group/track ${
                  isActive ? '' : 'hover:bg-surface-container/50'
                }`}
                style={isActive ? { backgroundColor: `rgba(${hexToRgb(accentColor)},0.12)` } : {}}
              >
                <span
                  onClick={() => goToAndPlay(idx)}
                  className="w-5 text-center text-xs font-body text-on-surface-variant/60 flex-shrink-0"
                >
                  {isActive ? (
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: accentColor, fontVariationSettings: '"FILL" 1' }}
                    >
                      {isPlaying ? 'volume_up' : 'music_note'}
                    </span>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  onClick={() => goToAndPlay(idx)}
                  className="flex-grow text-sm font-body truncate"
                  style={isActive ? { color: accentColor, fontWeight: 500 } : {}}
                >
                  {track.title}
                </span>
                <span className="text-xs font-body text-on-surface-variant/50 flex-shrink-0">
                  {track.duration || ''}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddTrack(track, idx); }}
                  className="opacity-0 group-hover/track:opacity-100 transition-opacity flex-shrink-0 p-0.5"
                  title={inPlaylist ? 'Already in playlist' : 'Add to playlist'}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: inPlaylist ? accentColor : undefined, fontVariationSettings: inPlaylist ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    playlist_add
                  </span>
                </button>
              </div>
            );
          })}
        </div>
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

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
