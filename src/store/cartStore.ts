'use client';

import { create } from 'zustand';
import type { CartItem, Order, ShippingInfo } from '@/types';

interface CartStore {
  cart: CartItem[];
  orders: Order[];
  loading: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addToCart: (productId: number, qty?: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQty: (productId: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: (shipping: ShippingInfo) => Promise<{ order: Order; balance: number } | null>;

  // Computed (inline, no selectors needed)
  total: () => number;
  totalQty: () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  cart: [],
  orders: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (res.ok) {
        const items = await res.json();
        // API 返回 CartItem 格式一致
        set({ cart: items });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async () => {
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (res.ok) {
      const orders = await res.json();
      // API 返回 Order.items 结构，转为前端 CartItem[] 格式
      const mapped: Order[] = orders.map((o: {
        id: string; total: number; date: string;
        shipping: ShippingInfo; items: CartItem[];
      }) => ({
        id: o.id,
        total: o.total,
        date: o.date,
        shipping: o.shipping,
        items: o.items,
      }));
      set({ orders: mapped });
    }
  },

  addToCart: async (productId, qty = 1) => {
    // 从 products 数据拿 name/price/img
    const { PRODUCTS } = await import('@/data/products');
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return false;

    // 乐观更新
    set(s => {
      const existing = s.cart.find(i => i.productId === productId);
      const newCart = existing
        ? s.cart.map(i => i.productId === productId ? { ...i, qty: i.qty + qty } : i)
        : [...s.cart, { productId, qty, name: product.name, price: product.price, img: product.img ?? null }];
      return { cart: newCart };
    });

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty, name: product.name, price: product.price, img: product.img }),
      credentials: 'include',
    });

    if (!res.ok) {
      // 回滚
      await get().fetchCart();
      return false;
    }
    return true;
  },

  removeFromCart: async (productId) => {
    // 乐观更新
    set(s => ({ cart: s.cart.filter(i => i.productId !== productId) }));
    await fetch(`/api/cart/${productId}`, { method: 'DELETE', credentials: 'include' });
  },

  updateQty: async (productId, qty) => {
    if (qty <= 0) { await get().removeFromCart(productId); return; }
    set(s => ({ cart: s.cart.map(i => i.productId === productId ? { ...i, qty } : i) }));
    await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
      credentials: 'include',
    });
  },

  clearCart: async () => {
    set({ cart: [] });
    await fetch('/api/cart', { method: 'DELETE', credentials: 'include' });
  },

  placeOrder: async (shipping) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipping }),
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    // 清空本地购物车
    set(s => ({ cart: [], orders: [data.order, ...s.orders] }));
    return data; // { order, balance }
  },

  total: () => get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  totalQty: () => get().cart.reduce((sum, i) => sum + i.qty, 0),
}));
