'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Track } from '@/types';

interface Props {
  tracks: Track[];
  accentColor: string;
  albumArt?: string;
  albumTitle: string;
  albumYear: number;
  spotifyUrl?: string;
}

// 把 AudioPlayer 状态提升到顶层，通过 context 共享给 Tracklist
// 这里暴露一个 compound 组件模式：AudioPlayer 自身只渲染控制区，
// 通过 ref callback 暴露 goTo/currentIdx/isPlaying 供父层调用

export default function AudioPlayer({ tracks, accentColor, albumArt, albumTitle, albumYear, spotifyUrl }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentIdx];

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
    <div className="lg:sticky lg:top-24 space-y-6 md:space-y-8">
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
          <p className="font-headline italic text-base truncate mb-0.5" style={{ color: isPlaying ? accentColor : 'transparent', transition: 'color 0.3s' }}>
            {currentTrack.title}
          </p>
        )}
        <p className="text-on-surface-variant font-body uppercase tracking-widest text-xs">
          Ariana Grande — {albumYear}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div
          className="progress-bar w-full cursor-pointer"
          onClick={handleProgressClick}
        >
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
        <button className="border border-on-surface px-6 py-3 font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-surface-container-low transition-all duration-300">
          Save Era
        </button>
      </div>

      {/* Tracklist (mobile only — desktop version is in right column) */}
      <div className="lg:hidden">
        <TracklistBlock
          tracks={tracks}
          currentIdx={currentIdx}
          isPlaying={isPlaying}
          accentColor={accentColor}
          onSelect={goToAndPlay}
        />
      </div>
    </div>
  );
}

// ─── Tracklist 独立块（桌面右列复用，移动端内嵌） ─────────────────────
interface TracklistProps {
  tracks: Track[];
  currentIdx: number;
  isPlaying: boolean;
  accentColor: string;
  onSelect: (idx: number) => void;
}

export function TracklistBlock({ tracks, currentIdx, isPlaying, accentColor, onSelect }: TracklistProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4">
        <h4 className="font-body uppercase tracking-[0.2em] text-xs font-bold text-on-surface-variant">
          Tracklist
        </h4>
        <span className="text-xs font-body text-on-surface-variant">{tracks.length} Tracks</span>
      </div>
      <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1 tracklist-scroll">
        {tracks.map((track, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={idx}
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-sm transition-colors ${
                isActive ? '' : 'hover:bg-surface-container/50'
              }`}
              style={isActive ? { backgroundColor: `rgba(${hexToRgb(accentColor)},0.12)` } : {}}
            >
              <span className="w-5 text-center text-xs font-body text-on-surface-variant/60 flex-shrink-0">
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
                className="flex-grow text-sm font-body truncate"
                style={isActive ? { color: accentColor, fontWeight: 500 } : {}}
              >
                {track.title}
              </span>
              <span className="text-xs font-body text-on-surface-variant/50 flex-shrink-0">
                {track.duration || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
