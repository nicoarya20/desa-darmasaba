'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Kepala membaca useSearchParams; dimuat di klien saja (sama dengan halaman Berita).
const PengumumanShell = dynamic(() => import('./_com/PengumumanShell'), { ssr: false });

/**
 * Daftar (`/pengumuman`, `/pengumuman/{kategori}`) dibungkus kepala + pil kategori;
 * detail (`/pengumuman/{kategori}/{id}`) punya kerangka sendiri.
 */
export default function PengumumanLayout({ children }: { children: ReactNode }) {
  const segments = usePathname().split('/').filter(Boolean);
  const isDetail = segments.length - segments.indexOf('pengumuman') > 2;
  return isDetail ? <>{children}</> : <PengumumanShell>{children}</PengumumanShell>;
}
