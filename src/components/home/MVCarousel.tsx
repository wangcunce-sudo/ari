'use client';

import { useRef, useCallback } from 'react';
import { FEATURED_MVS } from '@/data/eras';
import MVLightbox from '@/components/ui/MVLightbox';
import { useState } from 'react';

export default function MVCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);

  const updateProgress = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgressPct(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 510, behavior: 'smooth' });
  };

  return (
    <section className="bg-surface-container-low py-32 overflow-hidden relative" id="visuals">
      <div className="px-8 mb-16 flex items-center gap-8 max-w-7xl mx-auto">
        <h2 className="font-headline italic text-5xl text-on-surface">Music Videos</h2>
        <div className="flex-grow h-px bg-outline-variant" />
      </div>

      {/* Prev/Next */}
      <button
        onClick={() => scrollBy(-1)}
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-20 text-on-surface hover:text-tertiary transition-all bg-surface/60 backdrop-blur p-2"
        aria-label="Previous"
      >
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 0, "wght" 100' }}>
          arrow_back_ios
        </span>
      </button>
      <button
        onClick={() => scrollBy(1)}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-20 text-on-surface hover:text-tertiary transition-all bg-surface/60 backdrop-blur p-2"
        aria-label="Next"
      >
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 0, "wght" 100' }}>
          arrow_forward_ios
        </span>
      </button>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-8 md:px-16 carousel-drag pb-4"
        onScroll={updateProgress}
      >
        {FEATURED_MVS.map((mv) => (
          <div key={mv.src} className="flex-none w-[85vw] md:w-[480px] snap-center">
            <button
              className="block cursor-pointer w-full text-left"
              onClick={() => setLightboxSrc(mv.src)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-dim group">
                <img
                  className="mv-thumb w-full h-full object-cover"
                  src={mv.thumbnail}
                  alt={mv.title}
                  loading="lazy"
                />
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
              </div>
              <div className="mt-6">
                <p className="font-label text-xs tracking-widest uppercase text-outline mb-2">{mv.eraLabel}</p>
                <h4 className="font-headline italic text-2xl text-on-surface">{mv.title}</h4>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="px-8 md:px-16 mt-8 max-w-7xl mx-auto">
        <div className="progress-bar w-full">
          <div className="progress-fill" style={{ width: `${20 + progressPct * 0.8}%` }} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <MVLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </section>
  );
}
