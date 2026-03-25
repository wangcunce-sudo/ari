import Link from 'next/link';
import { ERA_LIST } from '@/data/eras';

export default function ArchiveGrid() {
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
          return (
            <Link
              key={era.id}
              href={`/era/${era.id}`}
              className={`archive-card group relative overflow-hidden bg-white cursor-pointer block ${
                isWide ? 'md:col-span-2 lg:col-span-3 aspect-[16/7]' : 'aspect-[3/4]'
              }`}
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
          );
        })}
      </div>
    </section>
  );
}
