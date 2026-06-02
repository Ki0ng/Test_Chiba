'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, BadgeCheck, Star, Trash2, ShieldCheck, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfileName, loading } = useAuth();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Show the welcome modal automatically if name is "Noname" (similar to image pop-up)
  useEffect(() => {
    if (user && user.fullName === 'Noname') {
      const timer = setTimeout(() => {
        setInputName('');
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!inputName.trim()) return;
    setUpdating(true);
    try {
      await updateProfileName(inputName.trim());
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const triggerUpdateModal = () => {
    setInputName(user.fullName);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Stick Header standard layout */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Thông tin cá nhân</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6 animate-fade-in">
        {/* User Large Avatar matching image placeholder */}
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-7xl translate-x-4 -translate-y-4 opacity-5 select-none">👤</div>
          <div className="w-24 h-24 bg-neutral-200 border-4 border-white shadow-premium rounded-full flex items-center justify-center text-5xl text-neutral-500 overflow-hidden mb-4">
            👤
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{user.fullName}</h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{user.email}</p>
          {user.role === 'ADMIN' && (
            <div className="mt-3 inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Quản trị viên
            </div>
          )}
        </div>

        {/* User Info Form Grid from screenshot */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {/* Full Name field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Họ và tên</p>
              <p className="font-bold text-foreground text-sm">{user.fullName}</p>
            </div>
            <User className="w-5 h-5 text-muted-foreground/40" />
          </div>

          {/* Phone field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Số điện thoại</p>
              <p className="font-bold text-foreground text-sm">{user.phone || 'Chưa cập nhật'}</p>
            </div>
            <Phone className="w-5 h-5 text-muted-foreground/40" />
          </div>

          {/* Customer code field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Mã khách hàng</p>
              <p className="font-bold text-primary text-sm tracking-widest">{user.customerCode}</p>
            </div>
            <BadgeCheck className="w-5 h-5 text-primary/50" />
          </div>

          {/* Zen points field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Điểm Chiba</p>
              <p className="font-bold text-accent text-sm">{user.zenPoints} điểm</p>
            </div>
            <Star className="w-5 h-5 text-accent/50" />
          </div>
        </div>

        {/* Admin Section if Admin role */}
        {user.role === 'ADMIN' && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
              ⚙️ Tính năng Quản trị
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/dashboard"
                className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
              >
                📊 Bảng điều khiển Admin
              </Link>
              <Link
                href="/stores"
                className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
              >
                📍 Danh sách Cửa Hàng
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="space-y-4 pt-4">
          {/* Delete Account link standard red text */}
          <div className="text-center">
            <Link
              href="/profile/delete-account"
              className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive-hover font-bold hover:underline transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa tài khoản
            </Link>
          </div>

          {/* Large Black Charcoal Button matches screenshot */}
          <button
            onClick={triggerUpdateModal}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold py-4 rounded-xl shadow-premium transition active:scale-[0.99] text-sm uppercase tracking-wider"
          >
            Cập nhật thông tin
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-neutral-100 hover:bg-neutral-200 border border-border text-foreground font-semibold py-3 rounded-xl transition active:scale-[0.99] text-sm"
          >
            🚪 Đăng xuất tài khoản
          </button>
        </div>
      </div>

      {/* POPUP MODAL (ZEN xin chào!) MATCHING SCREENSHOT 4 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card w-full max-w-[280px] rounded-2xl border border-border shadow-modal text-center overflow-hidden animate-fade-in">
            {/* Modal Heading Details */}
            <div className="p-5 space-y-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">Chiba xin chào!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Vui lòng nhập tên của bạn</p>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-center mt-3 font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/45"
                placeholder="Nhập họ và tên..."
                autoFocus
              />
            </div>

            {/* Actions: Bỏ qua / Đồng ý side by side */}
            <div className="flex border-t border-border mt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-sm text-muted-foreground font-semibold hover:bg-neutral-50 active:bg-neutral-100 border-r border-border transition-colors"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                disabled={updating || !inputName.trim()}
                className="flex-1 py-3 text-sm text-primary font-bold hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-40"
              >
                {updating ? 'Đang lưu...' : 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
