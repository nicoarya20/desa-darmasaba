/**
 * DEPRECATED: File ini dipertahankan untuk backward compatibility.
 * Gunakan `import { adminNavState } from '@/state/admin/adminNavState'` untuk state management baru.
 */

import { adminNavState } from './admin/adminNavState';

// Re-export untuk backward compatibility
export const stateNav = adminNavState;
export default stateNav;