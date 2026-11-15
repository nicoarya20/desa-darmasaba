'use client';
import { useLazyLoad, type LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { createContext, useContext, type ReactNode } from 'react';
import { loadKatalogBuku } from './perpus.source';
import type { Buku } from './perpus.types';

type PerpusData = { state: LoadState<Buku[]>; retry: () => void };

const PerpusDataContext = createContext<PerpusData | null>(null);

/**
 * Katalog buku dimuat sekali di layout dan dipakai bersama daftar (semua/kategori) serta rel "Buku lain" di detail,
 * jadi pindah pil kategori tidak memuat ulang data maupun menampilkan kerangka lagi.
 */
export function PerpusDataProvider({ children }: { children: ReactNode }) {
  const value = useLazyLoad(loadKatalogBuku, true, 'katalog perpustakaan digital');
  return <PerpusDataContext.Provider value={value}>{children}</PerpusDataContext.Provider>;
}

/** Data katalog dari PerpusDataProvider; di luar provider → Error (salah pasang layout). */
export function usePerpusData(): PerpusData {
  const value = useContext(PerpusDataContext);
  if (!value) throw new Error('usePerpusData dipakai di luar PerpusDataProvider (layout perpustakaan-digital).');
  return value;
}
