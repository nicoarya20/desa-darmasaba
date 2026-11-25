import { useEffect, useRef } from 'react';
import { preferredScrollBehavior } from '@/app/(public)/(pages)/pemerintahan/profil/_com/profil.scroll';
import { TIPS_SECTION_ID } from './tips-keamanan.meta';

/**
 * Alamat `…#tips-keamanan` (redirect menu lama Tips Keamanan, hasil pencarian): gulir ke bagian tips SETELAH program
 * dan tips selesai dimuat. Lompatan anchor bawaan browser terjadi sebelum isi klien ada, lalu posisinya bergeser.
 */
export function useScrollToTips(settled: boolean): void {
  const done = useRef(false);
  useEffect(() => {
    if (!settled || done.current || window.location.hash !== `#${TIPS_SECTION_ID}`) return;
    done.current = true;
    document.getElementById(TIPS_SECTION_ID)?.scrollIntoView({ block: 'start', behavior: preferredScrollBehavior() });
  }, [settled]);
}
