import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ERA_MAP, ERA_LIST } from '@/data/eras';
import { PRODUCTS } from '@/data/products';
import EraPlayerSection from '@/components/era/EraPlayerSection';
import EraVideoGallery from '@/components/era/EraVideoGallery';
import EraHeroStrip from '@/components/era/EraHeroStrip';
import EraCartButton from '@/components/era/EraCartButton';

interface Props {
  params: Promise<{ eraId: string }>;
}

export async function generateStaticParams() {
  return ERA_LIST.map(era => ({ eraId: era.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eraId } = await params;
  const era = ERA_MAP[eraId];
  if (!era) return { title: 'Era | Ariana Grande' };
  return { title: `${era.name} Era | Ariana Grande`, description: era.tagline };
}

const albumArtMap: Record<string, string> = {
  'yours-truly': '/images/albumcover/01_Yours_Truly_(2013).jpg',
  'my-everything': '/images/albumcover/02_My_Everything_(2014).jpg',
  'dangerous-woman': '/images/albumcover/03_Dangerous_Woman_(2016).jpg',
  'sweetener': '/images/albumcover/04_Sweetener_(2018).jpg',
  'thank-u-next': '/images/albumcover/05_thank_u_next_(2019).jpg',
  'positions': '/images/albumcover/06_Positions_(2020).jpg',
  'eternal-sunshine': '/images/albumcover/07_eternal_sunshine_(2024).jpg',
};

const spotifyMap: Record<string, string> = {
  'yours-truly': 'https://open.spotify.com/album/4vHmQZhGDMKpxAMuCzLkLy',
  'my-everything': 'https://open.spotify.com/album/3CxOagORZFM7cISbJAHJJh',
  'dangerous-woman': 'https://open.spotify.com/album/3BmBCRumLHLJBTNNfXMbP0',
  'sweetener': 'https://open.spotify.com/album/3tx8gQqWbGwqIGZDCeoNaM',
  'thank-u-next': 'https://open.spotify.com/album/2fYhqwDWXjbpjaIJPEfKFw',
  'positions': 'https://open.spotify.com/album/5PjdY0CKGZdEuoNab3yDmX',
  'eternal-sunshine': 'https://open.spotify.com/album/4pYhqwDWXjbpjaIJPEfKFw',
};

export default async function EraPage({ params }: Props) {
  const { eraId } = await params;
  const era = ERA_MAP[eraId];
  if (!era) notFound();

  // 筛出属于当前 era 的商品，最多展示 6 件
  const eraProducts = PRODUCTS.filter(p => p.era === era.name).slice(0, 6);

  return (
    <>
      {/* Era Hero Strip */}
      <EraHeroStrip currentEraId={eraId} />

      {/* Era Header */}
      <section className="py-10 md:py-16 px-4 md:px-12 bg-surface max-w-screen-2xl mx-auto">
        <h1 className="font-headline italic text-4xl md:text-6xl mb-2" style={{ color: era.accentColor }}>
          {era.name}
        </h1>
        <p className="font-body text-on-surface-variant text-lg">{era.tagline}</p>
      </section>

      {/* Player + Tracklist (2-column on desktop) */}
      <section
        className="pb-16 md:pb-24 px-4 md:px-12 bg-surface max-w-screen-2xl mx-auto"
        style={{ ['--era-accent' as string]: era.accentColor }}
      >
        <EraPlayerSection
          tracks={era.tracks}
          accentColor={era.accentColor}
          albumArt={albumArtMap[eraId]}
          albumTitle={era.name}
          albumYear={era.year}
          spotifyUrl={spotifyMap[eraId]}
          eraId={eraId}
          eraAccentColor={era.accentColor}
          eraHeroImage={era.heroImage}
          eraName={era.name}
        />
      </section>

      {/* Videos */}
      {era.videos.length > 0 && <EraVideoGallery videos={era.videos} />}

      {/* Era Merch */}
      {eraProducts.length > 0 && (
      <section className="py-14 md:py-24 px-4 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-16">
            <div>
              <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant mb-2">Curated Objects</p>
              <h2 className="font-headline italic text-3xl md:text-5xl">{era.name} Merch</h2>
            </div>
            <div className="flex-grow h-px bg-outline-variant hidden md:block" />
            <Link
              href="/store"
              className="hidden md:block font-label text-xs tracking-widest uppercase border-b border-on-surface/20 pb-1 hover:opacity-70 whitespace-nowrap"
            >
              View All
            </Link>
          </div>

          <div className={`grid grid-cols-2 gap-6 md:gap-12 ${eraProducts.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-3'}`}>
            {eraProducts.map(p => (
              <div key={p.id} className="group">
                <div className="relative aspect-square mb-4 overflow-hidden bg-surface-container-lowest">
                  {p.img ? (
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                    </div>
                  )}
                  <EraCartButton productId={p.id} productName={p.name} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-headline text-base text-on-surface">{p.name}</h5>
                    <span className="font-label text-sm text-on-surface-variant">${p.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs tracking-widest uppercase text-outline">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Back to Archive */}
      <section className="py-14 md:py-24 bg-surface-container-low text-center pb-28 md:pb-24">
        <Link
          href="/#archive"
          className="inline-flex items-center gap-3 font-headline italic text-2xl text-on-surface hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Archive
        </Link>
      </section>
    </>
  );
}
