'use client';

import { useState } from 'react';
import type { MusicVideo } from '@/types';
import MVLightbox from '@/components/ui/MVLightbox';

interface Props {
  videos: MusicVideo[];
}

export default function EraVideoGallery({ videos }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!videos.length) return null;

  return (
    <section className="py-14 md:py-24 bg-surface-container-low overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-12">
        <div className="mb-8 md:mb-16">
          <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant mb-2">
            Visual Narratives
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline italic tracking-tight">
            Music Videos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {videos.map((v, i) => (
            <button
              key={i}
              onClick={() => v.src && setLightboxSrc(v.src)}
              className="text-left group block"
              disabled={!v.src}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-dim">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">movie</span>
                  </div>
                )}
                {v.src && (
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span
                        className="material-symbols-outlined text-white text-4xl translate-x-0.5"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        play_arrow
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="font-label text-xs tracking-widest uppercase text-outline mb-1">
                  {v.year}
                </p>
                <h4 className="font-headline italic text-xl text-on-surface">{v.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxSrc && (
        <MVLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </section>
  );
}
