'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore, type SavedAddress } from '@/store/authStore';
import type { ShippingInfo, CheckoutStep } from '@/types';

const EMPTY_SHIPPING: ShippingInfo = {
  name: '', email: '', address: '', city: '', zip: '', country: ''
};

export default function CheckoutPage() {
  const router = useRouter();

  const { saveAddress } = useAuthStore();
  const user = useAuthStore(s => s.user);

  const { placeOrder } = useCartStore();
  const cart = useCartStore(s => s.cart);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const balance = user?.balance ?? 0;

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shipping, setShipping] = useState<ShippingInfo>(EMPTY_SHIPPING);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [placing, setPlacing] = useState(false);

  // Guard: redirect to home if not logged in
  useEffect(() => {
    if (!user) { router.replace('/'); }
  }, [user, router]);

  // Pre-fill default address
  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) ?? user.addresses[0];
      setSelectedAddressId(def.id);
      setShipping({ name: def.name, email: def.email, address: def.address, city: def.city, zip: def.zip, country: def.country });
    } else {
      setShipping(s => ({ ...s, email: user?.email ?? '' }));
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setShipping({ ...EMPTY_SHIPPING, email: user.email });
    } else {
      const addr = user.addresses.find((a: SavedAddress) => a.id === id);
      if (addr) setShipping({ name: addr.name, email: addr.email, address: addr.address, city: addr.city, zip: addr.zip, country: addr.country });
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveThisAddress && selectedAddressId === 'new') {
      try {
        await saveAddress({ ...shipping, label: addressLabel || 'Home', isDefault: !user.addresses.length });
      } catch {
        // non-blocking
      }
    }
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const result = await placeOrder(shipping);
      if (result) {
        setOrderId(result.order.id);
        setOrderTotal(result.order.total);
        setRemainingBalance(result.balance);
        // Refresh user balance in authStore
        await useAuthStore.getState().refreshUser();
        setStep('success');
      }
    } finally {
      setPlacing(false);
    }
  };

  const stepLabels: CheckoutStep[] = ['shipping', 'review', 'payment'];
  const stepIdx = stepLabels.indexOf(step);

  if (step === 'success') {
    return (
      <div className="pt-20 min-h-screen bg-surface flex items-center justify-center px-8 pb-32">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container" style={{ fontVariationSettings: '"FILL" 1' }}>
              check_circle
            </span>
          </div>
          <div>
            <h1 className="font-headline italic text-4xl mb-4">Order Confirmed</h1>
            <p className="font-body text-on-surface-variant">Thank you, {user.displayName}!</p>
          </div>
          <div className="bg-surface-container-low p-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="font-label text-xs tracking-widest uppercase opacity-60">Order ID</span>
              <span className="font-headline italic">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-label text-xs tracking-widest uppercase opacity-60">Total Charged</span>
              <span className="font-headline italic">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-label text-xs tracking-widest uppercase opacity-60">Remaining Balance</span>
              <span className="font-headline italic">${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="flex-1 border border-on-surface py-4 text-center text-xs tracking-[0.3em] uppercase hover:bg-surface-container-low transition-colors">
              Back to Home
            </Link>
            <Link href="/store" className="flex-1 bg-on-surface text-surface py-4 text-center text-xs tracking-[0.3em] uppercase hover:opacity-90 transition-opacity">
              Continue Shopping
            </Link>
          </div>
          <Link href="/account/orders" className="block text-xs tracking-widest uppercase text-on-surface-variant hover:text-on-surface transition-colors">
            View all orders →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-surface pb-32">
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-12">
          {['Shipping', 'Review', 'Payment'].map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= stepIdx ? 'bg-on-surface text-surface' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {i < stepIdx ? (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                  ) : i + 1}
                </div>
                <span className={`text-xs tracking-widest uppercase ${i === stepIdx ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className="flex-grow h-px bg-outline-variant mx-4" />}
            </div>
          ))}
        </div>

        {/* Cart empty guard */}
        {cart.length === 0 && (step as string) !== 'success' && (
          <div className="text-center py-20 space-y-6">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">shopping_bag</span>
            <p className="font-body text-on-surface-variant">Your cart is empty</p>
            <Link href="/store" className="inline-block bg-on-surface text-surface px-10 py-3 text-xs tracking-[0.3em] uppercase">
              Go to Shop
            </Link>
          </div>
        )}

        {/* Step: Shipping */}
        {step === 'shipping' && cart.length > 0 && (
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <h2 className="font-headline italic text-3xl mb-8">Shipping Details</h2>

            {/* Saved address picker */}
            {user.addresses.length > 0 && (
              <div className="space-y-2">
                <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Saved Addresses</p>
                <div className="grid gap-2">
                  {user.addresses.map((addr: SavedAddress) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 cursor-pointer border transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-on-surface bg-surface-container-low'
                          : 'border-outline-variant hover:border-on-surface/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => handleAddressSelect(addr.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-label text-xs tracking-widest uppercase mb-1">{addr.label} {addr.isDefault && '· Default'}</p>
                        <p className="font-body text-sm">{addr.name}</p>
                        <p className="font-body text-xs text-on-surface-variant">{addr.address}, {addr.city} {addr.zip}, {addr.country}</p>
                      </div>
                    </label>
                  ))}
                  <label
                    className={`flex items-center gap-3 p-4 cursor-pointer border transition-colors ${
                      selectedAddressId === 'new'
                        ? 'border-on-surface bg-surface-container-low'
                        : 'border-outline-variant hover:border-on-surface/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      value="new"
                      checked={selectedAddressId === 'new'}
                      onChange={() => handleAddressSelect('new')}
                    />
                    <span className="font-label text-xs tracking-widest uppercase">+ New Address</span>
                  </label>
                </div>
              </div>
            )}

            {/* Address fields - show when "new" selected or no saved addresses */}
            {(selectedAddressId === 'new' || !user.addresses.length) && (
              <div className="space-y-5 pt-2">
                {[
                  { key: 'name', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email Address', type: 'email' },
                  { key: 'address', label: 'Street Address', type: 'text' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'zip', label: 'ZIP / Postal Code', type: 'text' },
                  { key: 'country', label: 'Country', type: 'text' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={shipping[field.key as keyof ShippingInfo]}
                      onChange={e => setShipping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors"
                    />
                  </div>
                ))}

                {/* Save address option */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveThisAddress}
                      onChange={e => setSaveThisAddress(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-label text-xs tracking-widest uppercase">Save this address</span>
                  </label>
                  {saveThisAddress && (
                    <div className="space-y-2 ml-7">
                      <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">Label</label>
                      <input
                        type="text"
                        value={addressLabel}
                        onChange={e => setAddressLabel(e.target.value)}
                        placeholder="e.g. Home, Work"
                        className="w-full border-b border-outline-variant bg-transparent py-2 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-on-surface text-surface py-5 text-xs tracking-[0.3em] uppercase hover:opacity-90 transition-opacity mt-8"
            >
              Continue to Review →
            </button>
          </form>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-8">
            <h2 className="font-headline italic text-3xl mb-8">Order Review</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center py-3 border-b border-outline-variant/20">
                  <div>
                    <p className="font-body text-sm">{item.name}</p>
                    <p className="font-label text-xs text-on-surface-variant">Qty: {item.qty}</p>
                  </div>
                  <span className="font-headline italic">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low p-6 space-y-2">
              <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-3">Ship to</p>
              <p className="font-body text-sm">{shipping.name}</p>
              <p className="font-body text-sm text-on-surface-variant">{shipping.address}, {shipping.city} {shipping.zip}</p>
              <p className="font-body text-sm text-on-surface-variant">{shipping.country}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-label text-xs tracking-widest uppercase opacity-60">Virtual Balance</span>
                <span className="font-headline italic">${balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label text-xs tracking-widest uppercase opacity-60">Order Total</span>
                <span className="font-headline italic text-xl">${total.toFixed(2)}</span>
              </div>
              {total > balance && (
                <p className="text-red-500 text-xs tracking-widest uppercase">Insufficient balance</p>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep('shipping')} className="flex-1 border border-on-surface py-4 text-xs tracking-[0.3em] uppercase hover:bg-surface-container-low transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep('payment')}
                disabled={total > balance}
                className="flex-1 bg-on-surface text-surface py-4 text-xs tracking-[0.3em] uppercase hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="space-y-8">
            <h2 className="font-headline italic text-3xl mb-8">Virtual Payment</h2>
            <div className="bg-tertiary-container p-8 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-on-tertiary-container" style={{ fontVariationSettings: '"FILL" 1' }}>
                account_balance_wallet
              </span>
              <p className="font-body text-on-tertiary-container">
                This is a simulated store. Your virtual balance will be used.
              </p>
              <div className="flex justify-center gap-12 mt-4">
                <div className="text-center">
                  <p className="font-label text-xs tracking-widest uppercase text-on-tertiary-container/70 mb-1">Balance</p>
                  <p className="font-headline italic text-2xl text-on-tertiary-container">${balance.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="font-label text-xs tracking-widest uppercase text-on-tertiary-container/70 mb-1">Total</p>
                  <p className="font-headline italic text-2xl text-on-tertiary-container">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep('review')} className="flex-1 border border-on-surface py-4 text-xs tracking-[0.3em] uppercase hover:bg-surface-container-low transition-colors">
                ← Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={total > balance || placing}
                className="flex-1 bg-on-surface text-surface py-4 text-xs tracking-[0.3em] uppercase hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {placing ? 'Processing…' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
