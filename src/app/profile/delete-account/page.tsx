'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ArrowLeft, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export default function DeleteAccountPage() {
  const { deleteAccount, isAuthenticated } = useAuth();
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<'SUSPEND' | 'DELETE'>('SUSPEND');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleProcessAction = async () => {
    setLoading(true);
    try {
      await deleteAccount(selectedOption);
      router.push('/');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      {/* Dark Charcoal Header matching screenshot 3 exactly */}
      <div className="sticky top-0 z-40 bg-[#262626] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Xóa tài khoản</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-5 py-6 flex-grow flex flex-col space-y-6 w-full animate-fade-in">
        <p className="text-sm font-semibold text-[#595959] text-center">
          Bạn muốn thao tác gì đối với tài khoản của mình?
        </p>

        {/* Radio Option 1: Tạm ngưng hoạt động tài khoản */}
        <div
          onClick={() => setSelectedOption('SUSPEND')}
          className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
            selectedOption === 'SUSPEND'
              ? 'bg-card border-accent shadow-sm'
              : 'bg-card/50 border-border hover:border-accent/40'
          }`}
        >
          {/* Custom Radio Button */}
          <div className="mt-0.5 shrink-0">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedOption === 'SUSPEND' ? 'border-accent bg-accent text-white' : 'border-neutral-300'
            }`}>
              {selectedOption === 'SUSPEND' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className={`font-bold text-base transition-colors ${
              selectedOption === 'SUSPEND' ? 'text-accent-foreground' : 'text-foreground'
            }`}>
              Tạm ngưng hoạt động tài khoản
            </h3>
            <div className="text-xs text-[#C82333] space-y-2.5 font-medium leading-relaxed">
              <p>• Việc tạm ngưng hoạt động vẫn duy trì tài khoản của bạn trên hệ thống của chúng tôi.</p>
              <p>• Bạn vẫn có thể khôi phục lại tài khoản khi bạn thay đổi ý định bằng việc liên hệ tổng đài hỗ trợ để kích hoạt lại tài khoản.</p>
            </div>
          </div>
        </div>

        {/* Radio Option 2: Xóa tài khoản */}
        <div
          onClick={() => setSelectedOption('DELETE')}
          className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
            selectedOption === 'DELETE'
              ? 'bg-card border-[#C82333] shadow-sm'
              : 'bg-card/50 border-border hover:border-accent/40'
          }`}
        >
          {/* Custom Radio Button */}
          <div className="mt-0.5 shrink-0">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedOption === 'DELETE' ? 'border-[#C82333] bg-[#C82333] text-white' : 'border-neutral-300'
            }`}>
              {selectedOption === 'DELETE' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-base text-foreground">
              Xóa tài khoản
            </h3>
            <div className="text-xs text-[#C82333] space-y-2.5 font-medium leading-relaxed">
              <p>• Xóa tài khoản sẽ vĩnh viễn xóa dữ liệu của bạn.</p>
              <p>• Tài khoản không thể khôi phục lại.</p>
              <p>• Bạn không thể truy cập ứng dụng trong thời gian yêu cầu xóa.</p>
              <p>• Bạn sẽ mất toàn bộ điểm và hạng thẻ hiện tại.</p>
              <p>• Các yêu cầu đổi quà đang có sẽ bị hủy.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6 mt-4">
          {/* Hotline Box exactly matching screenshot 3 */}
          <div className="text-center space-y-3 bg-neutral-50 border border-border p-4 rounded-xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng đài hỗ trợ:
            </p>
            <div className="flex flex-col gap-2 font-bold text-sm text-[#D87D4A] tracking-wider">
              <a href="tel:0988446746" className="hover:underline hover:text-[#c46938] transition">
                0988.446.746
              </a>
              <a href="tel:0911510451" className="hover:underline hover:text-[#c46938] transition">
                0911.510.451
              </a>
              <a href="tel:0944303730" className="hover:underline hover:text-[#c46938] transition">
                0944.303.730
              </a>
            </div>
          </div>
        </div>

        {/* Action Button at bottom */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-[#262626] hover:bg-black text-white font-bold py-4 rounded-xl shadow-premium transition active:scale-[0.99] mt-auto text-sm uppercase tracking-wider"
        >
          TIẾP TỤC
        </button>
      </div>

      {/* CONFIRM ACTION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border shadow-modal text-center space-y-6">
            <div className="w-12 h-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Bạn có chắc chắn?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed px-2">
                {selectedOption === 'SUSPEND'
                  ? 'Hành động này sẽ tạm dừng hoạt động tài khoản của bạn. Bạn có thể kích hoạt lại sau.'
                  : 'Cảnh báo! Hành động này sẽ vĩnh viễn xóa tài khoản và mọi điểm tích lũy của bạn không thể khôi phục lại.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-foreground font-semibold rounded-xl text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleProcessAction}
                disabled={loading}
                className="flex-1 py-3 bg-[#C82333] hover:bg-[#b01e2c] text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
