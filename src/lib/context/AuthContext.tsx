'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  invitedStaffEmails: string[];
  activeStaffList: User[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfileName: (fullName: string) => Promise<void>;
  updateProfilePhone: (phone: string) => Promise<void>;
  updateProfileAddress: (address: string) => Promise<void>;
  deleteAccount: (action: 'SUSPEND' | 'DELETE') => Promise<void>;
  inviteStaff: (email: string) => Promise<void>;
  revokeInvitation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Seed local simulated users
const MOCK_USERS_KEY = 'zen_fb_mock_users';
const CURRENT_USER_KEY = 'zen_fb_current_user';
const TOKEN_KEY = 'zen_fb_token';

const DEFAULT_USERS: Record<string, any> = {
  'user@chiba.com': {
    id: 'user_1',
    email: 'user@chiba.com',
    password: '123456',
    fullName: 'Noname',
    phone: '0831111111',
    address: '123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
    customerCode: 'Z00047837',
    zenPoints: 0,
    role: 'CUSTOMER',
    isSuspended: false,
  },
  'staff@chiba.com': {
    id: 'staff_1',
    email: 'staff@chiba.com',
    password: '123456',
    fullName: 'Trần Nhân Viên',
    phone: '0912345678',
    address: '456 Đường Lê Lợi, Quận 1, TP. HCM',
    customerCode: 'Z00000002',
    zenPoints: 10,
    role: 'STAFF',
    isSuspended: false,
  },
  'admin@chiba.com': {
    id: 'admin_1',
    email: 'admin@chiba.com',
    password: '123456',
    fullName: 'Quản Trị Viên',
    phone: '0988446746',
    address: '789 Đường Nguyễn Huệ, Quận 1, TP. HCM',
    customerCode: 'Z00000001',
    zenPoints: 120,
    role: 'ADMIN',
    isSuspended: false,
  }
};

const STAFF_INVITES_KEY = 'zen_fb_invited_staff';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitedStaffEmails, setInvitedStaffEmails] = useState<string[]>([]);
  const [activeStaffList, setActiveStaffList] = useState<User[]>([]);

  // Initialize Auth State from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Setup mock users list if not exists
      if (!localStorage.getItem(MOCK_USERS_KEY)) {
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }

      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      // Load invitations
      const storedInvites = localStorage.getItem(STAFF_INVITES_KEY);
      if (storedInvites) {
        setInvitedStaffEmails(JSON.parse(storedInvites));
      } else {
        localStorage.setItem(STAFF_INVITES_KEY, JSON.stringify([]));
      }

      // Load active staff list
      const data = localStorage.getItem(MOCK_USERS_KEY);
      const allUsers = data ? JSON.parse(data) : DEFAULT_USERS;
      const activeStaff = Object.values(allUsers)
        .filter((u: any) => u.role === 'STAFF')
        .map(({ password, ...safeUser }: any) => safeUser as User);
      setActiveStaffList(activeStaff);

      setLoading(false);
    }
  }, []);

  const getMockUsers = (): Record<string, any> => {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const data = localStorage.getItem(MOCK_USERS_KEY);
    return data ? JSON.parse(data) : DEFAULT_USERS;
  };

  const saveMockUsers = (users: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Mimic database call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getMockUsers();
    const foundUser = users[email.toLowerCase().trim()];

    if (!foundUser || foundUser.password !== password) {
      setLoading(false);
      throw new Error('Sai tài khoản hoặc mật khẩu');
    }

    if (foundUser.isSuspended) {
      setLoading(false);
      throw new Error('Tài khoản này đang tạm ngưng hoạt động');
    }

    const { password: _, ...safeUser } = foundUser;
    const mockToken = `mock_jwt_token_${foundUser.id}_${Date.now()}`;

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(TOKEN_KEY, mockToken);

    setUser(safeUser as User);
    setToken(mockToken);
    setLoading(false);
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getMockUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      setLoading(false);
      throw new Error('Email đã được đăng ký trên hệ thống');
    }

    // Check if email has been invited to be a STAFF
    const invites = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem(STAFF_INVITES_KEY) || '[]') 
      : [];
    const isInvited = invites.includes(normalizedEmail);
    const role = isInvited ? 'STAFF' : 'CUSTOMER';

    // Generate random customer code and phone number
    const randomCode = 'Z00' + Math.floor(100000 + Math.random() * 900000);
    const mockUser = {
      id: `user_${Date.now()}`,
      email: normalizedEmail,
      password,
      fullName: fullName.trim() || (role === 'STAFF' ? 'Nhân Viên Chiba' : 'Khách Hàng Chiba'),
      phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
      customerCode: randomCode,
      zenPoints: role === 'STAFF' ? 10 : 0, // Staff starts with default 10 points
      role,
      isSuspended: false,
    };

    // Save to simulated database
    users[normalizedEmail] = mockUser;
    saveMockUsers(users);

    // If was invited, remove from invite list
    if (isInvited) {
      const remainingInvites = invites.filter((e: string) => e !== normalizedEmail);
      localStorage.setItem(STAFF_INVITES_KEY, JSON.stringify(remainingInvites));
      setInvitedStaffEmails(remainingInvites);

      // Refresh active staff list
      const activeStaff = Object.values(users)
        .filter((u: any) => u.role === 'STAFF')
        .map(({ password: _, ...safeUser }: any) => safeUser as User);
      setActiveStaffList(activeStaff);
    }

    const { password: _, ...safeUser } = mockUser;
    const mockToken = `mock_jwt_token_${mockUser.id}_${Date.now()}`;

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(TOKEN_KEY, mockToken);

    setUser(safeUser as User);
    setToken(mockToken);
    setLoading(false);
  };

  const inviteStaff = async (email: string) => {
    const normalized = email.toLowerCase().trim();
    if (!normalized) return;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const invites = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem(STAFF_INVITES_KEY) || '[]')
      : [];
    
    if (invites.includes(normalized)) {
      throw new Error('Email này đã nằm trong danh sách được mời');
    }

    const users = getMockUsers();
    if (users[normalized]) {
      throw new Error('Email này đã được đăng ký tài khoản trên hệ thống');
    }

    const newInvites = [...invites, normalized];
    localStorage.setItem(STAFF_INVITES_KEY, JSON.stringify(newInvites));
    setInvitedStaffEmails(newInvites);
  };

  const revokeInvitation = async (email: string) => {
    const normalized = email.toLowerCase().trim();
    await new Promise((resolve) => setTimeout(resolve, 400));

    const invites = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem(STAFF_INVITES_KEY) || '[]')
      : [];
    
    const newInvites = invites.filter((e: string) => e !== normalized);
    localStorage.setItem(STAFF_INVITES_KEY, JSON.stringify(newInvites));
    setInvitedStaffEmails(newInvites);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const updateProfileName = async (fullName: string) => {
    if (!user) throw new Error('Chưa đăng nhập');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getMockUsers();
    const normalizedEmail = user.email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      users[normalizedEmail].fullName = fullName.trim();
      saveMockUsers(users);

      const updatedUser = { ...user, fullName: fullName.trim() };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const updateProfilePhone = async (phone: string) => {
    if (!user) throw new Error('Chưa đăng nhập');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getMockUsers();
    const normalizedEmail = user.email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      users[normalizedEmail].phone = phone.trim();
      saveMockUsers(users);

      const updatedUser = { ...user, phone: phone.trim() };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const updateProfileAddress = async (address: string) => {
    if (!user) throw new Error('Chưa đăng nhập');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getMockUsers();
    const normalizedEmail = user.email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      users[normalizedEmail].address = address.trim();
      saveMockUsers(users);

      const updatedUser = { ...user, address: address.trim() };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const deleteAccount = async (action: 'SUSPEND' | 'DELETE') => {
    if (!user) throw new Error('Chưa đăng nhập');
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getMockUsers();
    const normalizedEmail = user.email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      if (action === 'SUSPEND') {
        users[normalizedEmail].isSuspended = true;
        saveMockUsers(users);
      } else {
        delete users[normalizedEmail];
        saveMockUsers(users);
      }
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        invitedStaffEmails,
        activeStaffList,
        login,
        register,
        logout,
        updateProfileName,
        updateProfilePhone,
        updateProfileAddress,
        deleteAccount,
        inviteStaff,
        revokeInvitation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
