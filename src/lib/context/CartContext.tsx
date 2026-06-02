'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: { id: string; name: string; price: number },
    selectedToppings?: { id: string; name: string; price: number }[],
    quantity?: number
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zen_fb_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate cart from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          setItems(JSON.parse(storedCart));
        } catch (e) {
          console.error('Failed to parse cart items', e);
        }
      }
    }
  }, []);

  // Save cart changes to localStorage
  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  const addItem = (
    product: { id: string; name: string; price: number },
    selectedToppings: { id: string; name: string; price: number }[] = [],
    quantity: number = 1
  ) => {
    const toppingIds = selectedToppings.map((t) => t.id).sort().join('_');
    const cartItemId = toppingIds ? `${product.id}_${toppingIds}` : product.id;

    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = product.price + toppingsPrice;

    const toppingNames = selectedToppings.map((t) => t.name).join(', ');
    const itemName = toppingNames ? `${product.name} (${toppingNames})` : product.name;

    const existingIndex = items.findIndex((item) => item.id === cartItemId);
    if (existingIndex > -1) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      saveCart(newItems);
    } else {
      saveCart([
        ...items,
        {
          id: cartItemId,
          name: itemName,
          price: unitPrice,
          quantity,
          selectedToppings,
        },
      ]);
    }
  };

  const removeItem = (id: string) => {
    saveCart(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const newItems = items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
