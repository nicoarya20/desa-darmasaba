/**
 * Public Navigation State
 * 
 * State management untuk navigasi public pages (darmasaba)
 * Menggunakan Valtio untuk reactive state
 */

import { proxy } from "valtio";

export const publicNavState = proxy<{
  mobileMenuOpen: boolean;
  activeSection: string | null;
  searchOpen: boolean;
  scrollPosition: number;
  openMenu: () => void;
  closeMenu: () => void;
  setActiveSection: (section: string | null) => void;
  toggleSearch: () => void;
  setScrollPosition: (position: number) => void;
}>({
  mobileMenuOpen: false,
  activeSection: null,
  searchOpen: false,
  scrollPosition: 0,
  
  openMenu() {
    publicNavState.mobileMenuOpen = true;
  },
  
  closeMenu() {
    publicNavState.mobileMenuOpen = false;
  },
  
  setActiveSection(section: string | null) {
    publicNavState.activeSection = section;
  },
  
  toggleSearch() {
    publicNavState.searchOpen = !publicNavState.searchOpen;
  },
  
  setScrollPosition(position: number) {
    publicNavState.scrollPosition = position;
  },
});

// Helper hook untuk React components
export const usePublicNav = () => {
  return publicNavState;
};

export default publicNavState;
