'use client';

/**
 * Debug State Component - Expose state to window object for debugging
 * 
 * Usage in browser console:
 * window.publicMusicState
 * window.adminNavState
 * window.adminAuthState
 */

import { useEffect } from 'react';
import { publicMusicState } from '@/state/public/publicMusicState';
import { adminNavState, adminAuthState } from '@/state/admin';

export default function DebugStateProvider() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose states
      (window as any).publicMusicState = publicMusicState;
      (window as any).adminNavState = adminNavState;
      (window as any).adminAuthState = adminAuthState;

      console.log('%c✅ [Debug] State exposed to window:', 'color: #3B82F6; font-weight: bold;');
      console.log('  • window.publicMusicState');
      console.log('  • window.adminNavState');
      console.log('  • window.adminAuthState');
      console.log('  💡 Type "window.publicMusicState" in console to check state');
    }
  }, []);

  return null; // No UI, just side effects
}
