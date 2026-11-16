import type { ReactNode } from 'react';
import { PerpusDataProvider } from './_com/PerpusDataProvider';

/**
 * Layout Perpustakaan Digital: katalog buku dimuat sekali di sini (PerpusDataProvider) dan dipakai bersama daftar
 * `/semua`, `/{kategori}`, serta rel "Buku lain" di detail `/{kategori}/{id}`.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return <PerpusDataProvider>{children}</PerpusDataProvider>;
}
