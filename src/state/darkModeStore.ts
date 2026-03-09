/**
 * Dark Mode State Management
 * 
 * Menggunakan Valtio untuk global state
 * Persist ke localStorage
 * 
 * Usage:
 * import { darkModeStore, useDarkMode } from '@/state/darkModeStore';
 * 
 * // Toggle
 * darkModeStore.toggle();
 * 
 * // Set explicitly
 * darkModeStore.setDarkMode(true);
 * 
 * // Get current state
 * const isDark = darkModeStore.isDark;
 * 
 * // In React components
 * const { isDark, toggle, setDarkMode } = useDarkMode();
 */

import { proxy, useSnapshot } from 'valtio';

const STORAGE_KEY = 'darmasaba-admin-dark-mode';

// Initialize from localStorage or default to light mode
const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }

  // Default to light mode for first-time users
  // System preference is NOT used as default to ensure consistent UX
  return false;
};

class DarkModeStore {
  public isDark: boolean;

  constructor() {
    this.isDark = getInitialDarkMode();
  }

  public toggle() {
    this.isDark = !this.isDark;
    this.persist();
  }

  public setDarkMode(value: boolean) {
    this.isDark = value;
    this.persist();
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(this.isDark));
    }
  }
}

// Create proxy instance
const store = new DarkModeStore();

export const darkModeStore = proxy(store);

// Hook untuk menggunakan dark mode state di React components
export const useDarkMode = () => {
  const snapshot = useSnapshot(darkModeStore);
  return {
    isDark: snapshot.isDark,
    toggle: () => darkModeStore.toggle(),
    setDarkMode: (value: boolean) => darkModeStore.setDarkMode(value),
  };
};

export default darkModeStore;
