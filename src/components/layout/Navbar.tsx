'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePlaylistStore } from '@/store/playlistStore';
import CartSidebar from './CartSidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHome);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { logout, init } = useAuthStore();
  const user = useAuthStore(s => s.user);
  const totalQty = useCartStore(s => s.totalQty());
  const playlistCount = usePlaylistStore(s => s.tracks.length);

  // 初始化：用 cookie 恢复登录状态，拉取购物车
  useEffect(() => {
    init().then(() => {
      if (useAuthStore.getState().user) {
        useCartStore.getState().fetchCart();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    setScrolled(window.scrollY > window.innerHeight * 0.85);
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Close user menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      <nav className={`glass-nav fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'scrolled' : ''}`}>
        <div className="relative flex items-center px-8 py-4 max-w-none">
          {/* Logo */}
          <Link href="/" className="absolute left-8 flex items-center">
            <Image
              src="/images/logo.png"
              alt="Ariana Grande"
              width={120}
              height={32}
              className="nav-logo h-8 w-auto object-contain transition-all duration-500"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link href="/" className="nav-pill px-4 py-2 text-xs tracking-widest uppercase text-white font-medium">
              Home
            </Link>
            <Link href="/store" className="nav-pill px-4 py-2 text-xs tracking-widest uppercase text-white/80">
              Store
            </Link>
            <Link href="/playlist" className="nav-pill px-4 py-2 text-xs tracking-widest uppercase text-white/80 relative">
              Playlist
              {playlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-tertiary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {playlistCount > 99 ? '99+' : playlistCount}
                </span>
              )}
            </Link>
            <Link href="/#archive" className="nav-pill px-4 py-2 text-xs tracking-widest uppercase text-white/80">
              Archive
            </Link>
            <Link href="/#visuals" className="nav-pill px-4 py-2 text-xs tracking-widest uppercase text-white/80">
              Music Videos
            </Link>

            {/* Auth area */}
            {user ? (
              <div ref={userMenuRef} className="relative ml-4">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-xs tracking-widest uppercase transition-colors"
                >
                  <span className="text-base leading-none">{user.avatar ?? '✨'}</span>
                  <span className="max-w-[80px] truncate">{user.displayName}</span>
                  <span className="material-symbols-outlined text-sm">{userMenuOpen ? 'expand_less' : 'expand_more'}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface shadow-2xl overflow-hidden">
                    <div className="px-4 py-4 border-b border-outline-variant/30 bg-surface-container-low">
                      <p className="font-headline text-sm">{user.displayName}</p>
                      <p className="font-label text-xs text-on-surface-variant truncate">{user.email}</p>
                      <p className="font-headline italic text-sm mt-2 text-tertiary">${user.balance.toFixed(2)} balance</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">manage_accounts</span>
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      My Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      Saved Addresses
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-on-surface-variant hover:bg-surface-container-low transition-colors border-t border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="sign-up-btn bg-white text-on-surface px-6 py-2 ml-4 text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => user ? setCartOpen(true) : openAuth('login')}
              className="nav-cart-btn relative ml-2 p-2 rounded-md hover:bg-white/20 transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <span className="material-symbols-outlined text-white nav-cart-icon" style={{ fontSize: 22 }}>
                shopping_bag
              </span>
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-tertiary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-2xl flex justify-around items-center px-4 pb-8 pt-4 border-t border-on-surface/5">
        <Link href="/" className="flex flex-col items-center gap-1 text-on-surface/40">
          <span className="material-symbols-outlined">home</span>
          <span className="font-sans text-[10px] tracking-widest uppercase">Home</span>
        </Link>
        <Link href="/#archive" className="flex flex-col items-center gap-1 text-on-surface">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>subscriptions</span>
          <span className="font-sans text-[10px] tracking-widest uppercase">Archive</span>
        </Link>
        <Link href="/store" className="flex flex-col items-center gap-1 text-on-surface/40">
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-sans text-[10px] tracking-widest uppercase">Store</span>
        </Link>
        <Link href="/playlist" className="flex flex-col items-center gap-1 text-on-surface/40 relative">
          <span className="material-symbols-outlined">queue_music</span>
          {playlistCount > 0 && (
            <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-tertiary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
              {playlistCount > 99 ? '99+' : playlistCount}
            </span>
          )}
          <span className="font-sans text-[10px] tracking-widest uppercase">Playlist</span>
        </Link>
        <button
          onClick={() => user ? setCartOpen(true) : openAuth('login')}
          className="flex flex-col items-center gap-1 text-on-surface/40 relative"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {totalQty > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-tertiary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {totalQty}
            </span>
          )}
          <span className="font-sans text-[10px] tracking-widest uppercase">Cart</span>
        </button>
        <button
          onClick={() => user ? setUserMenuOpen(v => !v) : openAuth('login')}
          className="flex flex-col items-center gap-1 text-on-surface/40"
        >
          <span className="material-symbols-outlined">{user ? 'account_circle' : 'person'}</span>
          <span className="font-sans text-[10px] tracking-widest uppercase">{user ? 'Me' : 'Sign in'}</span>
        </button>
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
