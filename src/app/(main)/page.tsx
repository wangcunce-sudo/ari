import type { Metadata } from 'next';
import HomeHero from '@/components/home/HomeHero';
import ArchiveGrid from '@/components/home/ArchiveGrid';
import MVCarousel from '@/components/home/MVCarousel';
import MiniStore from '@/components/home/MiniStore';

export const metadata: Metadata = {
  title: 'Ariana Grande | Official',
  description: 'Explore the complete discography, music videos, and exclusive merchandise of Ariana Grande.',
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section — 全屏单图，对应原版 index.html */}
      <HomeHero />

      {/* Archive Grid */}
      <ArchiveGrid />

      {/* Music Videos */}
      <MVCarousel />

      {/* Mini Store */}
      <MiniStore />
    </>
  );
}
