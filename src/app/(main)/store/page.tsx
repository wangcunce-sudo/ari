'use client';

import { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { PRODUCTS } from '@/data/products';
import AuthModal from '@/components/auth/AuthModal';

const ERA_FILTERS = ['All', 'Eternal Sunshine', 'Thank U, Next', 'Sweetener', 'Positions', 'Dangerous Woman', 'My Everything', 'Yours Truly', 'Holiday'];
const PAGE_SIZE = 12;

export default function StorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<(typeof PRODUCTS)[0] | null>(null);
  const { addToCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const filtered = useMemo(
    () => activeFilter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.era === activeFilter),
    [activeFilter]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleAdd = async (id: number, name: string) => {
    if (!user) { setAuthOpen(true); return; }
    await addToCart(id);
    setToastMsg(`${name} added`);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
    setModalProduct(null);
  };

  return (
    <div className="pt-20 pb-32 md:pb-16 min-h-screen bg-surface">
      {/* Header */}
      <div className="px-8 py-16 max-w-7xl mx-auto">
        <div className="flex items-end gap-8 mb-12">
          <h1 className="font-headline italic text-5xl md:text-7xl text-on-surface">Store</h1>
          <div className="flex-grow h-px bg-outline-variant mb-3" />
        </div>

        {/* Era Filters */}
        <div className="flex flex-wrap gap-2 md:gap-6 mb-12">
          {ERA_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`era-filter-btn font-label text-xs tracking-widest uppercase pb-2 transition-opacity hover:opacity-100 ${
                activeFilter === f ? 'active opacity-100' : 'opacity-40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        {paginated.map(p => (
          <div
            key={p.id}
            className="group cursor-pointer"
            onClick={() => setModalProduct(p)}
          >
            <div className="relative aspect-square mb-4 overflow-hidden bg-surface-container-lowest">
              {p.img ? (
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                </div>
              )}
              {p.badge && (
                <span className="absolute top-3 left-3 bg-on-surface text-surface text-[9px] tracking-widest uppercase px-2 py-1">
                  {p.badge}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleAdd(p.id, p.name); }}
                className="absolute bottom-4 right-4 bg-on-surface text-surface p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 shadow-lg"
                aria-label="Add to cart"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h5 className="font-headline text-base text-on-surface leading-tight">{p.name}</h5>
                <span className="font-label text-sm text-on-surface-variant whitespace-nowrap">${p.price.toFixed(2)}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-outline">{p.era}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 max-w-7xl mx-auto mt-16 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 font-body text-xs tracking-widest transition-colors ${
                page === currentPage
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>

          <span className="ml-4 text-xs font-body text-on-surface-variant/60 tracking-widest uppercase">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}

      {/* Product Modal */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm px-4"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-surface max-w-lg w-full p-8 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModalProduct(null)}
              className="absolute top-4 right-4 hover:rotate-90 transition-transform duration-300"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="aspect-square mb-6 overflow-hidden bg-surface-container-lowest">
              {modalProduct.img ? (
                <img src={modalProduct.img} alt={modalProduct.name} className="w-full h-full object-cover mix-blend-multiply" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">inventory_2</span>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              {modalProduct.badge && (
                <span className="inline-block bg-on-surface text-surface text-[9px] tracking-widest uppercase px-2 py-1 mb-2">
                  {modalProduct.badge}
                </span>
              )}
              <h3 className="font-headline italic text-2xl">{modalProduct.name}</h3>
              <p className="font-label text-xs tracking-widest uppercase text-outline">{modalProduct.era}</p>
              <p className="font-body text-on-surface-variant">{modalProduct.desc}</p>
              <p className="font-headline italic text-3xl">${modalProduct.price.toFixed(2)}</p>
            </div>

            <button
              onClick={() => handleAdd(modalProduct.id, modalProduct.name)}
              className="w-full bg-on-surface text-surface py-4 text-xs tracking-[0.3em] uppercase hover:opacity-90 transition-opacity"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-8 py-3 text-xs tracking-widest uppercase z-50 whitespace-nowrap ${toastVisible ? 'show' : ''}`}>
        {toastMsg}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />
    </div>
  );
}
