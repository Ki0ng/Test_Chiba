'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { ArrowLeft, MapPin, Search } from 'lucide-react';

const MOCK_STORES: Store[] = [
  { id: 's1', name: 'ZEN TEA Biên Hùng', address: 'Số 241 đường 30/4, p. Trung Dũng Biên Hoà - Đồng Nai', phone: '0251.3822.421', isActive: true },
  { id: 's2', name: 'ZEN TEA Ngô Quyền', address: 'Số 328 đường 30/4, p. Trung Dũng Biên Hoà - Đồng Nai', phone: '0251.3822.422', isActive: true },
  { id: 's3', name: 'ZEN TEA Quảng Trường', address: 'Số 384 đường Phạm Văn Thuận, p.Trung Dũng, Biên Hoà - Đồng Nai', phone: '0251.3822.423', isActive: true },
  { id: 's4', name: 'ZEN TEA Hố Nai', address: 'Số 63 đường Nguyễn Ái Quốc, p.Tân Biên Biên Hoà - Đồng Nai', phone: '0251.3822.424', isActive: true },
  { id: 's5', name: 'ZEN TEA Trảng Bom', address: 'Số 2469 Quốc Lộ 1A, Trảng Bom - Đồng Nai', phone: '0251.3822.425', isActive: true },
  { id: 's6', name: 'ZEN TEA Long Thành', address: 'Số 251 - 253 Lê Duẩn, tổ 32, khu Cầu Xéo Long Thành - Đồng Nai', phone: '0251.3822.426', isActive: true },
  { id: 's7', name: 'ZEN TEA Trảng Dài', address: 'Số 169 Nguyễn Ái Quốc, KP1 Biên Hòa - Đồng Nai', phone: '0251.3822.427', isActive: true },
  { id: 's8', name: 'ZEN TEA Long Khánh', address: 'Số 428C đường Hồ Thị Hương, p. Xuân An Long Khánh - Đồng Nai', phone: '0251.3822.428', isActive: true },
  { id: 's9', name: 'ZEN TEA Thích Quảng Đức', address: 'Số 254 đường Thích Quảng Đức, p. Chánh Nghĩa, Thủ Dầu Một - Bình Dương', phone: '0251.3822.429', isActive: true }
];

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSelectStore = (store: Store) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zen_selected_store', store.name);
      localStorage.setItem('zen_selected_store_address', store.address);
    }
    router.push('/home');
  };

  const filteredStores = MOCK_STORES.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Premium Forest Green Header matching screenshot */}
      <div className="sticky top-0 z-40 bg-[#1E4620] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Chọn cửa hàng</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Tìm kiếm chi nhánh gần nhất..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        {/* Stores List */}
        <div className="space-y-1 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {filteredStores.length > 0 ? (
            filteredStores.map((store, index) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className={`w-full text-left p-5 hover:bg-neutral-50 active:bg-neutral-100 flex items-start gap-4 transition-all duration-150 ${
                  index !== filteredStores.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="p-2 bg-primary/5 rounded-xl mt-0.5 text-primary shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm tracking-tight truncate">
                    {store.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {store.address}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              <p className="text-3xl mb-2">📍</p>
              <p className="font-semibold text-sm">Không tìm thấy chi nhánh nào</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Vui lòng thử tìm kiếm bằng từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
