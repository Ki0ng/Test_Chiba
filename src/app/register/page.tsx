'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { User, Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
      router.push('/home');
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-10">
      <div className="w-full max-w-sm mx-auto space-y-8 animate-fade-in">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 bg-card hover:bg-neutral-50 border border-border text-foreground rounded-full active:scale-95 shadow-sm transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-semibold text-muted-foreground">Quay lại đăng nhập</span>
        </div>

        {/* Brand Banner */}
        <div className="text-center">
          <div className="text-5xl mb-3">☕</div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Tạo tài khoản</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Gia nhập ngôi nhà Chiba</p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-premium space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Họ và Tên
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                  placeholder="Họ và tên của bạn"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                  placeholder="nhapemail@domain.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Ít nhất 6 ký tự"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Xác nhận Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                  placeholder="Gõ lại mật khẩu phía trên"
                  required
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg border border-destructive/20 transition-all duration-200">
                ⚠️ {error}
              </div>
            )}

            {/* Register Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="primary-btn mt-6 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang tạo tài khoản...' : (
                <>
                  <UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Member Redirect */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/" className="text-primary hover:underline font-bold transition-all">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
