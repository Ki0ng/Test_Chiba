'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Header from '@/components/layout/Header';
import ProductList from '@/components/products/ProductList';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { Home, MapPin, ShoppingBag, User } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-xs text-muted-foreground mt-3 font-semibold">Đang tải hương vị...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 flex flex-col">
      {/* Premium Header */}
      <Header user={user} />

      {/* Main Content Area */}
      <div className="px-5 py-6 space-y-6 flex-grow max-w-2xl mx-auto w-full animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-5 rounded-2xl border border-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 text-7xl translate-x-3 translate-y-3 opacity-15">🍵</div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Xin chào, {user?.fullName || 'bạn'}!
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            Chọn đồ uống & món ăn yêu thích của bạn cho ngày hôm nay
          </p>
        </div>

        {/* Categories & Products */}
        <ProductList />
      </div>

      {/* Premium Mobile Dock at bottom */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-md border-t border-border py-2 px-6 flex items-center justify-around z-40 shadow-floating">
        <Link href="/home" className="flex flex-col items-center gap-1 text-primary transition-all duration-200">
          <Home className="w-5.5 h-5.5 stroke-[2.5]" />
          <span className="text-[10px] font-bold">Món Ngon</span>
        </Link>

        <Link href="/stores" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200">
          <MapPin className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Cửa Hàng</span>
        </Link>

        <Link href="/cart" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary relative transition-all duration-200">
          <ShoppingBag className="w-5.5 h-5.5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-accent text-[9px] font-bold text-white h-4.5 w-4.5 flex items-center justify-center rounded-full border border-white">
              {totalItems}
            </span>
          )}
          <span className="text-[10px] font-medium">Giỏ Hàng</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200">
          <User className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Hồ Sơ</span>
        </Link>
      </nav>
    </div>
  );
}
