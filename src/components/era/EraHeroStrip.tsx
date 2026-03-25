'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ERA_LIST } from '@/data/eras';

interface Props {
  currentEraId: string;
}

export default function EraHeroStrip({ currentEraId }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // 串行入场动画：animationend 驱动，与首页 EraHero 完全一致
  useEffect(() => {
    const panels = containerRef.current?.querySelectorAll<HTMLElement>('.era-strip-panel');
    if (!panels) return;

    function revealNext(index: number) {
      if (!panels || index >= panels.length) return;
      const panel = panels[index];
      panel.classList.add('revealed');
      panel.addEventListener('animationend', () => revealNext(index + 1), { once: true });
    }

    const t = setTimeout(() => revealNext(0), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={containerRef}
      id="era-hero"
      className="era-strip-container flex flex-row h-[56vw] max-h-[92vh] min-h-[180px] w-full overflow-hidden bg-background mt-16"
    >
      {ERA_LIST.map((era) => {
        const isActive = era.id === currentEraId;
        return (
          <div
            key={era.id}
            className={`era-strip-panel relative min-w-0 overflow-hidden cursor-pointer${isActive ? ' active-era' : ''}`}
            onClick={() => {
              if (era.id !== currentEraId) router.push(`/era/${era.id}`);
            }}
          >
            <img
              src={era.heroImage}
              alt={era.name}
              className="era-strip-img w-full h-full object-cover"
              style={{ objectPosition: era.heroObjectPosition || 'center top' }}
            />
            <div className="era-strip-overlay absolute inset-0 pointer-events-none z-[1]" />
          </div>
        );
      })}
    </div>
  );
}
