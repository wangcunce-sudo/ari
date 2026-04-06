'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ERA_LIST } from '@/data/eras';
import { useEraFavoritesStore } from '@/store/eraFavoritesStore';

const GRID_WIDE = 'md:col-span-2 lg:col-span-3';

export default function ArchiveGrid() {
  const savedEras = useEraFavoritesStore(s => s.savedEras);
  const removeEra = useEraFavoritesStore(s => s.removeEra);
  const savedEraIds = new Set(savedEras.map(e => e.id));
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Config for aspect ratio special case
  const eraPortraitPosition: Record<string, string> = {
    'yours-truly': '40% top',
    'my-everything': 'center top',
    'dangerous-woman': '70% top',
    'sweetener': '25% top',
    'thank-u-next': 'center top',
    'positions': 'center top',
    'eternal-sunshine': 'center top',
  };

  return (
    <section className="py-32 px-8 bg-surface" id="archive">
      <div className="mb-20 flex items-center gap-8 max-w-7xl mx-auto">
        <h2 className="font-headline italic text-5xl md:text-6xl text-on-surface whitespace-nowrap">
          Archive
        </h2>
        <div className="flex-grow h-px bg-outline-variant" />
        <p className="hidden md:block font-label text-xs tracking-widest uppercase text-on-surface-variant opacity-70">
          Hover to Explore
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {ERA_LIST.map((era, i) => {
          const isWide = era.id === 'eternal-sunshine';
          const isSaved = mounted && savedEraIds.has(era.id);

          return (
            <div key={era.id} className={`relative z-10 ${isSaved ? 'neon-wrapper' : ''} ${isWide ? GRID_WIDE : ''}`}>
              {/* Neon glow effect — only for saved eras, outside overflow-hidden */}
              {isSaved && (
                <NeonGlow accentColor={era.accentColor} isWide={isWide} />
              )}

              <Link
                href={`/era/${era.id}`}
                className={`archive-card group relative overflow-hidden bg-white cursor-pointer block ${
                  isWide ? 'aspect-[16/7]' : 'aspect-[3/4]'
                } ${isSaved ? 'neon-card' : ''}`}
                style={isSaved ? { '--neon-color': era.accentColor } as React.CSSProperties : {}}
              >
                {/* Era name sprite */}
                <div className="archive-logo relative z-10 w-full h-full bg-white">
                  <div className="era-sprite-wrap">
                    <div className={`era-sprite-box ${era.spriteClass}`} />
                  </div>
                </div>

                {/* Portrait image */}
                <img
                  className="archive-portrait absolute inset-0 w-full h-full object-cover opacity-0"
                  style={{ objectPosition: eraPortraitPosition[era.id] || 'center top' }}
                  src={era.heroImage}
                  alt={`${era.name} Era`}
                  loading={i < 3 ? 'eager' : 'lazy'}
                />

                {/* Saved badge — only visible on hover */}
                {isSaved && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeEra(era.id);
                    }}
                    className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:scale-105"
                    style={{ backgroundColor: `rgba(${hexToRgb(era.accentColor)},0.2)` }}
                  >
                    <span
                      className="material-symbols-outlined text-xs"
                      style={{ color: era.accentColor, fontVariationSettings: '"FILL" 1' }}
                    >
                      bookmark_remove
                    </span>
                    <span className="text-[9px] font-body uppercase tracking-widest" style={{ color: era.accentColor }}>
                      Unsave
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-center pb-16">
                  <button
                    className={`archive-btn era-button-bg text-white text-[10px] tracking-[0.3em] uppercase ${
                      isWide ? 'px-12 py-4 text-[11px]' : 'px-8 py-3'
                    }`}
                  >
                    View This Era
                  </button>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Neon glow layer — positioned outside the overflow-hidden card */
function NeonGlow({ accentColor, isWide }: { accentColor: string; isWide: boolean }) {
  const glowColor = hexToRgba(accentColor, 0.35);
  const borderColor = hexToRgba(accentColor, 0.7);

  return (
    <>
      {/* Outer glow (pulse 3s) */}
      <div
        className="neon-glow-pulse pointer-events-none absolute -inset-8 z-0"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      {/* Flowing border (rotate 4s) */}
      <div
        className="neon-glow-border pointer-events-none absolute -inset-1 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-[-50%]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${borderColor} 30%, transparent 55%)`,
            animation: 'neonBorderSpin 4s linear infinite',
          }}
        />
      </div>
    </>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
