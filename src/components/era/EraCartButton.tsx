'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

interface Props {
  productId: number;
  productName: string;
}

export default function EraCartButton({ productId, productName }: Props) {
  const { addToCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const [added, setAdded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleAdd = async () => {
    if (!user) { setAuthOpen(true); return; }
    await addToCart(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <button
        onClick={handleAdd}
        className="absolute bottom-4 right-4 bg-on-surface text-surface p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 shadow-lg"
        aria-label={`Add ${productName} to cart`}
      >
        <span className="material-symbols-outlined text-sm">
          {added ? 'check' : 'add_shopping_cart'}
        </span>
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />
    </>
  );
}
