'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { User } from '@/types';
import { MapPin, ShoppingCart, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const { totalItems } = useCart();
  const [selectedStore, setSelectedStore] = useState('Chọn cửa hàng');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStore = localStorage.getItem('zen_selected_store');
      if (storedStore) {
        setSelectedStore(storedStore);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-white shadow-md rounded-b-[1.5rem] overflow-hidden">
      <div className="max-w-2xl mx-auto px-5 py-4">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">☕</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ZEN F&B</h1>
              <p className="text-[10px] text-white/70 tracking-widest uppercase">Trà & Cà Phê</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link href="/cart" className="relative p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all duration-200">
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-primary animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile Avatar */}
            <Link href="/profile" className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all duration-200">
              <div className="w-7 h-7 flex items-center justify-center bg-accent text-white font-semibold rounded-full text-xs border border-white/20">
                {user?.fullName ? user.fullName[0].toUpperCase() : '👤'}
              </div>
              <span className="text-xs font-medium hidden sm:inline text-white/95">Hồ Sơ</span>
            </Link>
          </div>
        </div>

        {/* Selected Store Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <Link href="/stores" className="flex items-center gap-2 text-white/95 hover:text-white group transition-colors">
            <MapPin className="w-4 h-4 text-accent group-hover:animate-pulse" />
            <div className="text-left">
              <p className="text-[9px] text-white/60 leading-none">Cửa hàng đang chọn</p>
              <p className="text-sm font-semibold truncate max-w-[200px] sm:max-w-[280px]">
                {selectedStore}
              </p>
            </div>
          </Link>
          <Link
            href="/stores"
            className="text-[11px] font-medium bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded-full shadow-sm hover:shadow-premium transition-all duration-200"
          >
            Đổi
          </Link>
        </div>
      </div>
    </header>
  );
}
