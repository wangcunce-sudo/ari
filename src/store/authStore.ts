'use client';

import { create } from 'zustand';
import type { ShippingInfo } from '@/types';
import { usePlaylistStore } from './playlistStore';
import { useEraFavoritesStore } from './eraFavoritesStore';

export interface SavedAddress extends ShippingInfo {
  id: string;
  label: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  balance: number;
  addresses: SavedAddress[];
}

interface AuthStore {
  user: User | null;
  loading: boolean;

  // Actions
  init: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Address helpers (调 API，乐观更新)
  saveAddress: (address: Omit<SavedAddress, 'id'>) => Promise<string>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  loading: true,

  // 页面加载时调用，用 cookie 恢复登录状态
  init: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  register: async (email, password, displayName) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    set({ user: data.user });
    // 注册成功：清空本地缓存
    usePlaylistStore.setState({ tracks: [] });
    useEraFavoritesStore.setState({ savedEras: [] });
    return { ok: true };
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    set({ user: data.user });
    // 登录成功：清空本地缓存，从远程拉取该用户数据
    usePlaylistStore.setState({ tracks: [] });
    useEraFavoritesStore.setState({ savedEras: [] });
    usePlaylistStore.getState().fetchFromRemote();
    useEraFavoritesStore.getState().fetchFromRemote();
    return { ok: true };
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    set({ user: null });
    // 登出：清空用户数据，恢复空白状态
    usePlaylistStore.setState({ tracks: [] });
    useEraFavoritesStore.setState({ savedEras: [] });
  },

  refreshUser: async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      set({ user });
    }
  },

  saveAddress: async (address) => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    // 乐观更新本地 user
    set(s => {
      if (!s.user) return s;
      const addresses = address.isDefault
        ? [...s.user.addresses.map(a => ({ ...a, isDefault: false })), data]
        : [...s.user.addresses, data];
      return { user: { ...s.user, addresses } };
    });
    return data.id;
  },

  deleteAddress: async (id) => {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
    set(s => {
      if (!s.user) return s;
      return { user: { ...s.user, addresses: s.user.addresses.filter(a => a.id !== id) } };
    });
  },

  setDefaultAddress: async (id) => {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
      credentials: 'include',
    });
    set(s => {
      if (!s.user) return s;
      return {
        user: {
          ...s.user,
          addresses: s.user.addresses.map(a => ({ ...a, isDefault: a.id === id })),
        },
      };
    });
  },

  // 兼容旧代码：本地乐观更新余额（下单后由 refreshUser 同步真实值）
  _optimisticUpdateBalance: (amount: number) => {
    set(s => {
      if (!s.user) return s;
      return { user: { ...s.user, balance: s.user.balance + amount } };
    });
  },
}));
