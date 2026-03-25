'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function OrdersPage() {
  const router = useRouter();
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
        <div className="flex items-center gap-4 mb-12">
          <Link href="/account" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant">My Account</p>
            <h1 className="font-headline italic text-4xl">Order History</h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">receipt_long</span>
            <p className="font-body text-on-surface-variant">No orders yet</p>
            <Link href="/store" className="inline-block bg-on-surface text-surface px-10 py-3 text-xs tracking-[0.3em] uppercase">
              Go Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-surface-container-low p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-headline italic text-lg">{order.id}</p>
                    <p className="font-label text-xs text-on-surface-variant mt-1">
                      {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="font-headline italic text-xl">${order.total.toFixed(2)}</p>
                </div>

                {/* Items */}
                <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="font-body text-on-surface-variant">{item.name} × {item.qty}</span>
                      <span className="font-body">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                {order.shipping && (
                  <div className="border-t border-outline-variant/20 pt-4">
                    <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2">Shipped to</p>
                    <p className="font-body text-sm">{order.shipping.name}</p>
                    <p className="font-body text-xs text-on-surface-variant">
                      {order.shipping.address}, {order.shipping.city} {order.shipping.zip}, {order.shipping.country}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
