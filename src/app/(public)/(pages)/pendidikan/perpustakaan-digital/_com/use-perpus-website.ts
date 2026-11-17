'use client';
import { useEffect, useState } from 'react';
import type { PerpusWebsiteState } from './perpus-website.logic';
import { loadPerpusWebsite } from './perpus-website.source';

/** Muat pengaturan halaman penghubung sekali saat mount. */
export function usePerpusWebsite(): PerpusWebsiteState {
  const [state, setState] = useState<PerpusWebsiteState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loadPerpusWebsite()
      .then((data) => {
        if (active) setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        console.error('Halaman Perpustakaan Digital:', error);
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
