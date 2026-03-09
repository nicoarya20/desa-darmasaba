/**
 * Debug Utility - Expose state to window object for debugging
 * 
 * IMPORTANT: This file MUST be imported in layout.tsx
 * 
 * Usage in browser console:
 * window.publicMusicState
 * window.adminNavState
 * window.adminAuthState
 */

// Import states
import { publicMusicState } from '@/state/public/publicMusicState';
import { adminNavState, adminAuthState } from '@/state/admin';

// Immediate execution when module loads
console.log('%c🔧 [DebugState] Module loaded!', 'color: #10B981; font-weight: bold; font-size: 12px;');

// Expose states to window object for debugging
if (typeof window !== 'undefined') {
  // Expose states
  (window as any).publicMusicState = publicMusicState;
  (window as any).adminNavState = adminNavState;
  (window as any).adminAuthState = adminAuthState;

  // Also expose helper functions
  (window as any).getMusicState = () => {
    console.log('🎵 Music State:', publicMusicState);
    return publicMusicState;
  };
  (window as any).getAdminNavState = () => adminNavState;
  (window as any).getAdminAuthState = () => adminAuthState;

  console.log('%c✅ [DebugState] State exposed to window object:', 'color: #3B82F6; font-weight: bold; font-size: 12px;');
  console.log('   • window.publicMusicState');
  console.log('   • window.adminNavState');
  console.log('   • window.adminAuthState');
  console.log('   • window.getMusicState()');
  
  // Verify exposure
  setTimeout(() => {
    console.log('%c🔍 [DebugState] Verification:', 'color: #8B5CF6; font-weight: bold; font-size: 12px;');
    console.log('   window.publicMusicState exists?', !!(window as any).publicMusicState);
    console.log('   window.adminNavState exists?', !!(window as any).adminNavState);
    console.log('   window.adminAuthState exists?', !!(window as any).adminAuthState);
  }, 100);
}

export default function DebugState() {
  return null; // This is just a utility, no UI
}
