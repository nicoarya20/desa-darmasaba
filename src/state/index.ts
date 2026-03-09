/**
 * State Management - Central Exports
 * 
 * Desa Darmasaba menggunakan Valtio untuk global state management.
 * 
 * State dibagi menjadi dua kategori utama:
 * 1. Admin State - Untuk admin dashboard (/admin routes)
 * 2. Public State - Untuk public pages (/darmasaba routes)
 * 
 * Usage:
 * ```typescript
 * // Import admin state
 * import { adminNavState, adminAuthState } from '@/state';
 * 
 * // Import public state
 * import { publicNavState, publicMusicState } from '@/state';
 * 
 * // In React components
 * import { useAdminNav, usePublicMusic } from '@/state';
 * ```
 */

// Admin State
export {
  adminNavState,
  useAdminNav,
  adminAuthState,
  useAdminAuth,
  adminFormState,
  useAdminForm,
  adminKeamananState,
  adminPpidState,
  adminMusikState,
} from './admin';

export type {
  ListItem,
  FileStorageItem,
} from './admin';

// Public State
export {
  publicNavState,
  usePublicNav,
  publicMusicState,
  usePublicMusic,
} from './public';

export type {
  Musik,
} from './public';

// Legacy State (for backward compatibility)
export { darkModeStore, useDarkMode } from './darkModeStore';
export { stateNav } from './state-nav';
export { authStore, type User } from '../store/authStore';
export { stateListImage } from './state-list-image';
export { default as stateLayanan } from './state-layanan';
