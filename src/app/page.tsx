'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  // Helper function to auto-fill credentials for testing
  const handleQuickLogin = (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    if (role === 'CUSTOMER') {
      setEmail('user@chiba.com');
      setPassword('123456');
    } else if (role === 'STAFF') {
      setEmail('staff@chiba.com');
      setPassword('123456');
    } else {
      setEmail('admin@chiba.com');
      setPassword('123456');
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-12">
      <div className="w-full max-w-sm mx-auto space-y-8 animate-fade-in">
        {/* Chiba Brand Identity */}
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce duration-1000">☕</div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Chiba</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">Tea • Coffee • Foods</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-premium space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Tài khoản Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                  placeholder="Nhập 6 ký tự"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg border border-destructive/20 transition-all duration-200">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="primary-btn mt-6 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xác thực...' : (
                <>
                  Đăng Nhập <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Account Options for Testing */}
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] text-center text-muted-foreground/80 font-medium mb-3 uppercase tracking-wider">
              Bấm nhanh để test vai trò:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER')}
                className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-accent/10 text-accent font-semibold rounded-lg hover:bg-accent hover:text-white border border-accent/20 active:scale-95 transition-all duration-200"
              >
                <UserCheck className="w-3.5 h-3.5" /> Khách Hàng
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('STAFF')}
                className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white border border-blue-200 active:scale-95 transition-all duration-200"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Nhân Viên
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary hover:text-white border border-primary/20 active:scale-95 transition-all duration-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị
              </button>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary hover:underline font-bold transition-all">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
