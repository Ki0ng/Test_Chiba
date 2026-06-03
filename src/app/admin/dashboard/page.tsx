'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, UserPlus, Trash2, ShieldCheck, 
  Users, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight, Sparkles,
  Coins, Search, UserCheck, History, Plus, Minus, FileText, Filter
} from 'lucide-react';
import { User, PointTransaction } from '@/types';
import { MOCK_PRODUCTS } from '@/components/products/ProductList';

interface MockOrder {
  id: string;
  userId?: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function AdminDashboard() {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    invitedStaffEmails, 
    activeStaffList, 
    inviteStaff, 
    revokeInvitation,
    getAllUsers,
    updateUserPoints,
    getPointHistory
  } = useAuth();
  const router = useRouter();

  // Navigation tab state
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<string>('');

  // Set default tab based on role once user loads
  useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'ADMIN' ? 'SYSTEM' : 'ORDERS');
    }
  }, [user]);

  // Local Form state for inviting staff
  const [emailInput, setEmailInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Simulated Order list
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);

  // Simulated product stock state
  const [productStocks, setProductStocks] = useState<Record<string, boolean>>({
    'p1': true, // Trà Thanh Đào
    'p2': true, // Trà Thạch Sen
    'b4': false // Bánh Tiramisu (Out of stock example)
  });

  // Loyalty Points Admin States
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  
  // Point history log search query
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Selected customer for modal action
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'REDEEM' | 'ADJUST' | null>(null);
  
  // Point action form fields
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<number>(0);
  const [reasonInput, setReasonInput] = useState('');
  const [giftInput, setGiftInput] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) {
      setPointsAmount(0);
      setGiftInput('');
      return;
    }
    if (prodId === 'custom') {
      setPointsAmount(0);
      setGiftInput('');
      return;
    }
    const product = MOCK_PRODUCTS.find(p => p.id === prodId);
    if (product) {
      const ptsRequired = Math.floor(product.price / 500);
      setPointsAmount(ptsRequired);
      setGiftInput(`Đổi quà tại cửa hàng: ${product.name}`);
    }
  };

  // Guard routing for admin and staff
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // Refresh customer list from simulated DB
  const refreshCustomers = () => {
    if (getAllUsers) {
      setAllCustomers(getAllUsers().filter(u => u.role === 'CUSTOMER'));
    }
  };

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
            userId: 'user_1',
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
      refreshCustomers();
    }
  }, []);

  if (loading || !isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
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
  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
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

  // Point action handler (Redeem/Adjust)
  const handlePointAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !updateUserPoints) return;
    
    setErrorMsg('');
    setSuccessMsg('');
    setActionSubmitting(true);

    try {
      if (actionType === 'REDEEM') {
        if (pointsAmount <= 0) {
          throw new Error('Số điểm đổi phải lớn hơn 0');
        }
        if (pointsAmount > (selectedCustomer.zenPoints || 0)) {
          throw new Error('Khách hàng không đủ điểm để đổi quà');
        }
        if (!giftInput.trim()) {
          throw new Error('Vui lòng nhập món ăn/nước uống muốn đổi');
        }

        await updateUserPoints(
          selectedCustomer.id,
          -pointsAmount,
          'REDEEMED_STORE',
          `Đổi quà tại cửa hàng: ${giftInput.trim()} (-${pointsAmount} điểm)`
        );

        setSuccessMsg(`Đã đổi quà thành công cho khách hàng ${selectedCustomer.fullName}! Khấu trừ ${pointsAmount} điểm.`);
      } else if (actionType === 'ADJUST') {
        if (pointsAmount === 0) {
          throw new Error('Số điểm điều chỉnh phải khác 0');
        }
        if (!reasonInput.trim()) {
          throw new Error('Vui lòng nhập lý do điều chỉnh điểm');
        }

        await updateUserPoints(
          selectedCustomer.id,
          pointsAmount,
          'ADMIN_ADJUST',
          reasonInput.trim()
        );

        setSuccessMsg(`Đã cập nhật điểm cho khách hàng ${selectedCustomer.fullName}: ${pointsAmount > 0 ? '+' : ''}${pointsAmount} điểm.`);
      }

      // Close modal & reset fields
      setSelectedCustomer(null);
      setActionType(null);
      setSelectedProductId('');
      setPointsAmount(0);
      setReasonInput('');
      setGiftInput('');
      refreshCustomers();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Thực hiện thao tác thất bại');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filter customers by search query
  const filteredCustomers = allCustomers.filter(c => {
    const query = customerSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.fullName.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      c.customerCode.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  // Calculate completed order count dynamically
  const getCompletedOrdersCount = (cust: User) => {
    return mockOrders.filter(o => (o.userId === cust.id || o.customerName === cust.fullName) && o.status === 'COMPLETED').length;
  };

  // Point history log filters
  const allHistory = getPointHistory ? getPointHistory() : [];
  const filteredHistory = allHistory.filter(tx => {
    const query = historySearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      tx.userName.toLowerCase().includes(query) ||
      tx.userEmail.toLowerCase().includes(query) ||
      tx.description.toLowerCase().includes(query)
    );
  });

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
        
        {/* Navigation Tabs based on role */}
        {activeTab && (
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-border/80 shadow-inner">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('SYSTEM');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'SYSTEM' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📊 Hệ thống
                </button>
                <button
                  onClick={() => {
                    setActiveTab('CUSTOMERS');
                    setErrorMsg('');
                    setSuccessMsg('');
                    refreshCustomers();
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'CUSTOMERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Khách hàng
                </button>
                <button
                  onClick={() => {
                    setActiveTab('HISTORY');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'HISTORY' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Lịch sử điểm
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('ORDERS');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'ORDERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📦 Đơn hàng
                </button>
                <button
                  onClick={() => {
                    setActiveTab('STOCKS');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'STOCKS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🛒 Kho món
                </button>
                <button
                  onClick={() => {
                    setActiveTab('CUSTOMERS');
                    setErrorMsg('');
                    setSuccessMsg('');
                    refreshCustomers();
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'CUSTOMERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Khách đổi quà
                </button>
              </>
            )}
          </div>
        )}

        {/* Global Notifications */}
        {successMsg && (
          <div className="p-3.5 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 animate-fade-in shadow-sm">
            ✨ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-destructive/10 text-destructive text-xs font-bold rounded-xl border border-destructive/20 animate-fade-in shadow-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ========================================================
            TAB: SYSTEM OVERVIEW (ADMIN ONLY)
            ======================================================== */}
        {isAdmin && activeTab === 'SYSTEM' && (
          <div className="space-y-6">
            {/* 1. Inspect Stats Panel */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
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
                  <p className="text-2xl font-black text-orange-900">{allCustomers.length}</p>
                </div>
              </div>
            </div>

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
        )}

        {/* ========================================================
            TAB: CUSTOMERS & POINTS REDEMPTION (ADMIN & STAFF)
            ======================================================== */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                👥 Quản lý điểm & đổi thưởng khách hàng
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1">
                Tìm kiếm khách hàng bằng tên, SĐT, hoặc mã khách hàng để thực hiện đổi quà tại quầy hoặc CRUD điểm.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Tìm khách hàng theo Tên, Số điện thoại hoặc Mã..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm transition-all"
              />
            </div>

            {/* Customer List */}
            <div className="space-y-3">
              {filteredCustomers.map(cust => (
                <div key={cust.id} className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 text-accent-foreground font-black flex items-center justify-center rounded-full text-xs">
                      {cust.fullName[0].toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{cust.fullName}</span>
                        <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 tracking-widest">
                          {cust.customerCode}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">{cust.email} | SĐT: {cust.phone || 'Chưa cập nhật'}</p>
                      
                      <div className="flex gap-4 pt-1">
                        <span className="text-[10px] font-bold text-accent-foreground bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-accent" /> Điểm: <strong className="font-black text-sm">{cust.zenPoints || 0}</strong>
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          🛍️ Đã mua: <strong className="text-foreground">{getCompletedOrdersCount(cust)} đơn hàng</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setActionType('REDEEM');
                        setSelectedProductId('');
                        setPointsAmount(0);
                        setGiftInput('');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[10px] font-black text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-2 rounded-xl active:scale-95 transition"
                    >
                      🎁 Đổi quà tại quầy
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setActionType('ADJUST');
                          setPointsAmount(0);
                          setReasonInput('');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-2 rounded-xl active:scale-95 transition"
                      >
                        ✏️ Điều chỉnh điểm
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredCustomers.length === 0 && (
                <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-border/80">
                  <p className="text-xs text-muted-foreground font-bold">Không tìm thấy khách hàng nào</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: POINT TRANSACTION HISTORY (ADMIN ONLY)
            ======================================================== */}
        {isAdmin && activeTab === 'HISTORY' && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <History className="w-4 h-4 text-primary" /> Nhật ký giao dịch điểm toàn hệ thống
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1">
                Lịch sử ghi nhận tất cả thay đổi tích điểm tự động hoặc điều chỉnh từ Admin/đổi quà tại quầy.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Lọc lịch sử theo tên khách hàng, email hoặc nội dung..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm"
              />
            </div>

            {/* Point History Log */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60 shadow-sm">
              {filteredHistory.map(tx => {
                const isPositive = tx.points >= 0;
                return (
                  <div key={tx.id} className="p-4 hover:bg-neutral-50/40 transition flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{tx.userName}</span>
                        <span className="text-[9.5px] text-muted-foreground font-medium">({tx.userEmail})</span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase ${
                          tx.type === 'EARNED_ORDER' ? 'bg-green-50 text-green-700 border border-green-200' :
                          tx.type === 'REDEEMED_APP' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          tx.type === 'REDEEMED_STORE' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {tx.type === 'EARNED_ORDER' ? 'Tích đơn' :
                           tx.type === 'REDEEMED_APP' ? 'Tiêu app' :
                           tx.type === 'REDEEMED_STORE' ? 'Tiêu quầy' : 'Admin chỉnh'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 font-semibold">{tx.description}</p>
                      <div className="flex gap-2.5 text-[9.5px] text-muted-foreground/70 font-semibold mt-0.5 flex-wrap">
                        <span>Số dư trước: {tx.pointsBefore || 0}</span>
                        <span>•</span>
                        <span>Số dư sau: {tx.pointsAfter || 0}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    
                    <div className={`text-xs font-black whitespace-nowrap px-2 py-1 rounded ${
                      isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-destructive'
                    }`}>
                      {isPositive ? '+' : ''}{tx.points}
                    </div>
                  </div>
                );
              })}
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs text-muted-foreground font-bold">Không tìm thấy giao dịch nào</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Hệ thống chưa ghi nhận giao dịch điểm tương ứng</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: ORDERS FULFILLMENT (STAFF ONLY)
            ======================================================== */}
        {!isAdmin && activeTab === 'ORDERS' && (
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
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
        )}

        {/* ========================================================
            TAB: PRODUCT STOCK CONTROLLER (STAFF ONLY)
            ======================================================== */}
        {!isAdmin && activeTab === 'STOCKS' && (
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
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
        )}

        {/* Demo Info Box */}
        <div className="p-4 bg-[#FAF7F2] border border-border rounded-xl flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">Vai Trò Hệ Thống:</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isAdmin 
                ? 'Bạn đang ở chế độ Admin: Quản lý thống kê, mời nhân viên mới, CRUD điểm tích lũy và kiểm tra nhật ký điểm.'
                : 'Bạn đang ở chế độ Staff: Giúp Admin vận hành đơn hàng, quản lý tình trạng còn/hết món, tra cứu và trừ điểm đổi quà tại quầy cho khách.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: REDEEM OR ADJUST POINTS FOR SELECTED CUSTOMER
          ======================================================== */}
      {selectedCustomer && actionType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border shadow-modal space-y-5 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                {actionType === 'REDEEM' ? '🎁 Đổi quà tại quầy' : '✏️ Điều chỉnh điểm (Admin)'}
              </h3>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setActionType(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-full hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 border border-border rounded-xl space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Khách hàng</p>
              <p className="text-xs font-black text-foreground">{selectedCustomer.fullName} ({selectedCustomer.customerCode})</p>
              <p className="text-xs font-bold text-accent-foreground flex items-center gap-1 mt-1">
                <Coins className="w-4 h-4 text-accent" /> Điểm hiện có: <strong className="text-sm font-black text-accent">{selectedCustomer.zenPoints || 0} điểm</strong>
              </p>
            </div>

            <form onSubmit={handlePointAction} className="space-y-4">
              {actionType === 'REDEEM' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Chọn món nước/bánh muốn đổi:</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    >
                      <option value="">-- Chọn món nước/bánh --</option>
                      {MOCK_PRODUCTS.filter(p => p.category === 'MON_NUOC' || p.category === 'BANH').map(prod => {
                        const ptsRequired = Math.floor(prod.price / 500);
                        return (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({prod.price.toLocaleString('vi-VN')}đ = {ptsRequired} điểm)
                          </option>
                        );
                      })}
                      <option value="custom">-- Tùy chỉnh số điểm (Giảm trực tiếp) --</option>
                    </select>
                  </div>

                  {selectedProductId === 'custom' && (
                    <div className="space-y-3 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Số điểm muốn trừ:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={selectedCustomer.zenPoints || 0}
                            value={pointsAmount || ''}
                            onChange={(e) => setPointsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            placeholder="Ví dụ: 20"
                            className="w-full px-3 py-2 bg-neutral-50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setPointsAmount(selectedCustomer.zenPoints || 0)}
                            className="text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-2.5 rounded-lg active:scale-95 transition"
                          >
                            Tất cả
                          </button>
                        </div>
                        <p className="text-[9.5px] text-muted-foreground font-semibold">Tương đương giá trị giảm: {(pointsAmount * 500).toLocaleString('vi-VN')}₫</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mô tả quà tặng / Giảm giá:</label>
                        <input
                          type="text"
                          value={giftInput}
                          onChange={(e) => setGiftInput(e.target.value)}
                          placeholder="Ví dụ: Giảm giá nước uống cho khách hàng tại quầy"
                          className="w-full px-3.5 py-2.5 bg-neutral-50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {selectedProductId && selectedProductId !== 'custom' && (
                    <div className="space-y-3 animate-fade-in pt-2 bg-neutral-50 p-3 rounded-xl border border-border/80">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>Số điểm khấu trừ:</span>
                        <span className="text-accent text-sm font-black">{pointsAmount} điểm</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-accent-foreground font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 animate-pulse" />
                        {selectedCustomer.zenPoints >= pointsAmount ? (
                          <span>Khách hàng đủ điều kiện đổi món này.</span>
                        ) : (
                          <span className="text-destructive font-black">
                            ⚠️ Khách hàng thiếu {pointsAmount - selectedCustomer.zenPoints} điểm để đổi món này.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Cộng/Trừ điểm (Nhập số âm để trừ):</label>
                    <input
                      type="number"
                      value={pointsAmount || ''}
                      onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                      placeholder="Ví dụ: +20 hoặc -15"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Lý do điều chỉnh:</label>
                    <input
                      type="text"
                      value={reasonInput}
                      onChange={(e) => setReasonInput(e.target.value)}
                      placeholder="Ví dụ: Quà tặng sinh nhật khách hàng"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setActionType(null);
                  }}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 border border-border text-foreground font-semibold text-xs rounded-xl active:scale-95 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting || (actionType === 'REDEEM' && (pointsAmount <= 0 || pointsAmount > (selectedCustomer.zenPoints || 0)))}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl active:scale-95 transition disabled:opacity-40"
                >
                  {actionSubmitting ? 'Đang thực hiện...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
