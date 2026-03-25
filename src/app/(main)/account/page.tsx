'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const user = useAuthStore(s => s.user);
  const { fetchOrders } = useCartStore();
  const orders = useCartStore(s => s.orders);

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user, router]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  if (!user) return null;

  return (
    <div className="pt-20 min-h-screen bg-surface pb-32">
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant mb-2">My Account</p>
            <h1 className="font-headline italic text-5xl">{user.avatar} {user.displayName}</h1>
            <p className="font-body text-on-surface-variant mt-2">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-2 border border-outline-variant px-4 py-2 text-xs tracking-widest uppercase text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>

        {/* Balance card */}
        <div className="bg-surface-container-low p-8 mb-8">
          <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2">Virtual Balance</p>
          <p className="font-headline italic text-5xl">${user.balance.toFixed(2)}</p>
          <p className="font-body text-xs text-on-surface-variant/60 mt-2">Demo balance · synced with database</p>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link href="/account/orders" className="group bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors">arrow_forward</span>
            </div>
            <p className="font-headline italic text-xl">{orders.length}</p>
            <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Orders</p>
          </Link>

          <Link href="/account/addresses" className="group bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-2xl">location_on</span>
              <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors">arrow_forward</span>
            </div>
            <p className="font-headline italic text-xl">{user.addresses.length}</p>
            <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Saved Addresses</p>
          </Link>
        </div>

        {/* Recent orders preview */}
        {orders.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline italic text-2xl">Recent Orders</h2>
              <Link href="/account/orders" className="text-xs tracking-widest uppercase text-on-surface-variant hover:text-on-surface transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="bg-surface-container-low p-5 flex justify-between items-center">
                  <div>
                    <p className="font-headline italic text-sm">{order.id}</p>
                    <p className="font-label text-xs text-on-surface-variant">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-headline italic">${order.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
