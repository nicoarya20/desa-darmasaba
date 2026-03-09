/**
 * Admin Navigation State
 * 
 * State management untuk navigasi admin dashboard
 * Menggunakan Valtio untuk reactive state
 */

import { proxy } from "valtio";
import type { MenuItem } from "../../../types/menu-item";

export const adminNavState = proxy<{
  hover: boolean;
  item: MenuItem[] | null;
  isSearch: boolean;
  module: string | null;
  mobileOpen: boolean;
  clear: () => void;
  setModule: (module: string | null) => void;
  toggleMobile: () => void;
}>({
  hover: false,
  item: null,
  isSearch: false,
  module: null,
  mobileOpen: false,
  
  clear() {
    adminNavState.hover = false;
    adminNavState.item = null;
    adminNavState.isSearch = false;
  },
  
  setModule(module: string | null) {
    adminNavState.module = module;
  },
  
  toggleMobile() {
    adminNavState.mobileOpen = !adminNavState.mobileOpen;
  },
});

// Helper hook untuk React components
export const useAdminNav = () => {
  return adminNavState;
};

export default adminNavState;
