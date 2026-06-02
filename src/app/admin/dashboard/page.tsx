'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, UserPlus, Trash2, ShieldCheck, 
  Users, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';

interface MockOrder {
  id: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
}

export default function AdminDashboard() {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    invitedStaffEmails, 
    activeStaffList, 
    inviteStaff, 
    revokeInvitation 
  } = useAuth();
  const router = useRouter();

  // Local Form state for inviting staff
  const [emailInput, setEmailInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Simulated Order list for STAFF helper role
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);

  // Simulated product stock state for STAFF helper role
  const [productStocks, setProductStocks] = useState<Record<string, boolean>>({
    'p1': true, // Trà Thanh Đào
    'p2': true, // Trà Thạch Sen
    'b4': false // Bánh Tiramisu (Out of stock example)
  });

  // Guard routing for admin and staff
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // Load actual orders from localStorage (or seed mock ones if none exist)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('zen_fb_orders');
      if (storedOrders) {
        try {
          setMockOrders(JSON.parse(storedOrders));
        } catch (e) {
          console.error('Failed to parse stored orders', e);
        }
      } else {
        // Seed initial orders to make the dashboard feel alive instantly
        const defaultOrders: MockOrder[] = [
          { 
            id: 'DH001', 
            customerName: 'Nguyễn Văn A', 
            address: '123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
            items: '2x Trà Thạch Sen Bùi Thơm (Trân Châu Hoàng Kim), 1x Bánh Mì Que Pate Xá Xíu', 
            total: 127000, 
            status: 'PENDING' 
          },
          { 
            id: 'DH002', 
            customerName: 'Lê Thị B', 
            address: '456 Đường Lê Lợi, Quận 1, TP. HCM',
            items: '1x Trà Thanh Đào Highlands (Thạch Đào Giòn Sần Sật), 1x Bánh Tiramisu Highlands Mềm', 
            total: 88000, 
            status: 'CONFIRMED' 
          },
          { 
            id: 'DH003', 
            customerName: 'Trần Văn C', 
            address: '789 Đường Nguyễn Huệ, Quận 1, TP. HCM',
            items: '2x Phin Sữa Đá Đậm Đà', 
            total: 70000, 
            status: 'PENDING' 
          }
        ];
        localStorage.setItem('zen_fb_orders', JSON.stringify(defaultOrders));
        setMockOrders(defaultOrders);
      }
    }
  }, []);

  if (loading || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle staff invitation submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = emailInput.trim();
    if (!email) return;

    setSubmitting(true);
    try {
      await inviteStaff(email);
      setSuccessMsg(`Đã gửi lời mời làm Staff tới email ${email}!`);
      setEmailInput('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi lời mời.');
    } finally {
      setSubmitting(false);
    }
  };

  // Revoke staff invitation helper
  const handleRevokeInvite = async (email: string) => {
    try {
      await revokeInvitation(email);
      setSuccessMsg(`Đã thu hồi lời mời dành cho ${email}`);
    } catch (err: any) {
      setErrorMsg('Không thể thu hồi lời mời này');
    }
  };

  // Staff action: Confirm/Complete Order with localStorage sync
  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'CONFIRMED' | 'COMPLETED') => {
    setMockOrders(prev => {
      const updated = prev.map(ord => ord.id === orderId ? { ...ord, status: nextStatus } : ord);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zen_fb_orders', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Staff action: Toggle Product Stock Availability
  const handleToggleStock = (prodId: string) => {
    setProductStocks(prev => ({
      ...prev,
      [prodId]: !prev[prodId]
    }));
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">
              📊 Bảng điều khiển {isAdmin ? 'Admin' : 'Nhân Viên'}
            </h1>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
          }`}>
            Role: {user.role}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 w-full flex-grow animate-fade-in">
        
        {/* ========================================================
            ADMIN VIEW: Checks details (stats) & invites staff
            ======================================================== */}
        {isAdmin ? (
          <div className="space-y-6">
            {/* 1. Inspect Stats Panel */}
            <div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                📈 Giám sát hệ thống (Kiểm tra dữ liệu)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-1">📋</div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Đơn hàng</p>
                  <p className="text-2xl font-black text-blue-900">{mockOrders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/70 border border-green-200 p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-1">💰</div>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Doanh thu</p>
                  <p className="text-2xl font-black text-green-900">
                    {(mockOrders.reduce((sum, o) => sum + o.total, 0) / 1000).toFixed(1)}k₫
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Sản phẩm</p>
                  <p className="text-2xl font-black text-purple-900">19</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200 p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-1">👥</div>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Khách hàng</p>
                  <p className="text-2xl font-black text-orange-900">{activeStaffList.length + 1}</p>
                </div>
              </div>
            </div>

            {/* Notification triggers */}
            {successMsg && (
              <div className="p-3 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 animate-fade-in">
                ✨ {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-destructive/10 text-destructive text-xs font-bold rounded-xl border border-destructive/20 animate-fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 2. Invite Staff Panel via Email */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Mời Nhân Viên (Staff) mới</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nhập địa chỉ email của cộng tác viên/nhân viên. Hệ thống sẽ cấp quyền <strong>STAFF</strong> khi tài khoản này tiến hành đăng ký.
              </p>

              <form onSubmit={handleInviteSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                    placeholder="staff-email@zenfb.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  {submitting ? 'Đang gửi...' : 'Mời Staff'}
                </button>
              </form>
            </div>

            {/* 3. Pending Invitations list */}
            {invitedStaffEmails.length > 0 && (
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  ✉️ Lời mời đang chờ ({invitedStaffEmails.length})
                </h4>
                <div className="divide-y divide-border">
                  {invitedStaffEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                        {email}
                      </span>
                      <button
                        onClick={() => handleRevokeInvite(email)}
                        className="text-[10px] text-destructive hover:bg-destructive/5 font-bold px-3 py-1.5 rounded-lg border border-destructive/20 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" /> Thu hồi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Active Staff Team Members */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Đội ngũ Nhân viên hoạt động ({activeStaffList.length})</h3>
              </div>
              
              {activeStaffList.length > 0 ? (
                <div className="space-y-3">
                  {activeStaffList.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-border/60">
                      <div className="w-9 h-9 bg-accent/15 text-accent-foreground font-bold flex items-center justify-center rounded-full text-xs">
                        {staff.fullName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{staff.fullName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{staff.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                          {staff.customerCode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-neutral-50 rounded-xl border border-dashed border-border">
                  Chưa có Staff nào đăng ký hoạt động. Hãy điền email để mời Staff lên hệ thống!
                </p>
              )}
            </div>
          </div>
        ) : (
          // ========================================================
          // STAFF VIEW: Helps Admin fulfill orders & products availability
          // ========================================================
          <div className="space-y-6">
            
            {/* 1. Orders Helper List */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                  📦 Hỗ trợ đơn hàng hoạt động
                </h3>
                <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Fulfillment
                </span>
              </div>

              {mockOrders.length > 0 ? (
                <div className="space-y-3">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-neutral-50 rounded-xl border border-border space-y-3 shadow-sm hover:border-primary/20 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {order.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 border-y border-border/40 py-2">
                        <p className="text-xs font-black text-foreground">Khách: {order.customerName}</p>
                        
                        {/* Delivery Address display */}
                        <p className="text-[10.5px] text-muted-foreground font-bold flex items-start gap-1">
                          <span className="shrink-0 text-xs">📍</span> 
                          <span>Giao tới: {order.address}</span>
                        </p>
                        
                        <p className="text-xs text-neutral-600 font-semibold bg-white p-2 rounded-lg border border-border/50 shadow-inner">
                          {order.items}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs font-black text-primary">Giá: {order.total.toLocaleString('vi-VN')}₫</p>

                        {/* Fulfill actions */}
                        {order.status !== 'COMPLETED' && (
                          <div className="flex gap-2">
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-sm"
                              >
                                Xác nhận đơn
                              </button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-sm"
                              >
                                Hoàn thành pha chế ✓
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
                  Chưa có đơn hàng nào cần xử lý.
                </p>
              )}
            </div>

            {/* 2. Product Availability Controller */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                  🛒 Quản lý tình trạng Món (Stock)
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Nhân viên có thể bật/tắt nhanh khi hết nguyên liệu pha chế.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  { id: 'p1', name: 'Trà Thanh Đào Highlands' },
                  { id: 'p2', name: 'Trà Thạch Sen Bùi Thơm' },
                  { id: 'b4', name: 'Bánh Tiramisu Highlands Mềm' }
                ].map((prod) => {
                  const inStock = productStocks[prod.id] !== false;
                  return (
                    <div key={prod.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-border/70 hover:border-primary/20 transition">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">{prod.name}</p>
                        <p className="text-[9px] font-medium text-muted-foreground">ID: {prod.id}</p>
                      </div>

                      <button
                        onClick={() => handleToggleStock(prod.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                          inStock 
                            ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                        }`}
                      >
                        {inStock ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-primary stroke-[2.2]" /> Còn hàng
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-destructive stroke-[2.2]" /> Hết hàng
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Demo Info Box matching layout */}
        <div className="p-4 bg-[#FAF7F2] border border-border rounded-xl flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">Vai Trò Hệ Thống:</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isAdmin 
                ? 'Bạn đang ở chế độ Admin: Chỉ giám sát và mời Staff cộng tác. Bạn không trực tiếp pha chế.'
                : 'Bạn đang ở chế độ Staff: Giúp Admin vận hành, hoàn thành tiến độ đơn hàng và cập nhật tình trạng kho bánh nước.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
