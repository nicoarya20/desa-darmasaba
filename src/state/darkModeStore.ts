/**
 * Dark Mode State Management
 * 
 * Menggunakan Valtio untuk global state
 * Persist ke localStorage
 * 
 * Usage:
 * import { darkModeStore } from '@/state/darkModeStore';
 * 
 * // Toggle
 * darkModeStore.toggle();
 * 
 * // Set explicitly
 * darkModeStore.setDarkMode(true);
 * 
 * // Get current state
 * const isDark = darkModeStore.isDark;
 */

import { proxy, useSnapshot } from 'valtio';

const STORAGE_KEY = 'darmasaba-admin-dark-mode';

// Initialize from localStorage or system preference
const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  
  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
