'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ERA_LIST } from '@/data/eras';

export default function EraHero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panels = containerRef.current?.querySelectorAll<HTMLElement>('.hero-panel');
    if (!panels) return;

    function revealNext(index: number) {
      if (!panels || index >= panels.length) return;
      const panel = panels[index];
      panel.classList.add('revealed');
      panel.addEventListener('animationend', () => {
        // 动画结束后清除 animation，避免 clip-path 状态冲突
        (panel as HTMLElement).style.animation = 'none';
        const img = panel.querySelector<HTMLElement>('.hero-panel-img');
        if (img) img.style.animation = 'none';
        revealNext(index + 1);
      }, { once: true });
    }

    const t = setTimeout(() => revealNext(0), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={containerRef}
      id="era-hero"
      className="flex flex-row h-[56vw] max-h-[92vh] min-h-[260px] w-full overflow-hidden bg-background"
    >
      {ERA_LIST.map((era) => (
        <div
          key={era.id}
          className="hero-panel relative min-w-0 overflow-hidden cursor-pointer"
          onClick={() => router.push(`/era/${era.id}`)}
        >
          <Image
            src={era.heroImage}
            alt={era.name}
            fill
            className="hero-panel-img object-cover"
            style={{ objectPosition: era.heroObjectPosition || 'center top' }}
            sizes="(max-width: 640px) 50vw, 15vw"
            priority={['eternal-sunshine', 'yours-truly'].includes(era.id)}
          />

          {/* 底部渐变遮罩 */}
          <div className="hero-panel-overlay absolute inset-0 pointer-events-none z-[1]" />
        </div>
      ))}
    </div>
  );
}
