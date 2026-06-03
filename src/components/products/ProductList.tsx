'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { Product, ProductCategory } from '@/types';
import { Search, Plus, ShoppingCart, Sparkles, X } from 'lucide-react';

export const MOCK_PRODUCTS: Product[] = [
  // MÓN NƯỚC (Highlands Coffee & Bubble Tea Style)
  { id: 'p1', name: 'Trà Thanh Đào Highlands', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p2', name: 'Trà Thạch Sen Bùi Thơm', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p3', name: 'Trà Thạch Vải Dai Ngọt', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p4', name: 'Phin Sữa Đá Đậm Đà', price: 35000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p5', name: 'Phin Đen Đá Nguyên Bản', price: 29000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p6', name: 'Freeze Trà Xanh Thạch Vy', price: 55000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p7', name: 'Trà Sữa Thốt Nốt ZEN', price: 54000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p8', name: 'Trà Sữa Trân Châu Hoàng Kim', price: 48000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p9', name: 'Trà Xanh Đậu Đỏ Phố Cổ', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p10', name: 'Freeze Sô-cô-la Bông Kem', price: 55000, category: 'MON_NUOC', isAvailable: true },

  // TOPPING NƯỚC (BÁN RIÊNG)
  { id: 't1', name: 'Thạch Đào Giòn Sần Sật', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't2', name: 'Thạch Sen Thơm Bùi', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't3', name: 'Trân Châu Hoàng Kim', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't4', name: 'Kem Phô Mai Macchiato Béo', price: 15000, category: 'TOPPING', isAvailable: true },

  // BÁNH & ĐỒ ĂN KÈM (Highlands Style)
  { id: 'b1', name: 'Bánh Mì Que Pate Xá Xíu', price: 29000, category: 'BANH', isAvailable: true },
  { id: 'b2', name: 'Bánh Mì Que Gà Phô Mai', price: 29000, category: 'BANH', isAvailable: true },
  { id: 'b3', name: 'Bánh Chuối Nướng Truyền Thống', price: 35000, category: 'BANH', isAvailable: true },
  { id: 'b4', name: 'Bánh Tiramisu Highlands Mềm', price: 39000, category: 'BANH', isAvailable: true },
  { id: 'b5', name: 'Bánh Caramel Phô Mai Ngọt Ngào', price: 39000, category: 'BANH', isAvailable: true }
];

export default function ProductList() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('MON_NUOC');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // States for toppings integration modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Product[]>([]);
  const [drinkQuantity, setDrinkQuantity] = useState(1);

  const categories: { key: ProductCategory; label: string }[] = [
    { key: 'MON_NUOC', label: 'Món Nước' },
    { key: 'TOPPING', label: 'Topping Nước (Bán riêng)' },
    { key: 'BANH', label: 'Bánh & Đồ Ăn Kèm' }
  ];

  // Optimize filter calculation using useMemo (Caching filter results)
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(
      (product) =>
        product.category === activeCategory &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  // Cache available toppings list for better rendering performance
  const availableToppings = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => product.category === 'TOPPING');
  }, []);

  const triggerToast = (name: string) => {
    setAddedItemName(name);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2000);
  };

  const handleAddToCart = (product: Product) => {
    if (product.category === 'MON_NUOC') {
      setSelectedProduct(product);
      setSelectedToppings([]);
      setDrinkQuantity(1);
    } else {
      addItem({ id: product.id, name: product.name, price: product.price });
      triggerToast(product.name);
    }
  };

  const handleToggleTopping = (topping: Product) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirmToppings = () => {
    if (!selectedProduct) return;

    addItem(
      { id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price },
      selectedToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
      drinkQuantity
    );

    const toppingNames = selectedToppings.map((t) => t.name).join(', ');
    const toastName = toppingNames ? `${selectedProduct.name} (+Topping)` : selectedProduct.name;
    triggerToast(toastName);

    // Reset and close
    setSelectedProduct(null);
    setSelectedToppings([]);
    setDrinkQuantity(1);
  };

  // Dynamic price calculation with useMemo caching
  const currentTotalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return (selectedProduct.price + toppingsPrice) * drinkQuantity;
  }, [selectedProduct, selectedToppings, drinkQuantity]);

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Tìm trà, cà phê hay món bánh..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Categories Horizontal Scroll Bar */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-2 pb-px -mx-4 px-4 sticky top-[66px] bg-background/95 backdrop-blur-md z-30 py-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSearchQuery('');
              }}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted/20'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Visual Toast Notification on Addition */}
      {addedItemName && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white text-xs px-4 py-3 rounded-full shadow-floating flex items-center gap-2 animate-fade-in whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Đã thêm <span className="font-bold text-accent">{addedItemName}</span> vào giỏ hàng!
        </div>
      )}

      {/* Dynamic Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card cursor-pointer select-none"
            >
              {/* Product Thumbnail/Icon */}
              <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                {product.category === 'MON_NUOC' ? '☕' : product.category === 'TOPPING' ? '🥛' : '🍰'}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight truncate sm:whitespace-normal">
                  {product.name}
                </h3>
                <p className="text-primary font-bold text-sm mt-1">
                  {product.price.toLocaleString('vi-VN')} đ
                </p>
              </div>

              {/* Add/Configure Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-hover active:scale-90 text-white rounded-full transition-all duration-200 shadow-sm"
                title={product.category === 'MON_NUOC' ? 'Tùy chọn món' : 'Thêm vào giỏ'}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="font-semibold text-foreground">Không tìm thấy món</h3>
          <p className="text-sm text-muted-foreground mt-1 px-4">
            Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục khác.
          </p>
        </div>
      )}

      {/* PREMIUM TOPPING SELECTION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md sm:rounded-2xl border-t sm:border border-border shadow-modal overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] rounded-t-2xl animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-start justify-between bg-[#FAF7F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-2xl rounded-xl">☕</div>
                <div>
                  <h3 className="font-black text-foreground text-base tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-primary font-extrabold mt-0.5">
                    Đơn giá: {selectedProduct.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 hover:bg-neutral-100 border border-border/80 text-muted-foreground rounded-full active:scale-90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable Topping List) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-grow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Thêm Topping Highlands
                </span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Đã chọn: {selectedToppings.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {availableToppings.map((topping) => {
                  const isChecked = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <div
                      key={topping.id}
                      onClick={() => handleToggleTopping(topping)}
                      className={`flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                        isChecked 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom Animated Checkbox */}
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-white border-border text-transparent'
                        }`}>
                          ✓
                        </div>
                        <span className="text-xs font-bold text-foreground">{topping.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-primary">
                        +{topping.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer (Quantity Selector & Fulfill action) */}
            <div className="p-5 border-t border-border bg-[#FAF7F5] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Số lượng cốc:</span>
                
                {/* Micro-interactive Counter */}
                <div className="flex items-center gap-2 bg-white border border-border px-2 py-1 rounded-xl shadow-sm">
                  <button
                    onClick={() => setDrinkQuantity(Math.max(1, drinkQuantity - 1))}
                    className="w-7 h-7 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-lg font-bold transition active:scale-90"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-black text-sm text-foreground">{drinkQuantity}</span>
                  <button
                    onClick={() => setDrinkQuantity(drinkQuantity + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-lg font-bold transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleConfirmToppings}
                className="primary-btn flex items-center justify-center gap-2 shadow-premium font-black py-4 w-full"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                Thêm Vào Giỏ — {currentTotalPrice.toLocaleString('vi-VN')} đ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
