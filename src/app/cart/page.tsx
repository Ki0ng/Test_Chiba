'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingCart, ArrowLeft, Coffee, Sparkles, CheckCircle2, Coins, Gift } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { user, isAuthenticated, updateProfileAddress, updateUserPoints } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Address and Delivery state
  const [address, setAddress] = useState(user?.address || '');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'STORE'>('DELIVERY');

  // Points discount states
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  const userPoints = user?.zenPoints || 0;
  const maxDiscountValue = totalPrice * 0.20; // 20% limit
  const maxPointsAllowed = Math.floor(maxDiscountValue / 500);
  const maxPointsPossible = Math.min(userPoints, maxPointsAllowed);

  const discountAmount = usePoints ? pointsToUse * 500 : 0;
  
  // Shipping Fee calculation: Free ship if total >= 100k, otherwise 20k
  const shippingFee = orderType === 'DELIVERY' ? (totalPrice >= 100000 ? 0 : 20000) : 0;
  const finalPrice = totalPrice - discountAmount + shippingFee;

  // Auto-clip points if cart items change and lower the limit below current pointsToUse
  useEffect(() => {
    if (usePoints && pointsToUse > maxPointsPossible) {
      setPointsToUse(maxPointsPossible);
    }
  }, [totalPrice, userPoints, usePoints, maxPointsPossible, pointsToUse]);

  const handleTogglePoints = (checked: boolean) => {
    setUsePoints(checked);
    if (checked) {
      setPointsToUse(maxPointsPossible);
    } else {
      setPointsToUse(0);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Sync address from profile when user loaded
  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address);
    }
  }, [user, address]);

  if (!isAuthenticated) {
    return null;
  }

  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ tự động định vị vị trí');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim Free Reverse Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=vi`
          );
          
          if (!response.ok) throw new Error('Failed to resolve coordinates');
          
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setError('Không thể tìm thấy địa chỉ cho tọa độ này');
          }
        } catch (err) {
          setError('Không thể kết nối dịch vụ bản đồ. Vui lòng nhập tay địa chỉ.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setError('Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền GPS cho trình duyệt.');
        } else {
          setError('Không thể xác định vị trí GPS từ thiết bị của bạn');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    if (orderType === 'DELIVERY' && !address.trim()) {
      setError('Vui lòng cung cấp địa chỉ nhận hàng để shop tiến hành giao hàng 📍');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!user) {
        setError('Bạn cần đăng nhập để thực hiện đặt hàng');
        setLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 1. Save address to profile if checked
      if (saveAsDefault && orderType === 'DELIVERY') {
        await updateProfileAddress(address.trim());
      }

      // 2. Synchronize order with simulated database in localStorage
      const storedOrders = localStorage.getItem('zen_fb_orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Calculate formatted items text for simple admin reading
      const formattedItemsText = items
        .map(item => {
          const toppingsText = item.selectedToppings && item.selectedToppings.length > 0
            ? ` (${item.selectedToppings.map(t => t.name).join(', ')})`
            : '';
          return `${item.quantity}x ${item.name}${toppingsText}`;
        })
        .join(', ');

      const orderId = `DH00` + (orders.length + 4);
      const discount = usePoints ? pointsToUse * 500 : 0;
      const shipFee = orderType === 'DELIVERY' ? (totalPrice >= 100000 ? 0 : 20000) : 0;
      const finalTotal = totalPrice - discount + shipFee;

      const newOrder = {
        id: orderId,
        userId: user.id,
        customerName: user.fullName,
        address: orderType === 'DELIVERY' ? address.trim() : 'Đến nhận tại cửa hàng 🏠',
        items: formattedItemsText,
        total: finalTotal,
        orderType: orderType,
        shippingFee: shipFee,
        pointsUsed: usePoints ? pointsToUse : 0,
        discountAmount: discount,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder); // Prepend so newest is at the top
      localStorage.setItem('zen_fb_orders', JSON.stringify(orders));

      // 3. Deduct points first via Context
      if (usePoints && pointsToUse > 0) {
        await updateUserPoints(
          user.id,
          -pointsToUse,
          'REDEEMED_APP',
          `Áp dụng điểm giảm giá cho đơn hàng ${orderId} (-${discount.toLocaleString('vi-VN')}đ)`
        );
      }

      // 4. Calculate earned points from final product amount (excluding shipping fee): 10,000đ spent = 1 point
      const pointsAdded = Math.floor((totalPrice - discount) / 10000);
      setEarnedPoints(pointsAdded);

      if (pointsAdded > 0) {
        await updateUserPoints(
          user.id,
          pointsAdded,
          'EARNED_ORDER',
          `Tích điểm từ đơn hàng ${orderId} (+${pointsAdded} điểm)`
        );
      }

      clearCart();
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Header sticky */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Giỏ hàng của bạn</h1>
          <span className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            {totalItems} Món
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {items.length > 0 ? (
          <div className="space-y-4">
            {/* Cart Items List */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card">
                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                    <Coffee className="w-6 h-6 text-primary" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-snug">{item.name}</h3>
                    
                    {/* Display selected toppings list beautifully */}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight italic font-medium">
                        + Toppings: {item.selectedToppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    
                    <p className="text-primary font-bold text-sm mt-1">
                      {item.price.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-1.5 bg-neutral-50 border border-border px-1.5 py-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Type Section */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                📋 Hình Thức Nhận Hàng
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-98 ${
                    orderType === 'DELIVERY'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm'
                      : 'border-border bg-neutral-50/50 text-muted-foreground hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-lg">🛵</span>
                  <span>Giao tận nơi (Ship đi)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setOrderType('STORE')}
                  className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-98 ${
                    orderType === 'STORE'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm'
                      : 'border-border bg-neutral-50/50 text-muted-foreground hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-lg">🏠</span>
                  <span>Đến nhận tại quán</span>
                </button>
              </div>
            </div>

            {/* Delivery Address Input Section (Conditional) */}
            {orderType === 'DELIVERY' ? (
              <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    📍 Địa Chỉ Nhận Hàng (Giao Tận Nơi)
                  </h3>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locating}
                    className="text-[10px] font-black text-accent hover:bg-accent/10 border border-accent/20 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {locating ? '⌛ Đang định vị...' : '🎯 Lấy vị trí GPS'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                    rows={2}
                    className="w-full px-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm leading-relaxed"
                    required
                  />
                  
                  {/* Save as default address checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] font-bold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                    />
                    <span>Lưu làm địa chỉ giao hàng mặc định cho lần sau</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF7F2] border border-border p-5 rounded-2xl space-y-2 shadow-sm animate-fade-in flex items-start gap-3">
                <span className="text-xl mt-0.5">🏪</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider">Đến nhận trực tiếp tại cửa hàng</h4>
                  <p className="text-[10.5px] text-muted-foreground font-semibold leading-relaxed">
                    Bạn sẽ nhận nước trực tiếp tại chi nhánh của Chiba. Đơn hàng này <strong>không có phí vận chuyển (0đ)</strong>. Bạn chỉ cần đưa mã đơn hàng cho nhân viên tại quầy khi đến nhận.
                  </p>
                </div>
              </div>
            )}

            {/* Loyalty Points Section */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 text-7xl translate-x-4 -translate-y-4 opacity-5 select-none text-accent">🪙</div>
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <Coins className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                  Chiba Points (Điểm tích lũy)
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Bạn đang có: <span className="text-accent font-black text-sm">{userPoints}</span> điểm</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Trị giá quy đổi: {(userPoints * 500).toLocaleString('vi-VN')}₫ (1 điểm = 500đ)</p>
                  </div>
                  
                  {userPoints > 0 ? (
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => handleTogglePoints(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground bg-neutral-100 border border-border/60 px-2 py-1 rounded">
                      Chưa có điểm
                    </span>
                  )}
                </div>

                {usePoints && userPoints > 0 && (
                  <div className="pt-2 border-t border-dashed border-border/60 space-y-3 animate-fade-in">
                    <p className="text-[10.5px] font-bold text-foreground leading-relaxed">
                      Chọn số điểm muốn dùng để giảm giá (giảm tối đa 20%):
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={pointsToUse <= 0}
                        onClick={() => setPointsToUse(Math.max(0, pointsToUse - 5))}
                        className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        disabled={pointsToUse <= 0}
                        onClick={() => setPointsToUse(Math.max(0, pointsToUse - 1))}
                        className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={maxPointsPossible}
                        value={pointsToUse}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setPointsToUse(Math.max(0, Math.min(val, maxPointsPossible)));
                        }}
                        className="w-20 text-center font-black text-sm bg-neutral-50 border border-border py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        disabled={pointsToUse >= maxPointsPossible}
                        onClick={() => setPointsToUse(Math.min(maxPointsPossible, pointsToUse + 1))}
                        className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        disabled={pointsToUse >= maxPointsPossible}
                        onClick={() => setPointsToUse(Math.min(maxPointsPossible, pointsToUse + 5))}
                        className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => setPointsToUse(maxPointsPossible)}
                        className="text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-2.5 py-2 rounded-lg active:scale-95 transition"
                      >
                        Tối đa
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-border/80 text-[10px] text-accent-foreground font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>
                        Giảm giá áp dụng: <strong>{(pointsToUse * 500).toLocaleString('vi-VN')}₫</strong> (Khấu trừ {pointsToUse} điểm)
                      </span>
                    </div>

                    {maxPointsAllowed < userPoints && (
                      <p className="text-[9.5px] text-muted-foreground font-semibold">
                        🛡️ Đã áp dụng quy tắc bảo vệ lợi nhuận: Giảm tối đa 20% giá trị đơn hàng (giới hạn {maxPointsAllowed} điểm).
                      </p>
                    )}
                  </div>
                )}

                <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-border/80 text-[10px] text-muted-foreground leading-normal">
                  💡 <strong>Quy tắc tích điểm:</strong> Mỗi đơn hàng mua 10.000đ tích lũy 1 điểm. Điểm tích lũy mới được tính dựa trên số tiền thực tế thanh toán sau khi trừ điểm giảm giá.
                </div>
              </div>
            </div>
 
             {/* Billing Summary Box */}
             <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
               <div className="space-y-2 border-b border-border pb-4">
                 <div className="flex justify-between text-xs text-muted-foreground font-medium">
                   <span>Tổng số món:</span>
                   <span>{totalItems} cốc/phần</span>
                 </div>
                 <div className="flex justify-between text-xs text-muted-foreground font-medium">
                   <span>Phí giao hàng:</span>
                   {shippingFee === 0 ? (
                     <span className="text-primary font-bold">
                       {orderType === 'DELIVERY' ? 'Miễn phí (Đơn > 100k) 🎁' : 'Miễn phí (Nhận tại quán) 🎁'}
                     </span>
                   ) : (
                     <span className="text-foreground font-bold">{shippingFee.toLocaleString('vi-VN')}₫</span>
                   )}
                 </div>
                 {usePoints && discountAmount > 0 && (
                   <div className="flex justify-between text-xs text-accent-foreground font-semibold bg-orange-50 border border-orange-100 p-2.5 rounded-xl">
                     <span className="flex items-center gap-1">
                       <Coins className="w-3.5 h-3.5 text-accent" /> Giảm giá bằng điểm ({pointsToUse} điểm):
                     </span>
                     <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                   </div>
                 )}
               </div>
 
               <div className="flex items-center justify-between text-base font-bold text-foreground pt-1">
                 <span>Tổng tiền thanh toán:</span>
                 <span className="text-primary text-2xl tracking-tight">
                   {finalPrice.toLocaleString('vi-VN')}₫
                 </span>
               </div>
 
               {/* Checkout Buttons */}
               <button
                 onClick={handleCheckout}
                 disabled={loading}
                 className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-premium transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
               >
                 {loading ? 'Đang xử lý đặt hàng...' : '✓ Đặt Hàng Ngay'}
               </button>
 
               <button
                 onClick={() => router.push('/home')}
                 className="w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-semibold py-3 rounded-xl transition active:scale-98 text-sm"
               >
                 Quay lại mua thêm nước
               </button>
             </div>
           </div>
         ) : (
           <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
             <div className="text-7xl mb-4 animate-pulse">🛒</div>
             <p className="text-muted-foreground font-bold">Giỏ hàng của bạn đang trống</p>
             <p className="text-xs text-muted-foreground/60 mt-1 max-w-[250px] mx-auto px-4">
               Hãy chọn những món trà, cà phê hay sữa tươi thơm ngon nhất của chúng tôi nhé!
             </p>
             <Link
               href="/home"
               className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm hover:shadow-premium transition active:scale-95 text-sm"
             >
               Chọn Món Ngon Ngay
             </Link>
           </div>
         )}
       </div>
 
       {/* GORGEOUS TRANSACTION SUCCESS MODAL OVERLAY */}
       {showSuccessModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border shadow-modal text-center space-y-6 animate-fade-in">
             <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mx-auto">
               <CheckCircle2 className="w-10 h-10 text-primary" />
             </div>
 
             <div className="space-y-2">
               <h2 className="text-2xl font-black text-primary tracking-tight">Đặt Hàng Thành Công!</h2>
               <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                 Đơn hàng của bạn đã được tiếp nhận và đang tiến hành pha chế tại chi nhánh gần nhất.
               </p>
             </div>
 
             {/* Loyalty points loyalty box */}
             <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2">
               <Sparkles className="w-5 h-5 text-accent animate-spin duration-3000" />
               <span className="text-xs font-bold text-accent-foreground">
                 Bạn đã được tích lũy thêm <strong className="text-sm font-black">+{earnedPoints}</strong> điểm Chiba!
               </span>
             </div>
 
             <button
               onClick={() => {
                 setShowSuccessModal(false);
                 router.push('/home');
               }}
               className="primary-btn mt-4 shadow-premium"
             >
               Đồng ý & Tiếp tục
             </button>
           </div>
         </div>
       )}
     </div>
   );
 }
