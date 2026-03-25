'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useScrollLock } from '@/hooks/useScrollLock';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setEmail(''); setPassword(''); setDisplayName(''); setError('');
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, defaultTab]);

  useScrollLock(open);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      if (res.ok) {
        // 登录成功后拉取购物车
        await useCartStore.getState().fetchCart();
        onClose();
      } else {
        setError(res.error ?? 'Login failed');
      }
    } else {
      const res = await register(email, password, displayName);
      if (res.ok) {
        onClose();
      } else {
        setError(res.error ?? 'Registration failed');
      }
    }
    setLoading(false);
  };

  const fillDemo = (email: string, password: string) => {
    setTab('login');
    setEmail(email);
    setPassword(password);
    setError('');
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-on-surface/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-[90] flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'login' ? 'Sign in' : 'Create account'}
      >
        <div className="bg-surface w-full max-w-md shadow-2xl p-8 space-y-6 relative animate-[slideUp_0.3s_ease-out]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-on-surface-variant/60 hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div>
            <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant mb-1">AG ETERNAL</p>
            <h2 className="font-headline italic text-3xl">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
          </div>

          <div className="flex border-b border-outline-variant">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${
                  tab === t
                    ? 'text-on-surface border-b-2 border-on-surface -mb-px'
                    : 'text-on-surface-variant'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === 'register' && (
              <div className="space-y-1">
                <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">Display Name</label>
                <input
                  ref={tab === 'register' ? firstInputRef : undefined}
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your fan name"
                  className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors placeholder:text-on-surface-variant/30"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">Email</label>
              <input
                ref={tab === 'login' ? firstInputRef : undefined}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors placeholder:text-on-surface-variant/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors placeholder:text-on-surface-variant/30"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs tracking-widest">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-on-surface text-surface py-4 text-xs tracking-[0.3em] uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {tab === 'login' && (
            <div className="border-t border-outline-variant/40 pt-4">
              <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant/50 mb-3">Demo Accounts</p>
              <div className="space-y-2">
                {[
                  { name: '🌸 Arianator', email: 'arianator@fan.com', pwd: 'sweetener2018' },
                  { name: '👑 Positions Queen', email: 'positions@ari.com', pwd: 'positions2020' },
                  { name: '☀️ Eternal Dreamer', email: 'eternal@sunshine.com', pwd: 'eternalsunshine' },
                ].map(d => (
                  <button
                    key={d.email}
                    onClick={() => fillDemo(d.email, d.pwd)}
                    className="w-full text-left py-2 px-3 bg-surface-container-low hover:bg-surface-container text-xs text-on-surface-variant hover:text-on-surface transition-colors flex justify-between items-center"
                  >
                    <span>{d.name}</span>
                    <span className="font-mono opacity-50">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
