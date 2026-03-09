/**
 * Admin Authentication State
 * 
 * State management untuk authentication admin
 * Menggunakan Valtio untuk reactive state
 */

import { proxy } from 'valtio';

export type User = {
  id: string;
  name: string;
  roleId: number;
  menuIds?: string[] | null;
  isActive?: boolean;
};

export const adminAuthState = proxy<{
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}>({
  user: null,
  isAuthenticated: false,
  
  setUser(user: User | null) {
    adminAuthState.user = user;
    adminAuthState.isAuthenticated = !!user;
  },
  
  clearUser() {
    adminAuthState.user = null;
    adminAuthState.isAuthenticated = false;
  },
});

// Helper hook untuk React components
export const useAdminAuth = () => {
  return adminAuthState;
};

export default adminAuthState;
