'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useScrollLock } from '@/hooks/useScrollLock';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
  const user = useAuthStore(s => s.user);
  const { removeFromCart, updateQty } = useCartStore();
  const cart = useCartStore(s => s.cart);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const balance = user?.balance ?? 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useScrollLock(open);

  return (
    <>
      <div
        className={`cart-backdrop fixed inset-0 z-[60] bg-on-surface/20 ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`cart-panel fixed right-0 top-0 h-full w-full max-w-md bg-surface glass-panel z-[70] flex flex-col shadow-2xl ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex justify-between items-center px-8 pt-10 pb-6 border-b border-on-surface/5">
          <h2 className="font-headline italic text-2xl">Your Selection</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300" aria-label="Close cart">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar px-8 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
              <span className="material-symbols-outlined text-5xl">shopping_bag</span>
              <p className="font-label text-xs tracking-widest uppercase">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.productId} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-surface-container-low flex-shrink-0 overflow-hidden">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl">inventory_2</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-headline text-sm mb-1 truncate">{item.name}</p>
                    <p className="font-label text-xs text-on-surface-variant">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-6 h-6 border border-outline-variant flex items-center justify-center text-xs hover:border-on-surface transition-colors"
                      >−</button>
                      <span className="text-xs w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-6 h-6 border border-outline-variant flex items-center justify-center text-xs hover:border-on-surface transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-on-surface-variant/50 hover:text-on-surface transition-colors mt-1"
                    aria-label="Remove item"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-8 border-t border-on-surface/5">
          <div className="flex justify-between items-end mb-3">
            <p className="font-body text-xs tracking-widest uppercase opacity-50">Virtual Balance</p>
            <p className="font-headline italic text-xl">${balance.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-end mb-8">
            <p className="font-body text-xs tracking-widest uppercase opacity-50">Total</p>
            <p className="font-headline italic text-xl">${total.toFixed(2)}</p>
          </div>
          <Link
            href="/checkout"
            onClick={onClose}
            className="block w-full bg-on-surface text-surface py-5 text-center text-xs tracking-[0.3em] uppercase hover:opacity-90 transition-all"
          >
            Proceed to Checkout
          </Link>
          <p className="text-center text-[10px] tracking-widest uppercase opacity-30 mt-4">
            Secure · AG Eternal
          </p>
        </div>
      </aside>
    </>
  );
}
