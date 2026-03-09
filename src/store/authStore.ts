/**
 * DEPRECATED: File ini dipertahankan untuk backward compatibility.
 * Gunakan `import { adminAuthState } from '@/state/admin/adminAuthState'` untuk state management baru.
 */

import { adminAuthState } from '../state/admin/adminAuthState';

// Re-export untuk backward compatibility
export const authStore = adminAuthState;
export default authStore;

// Re-export types
export type { User } from '../state/admin/adminAuthState';