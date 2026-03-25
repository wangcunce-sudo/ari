'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, type SavedAddress } from '@/store/authStore';
import type { ShippingInfo } from '@/types';

const EMPTY: Omit<SavedAddress, 'id'> = {
  label: 'Home', name: '', email: '', address: '', city: '', zip: '', country: '', isDefault: false
};

export default function AddressesPage() {
  const router = useRouter();
  const { saveAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const user = useAuthStore(s => s.user);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<SavedAddress, 'id'>>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user, router]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveAddress(form);
      setForm(EMPTY);
      setAdding(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error silently
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-surface pb-32">
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/account" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p className="font-label text-xs tracking-[0.3em] uppercase text-on-surface-variant">My Account</p>
            <h1 className="font-headline italic text-4xl">Saved Addresses</h1>
          </div>
        </div>

        {saved && (
          <div className="bg-tertiary-container text-on-tertiary-container px-6 py-4 text-xs tracking-widest uppercase mb-6">
            Address saved successfully
          </div>
        )}

        {/* Address list */}
        {user.addresses.length === 0 && !adding ? (
          <div className="text-center py-12 space-y-4 bg-surface-container-low mb-6">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">location_on</span>
            <p className="font-body text-on-surface-variant text-sm">No saved addresses yet</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {user.addresses.map((addr: SavedAddress) => (
              <div key={addr.id} className="bg-surface-container-low p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label text-xs tracking-widest uppercase">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="bg-on-surface text-surface text-[10px] tracking-widest px-2 py-0.5 uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs tracking-widest uppercase text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-on-surface-variant/40 hover:text-red-500 transition-colors"
                      aria-label="Delete address"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <p className="font-body text-sm">{addr.name}</p>
                <p className="font-body text-sm text-on-surface-variant">{addr.address}</p>
                <p className="font-body text-sm text-on-surface-variant">{addr.city}, {addr.zip}</p>
                <p className="font-body text-sm text-on-surface-variant">{addr.country}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add new address */}
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="w-full border border-outline-variant py-4 text-xs tracking-[0.3em] uppercase hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Address
          </button>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 bg-surface-container-low p-6">
            <h3 className="font-headline italic text-2xl mb-6">New Address</h3>

            <div className="space-y-1">
              <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Home, Work"
                className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors"
              />
            </div>

            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'email', label: 'Email Address', type: 'email' },
              { key: 'address', label: 'Street Address', type: 'text' },
              { key: 'city', label: 'City', type: 'text' },
              { key: 'zip', label: 'ZIP / Postal Code', type: 'text' },
              { key: 'country', label: 'Country', type: 'text' },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant block">{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={form[field.key as keyof ShippingInfo]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-3 text-on-surface font-body focus:outline-none focus:border-on-surface transition-colors"
                />
              </div>
            ))}

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="font-label text-xs tracking-widest uppercase">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setAdding(false); setForm(EMPTY); }}
                className="flex-1 border border-outline-variant py-4 text-xs tracking-[0.3em] uppercase hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-on-surface text-surface py-4 text-xs tracking-[0.3em] uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitting ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
