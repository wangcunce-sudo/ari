'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartSidebar from '@/components/layout/CartSidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function EraNavbar() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const totalQty = useCartStore(s => s.totalQty());
  const playlistCount = usePlaylistStore(s => s.tracks.length);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点外部关闭下拉菜单
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 h-16 flex items-center px-8 md:px-12 shadow-sm"
        style={{ backgroundColor: '#F2C94C' }}
      >
        {/* Left: nav links */}
        <div className="flex items-center gap-6 flex-grow">
          <Link
            href="/"
            className="text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
          >
            Home
          </Link>
          <Link
            href="/store"
            className="text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
          >
            Store
          </Link>
          <Link
            href="/#archive"
            className="text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
          >
            Archive
          </Link>
          <Link
            href="/playlist"
            className="relative text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
          >
            Playlist
            {playlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-tertiary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {playlistCount > 99 ? '99+' : playlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/#visuals"
            className="hidden md:block text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
          >
            Music Videos
          </Link>
        </div>

        {/* Right: cart + user + logo */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            onClick={() => user ? setCartOpen(true) : setAuthOpen(true)}
            className="relative p-1 hover:opacity-70 transition-opacity"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 22 }}>
              shopping_bag
            </span>
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-tertiary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {totalQty}
              </span>
            )}
          </button>

          {/* User area */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                aria-label="User menu"
              >
                <span className="text-lg leading-none select-none">{user.avatar}</span>
                <span className="hidden md:block text-[11px] font-bold tracking-[0.15em] uppercase text-on-surface max-w-[80px] truncate">
                  {user.displayName}
                </span>
                <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 16 }}>
                  {userMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface shadow-xl border border-outline-variant/20 z-50 py-1">
                  {/* 用户信息头部 */}
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Signed in as</p>
                    <p className="font-body text-sm text-on-surface truncate">{user.email}</p>
                    <p className="font-headline italic text-xs text-on-surface-variant mt-0.5">
                      Balance: ${user.balance.toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[11px] tracking-widest uppercase hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <span className="material-symbols-outlined text-sm">person</span>
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[11px] tracking-widest uppercase hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <span className="material-symbols-outlined text-sm">receipt_long</span>
                    Orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[11px] tracking-widest uppercase hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Addresses
                  </Link>
                  <div className="border-t border-outline-variant/20 mt-1">
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] tracking-widest uppercase hover:bg-surface-container-low transition-colors text-on-surface-variant text-left"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity text-on-surface"
            >
              Sign In
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="hidden md:flex items-center ml-1">
            <Image
              src="/images/logo.png"
              alt="Ariana Grande"
              width={110}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ filter: 'brightness(0) saturate(100%)' }}
              priority
            />
          </Link>
        </div>
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />
    </>
  );
}
