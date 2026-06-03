export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  customerCode: string;
  zenPoints: number;
  role: UserRole;
  isSuspended?: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export type ProductCategory = 'MON_NUOC' | 'TOPPING' | 'BANH';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: ProductCategory;
  isAvailable?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedToppings?: { id: string; name: string; price: number }[];
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  address?: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  pointsUsed?: number;
  discountAmount?: number;
}

export type PointTransactionType = 'EARNED_ORDER' | 'REDEEMED_APP' | 'REDEEMED_STORE' | 'ADMIN_ADJUST';

export interface PointTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  points: number; // Positive for earning, negative for spending/redemption
  pointsBefore: number; // User points before transaction
  pointsAfter: number; // User points after transaction
  type: PointTransactionType;
  description: string;
  createdAt: string;
}

