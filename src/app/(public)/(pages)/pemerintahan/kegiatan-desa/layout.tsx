'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Kepala membaca useSearchParams; dimuat di klien saja (sama dengan halaman Berita & Pengumuman).
const KegiatanShell = dynamic(() => import('./_com/KegiatanShell'), { ssr: false });

/**
 * Daftar (`/kegiatan-desa/semua`, `/kegiatan-desa/{kategori}`) dibungkus kepala + pil kategori;
 * detail (`/kegiatan-desa/{kategori}/{id}`) punya kerangka sendiri.
 */
export default function KegiatanDesaLayout({ children }: { children: ReactNode }) {
  const segments = usePathname().split('/').filter(Boolean);
  const isDetail = segments.length - segments.indexOf('kegiatan-desa') > 2;
  return isDetail ? <>{children}</> : <KegiatanShell>{children}</KegiatanShell>;
}
