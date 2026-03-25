'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * 首页全屏 Hero — 对应原版 index.html 的 #home section
 * - 全屏单张背景图（Eternal Sunshine 封面）
 * - 居中大标题 mix-blend-multiply 融入背景
 * - 左下角 AVAILABLE NOW 标签
 */
export default function HomeHero() {
  const navRef = useRef<HTMLElement | null>(null);

  // 滚动时给 glass-nav 加 .scrolled 类（与原版 index.html JS 一致）
  useEffect(() => {
    navRef.current = document.querySelector('nav.glass-nav');
    const section = document.getElementById('home');
    if (!section || !navRef.current) return;

    function onScroll() {
      const threshold = (section?.offsetHeight ?? window.innerHeight) - 80;
      if (window.scrollY > threshold) {
        navRef.current?.classList.add('scrolled');
      } else {
        navRef.current?.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* 背景图 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7mshLiZoS6IlRNaEbK4RTpxPZcAXfiT_310ai0aIHnCO7UHzJVy40NWY0ibCuIglUF-JJLamxS5a0GgdqAKnj2XoOMaCTZ9n3xQ1E2-HH7xYprczF13suvt31MsoMx5mCkNn-DRgoFsz5erynt1isEKCncEj-BatIOgJAijlNyfeKAghkbI4H62EKL_dHyDJGDxnfl7PJ7_8XTPkzcknhJwajcFtfNkq5UlbqkswPj4zaPgrYkD3Qtn4Eo7fxPcfXkt0-AcNo7FIT"
          alt="Ariana Grande Eternal Sunshine Era"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        {/* 底部渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>

      {/* 居中大标题 —— 点击进入 Eternal Sunshine Era 页面 */}
      <div className="relative z-10 text-center px-8 w-full">
        <Link href="/era/eternal-sunshine">
          <h1 className="font-headline italic text-7xl md:text-[10vw] tracking-tighter text-on-surface leading-none mix-blend-multiply opacity-90 whitespace-nowrap select-none hover:opacity-70 transition-opacity cursor-pointer">
            eternal sunshine
          </h1>
        </Link>
      </div>

      {/* 左下角 AVAILABLE NOW → 链接到 Eternal Sunshine 购物区 */}
      <div className="absolute bottom-12 left-12 z-10">
        <Link
          href="/era/eternal-sunshine"
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <p className="text-white font-label text-xl md:text-2xl tracking-[0.4em] uppercase font-bold">
            Available Now
          </p>
          <span className="material-symbols-outlined text-white text-xl group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  );
}
