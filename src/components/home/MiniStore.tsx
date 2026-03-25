'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { PRODUCTS } from '@/data/products';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function MiniStore() {
  const { addToCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const featured = PRODUCTS.slice(0, 3);

  const handleAdd = async (id: number, name: string) => {
    if (!user) { setAuthOpen(true); return; }
    await addToCart(id);
    setToastMsg(`${name} added`);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <section className="py-32 px-8 bg-surface" id="shop">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-8 mb-20">
          <h2 className="font-headline italic text-5xl md:text-6xl text-on-surface whitespace-nowrap">
            Store
          </h2>
          <div className="flex-grow h-px bg-outline-variant" />
          <Link
            href="/store"
            className="hidden md:block bg-vibrant-amber rounded-full px-10 py-3 text-white font-label text-xs tracking-[0.3em] uppercase hover:bg-vibrant-gold transition-all shadow-lg whitespace-nowrap"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {featured.map((p) => (
            <div key={p.id} className="group">
              <div className="relative aspect-square mb-8 overflow-hidden bg-surface-container-lowest">
                {p.img ? (
                  <img
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">inventory_2</span>
                  </div>
                )}
                <button
                  onClick={() => handleAdd(p.id, p.name)}
                  className="absolute bottom-6 right-6 bg-on-surface text-surface p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl"
                  aria-label="Add to cart"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-headline text-xl text-on-surface">{p.name}</h5>
                  <span className="font-label text-sm text-on-surface-variant">${p.price.toFixed(2)}</span>
                </div>
                <p className="text-xs tracking-widest uppercase text-outline">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center md:hidden">
          <Link
            href="/store"
            className="inline-block bg-vibrant-amber px-10 py-3 text-white font-label text-xs tracking-[0.3em] uppercase hover:bg-vibrant-gold transition-all shadow-lg"
          >
            View All Merchandise
          </Link>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-8 py-3 text-xs tracking-widest uppercase z-50 ${toastVisible ? 'show' : ''}`}
      >
        {toastMsg}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />
    </section>
  );
}
