'use client';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import type { ReactNode } from 'react';
import { KegiatanHeader } from './KegiatanHeader';

/**
 * Kerangka halaman daftar kegiatan — `.section` Kabar Desa beranda (latar putih, tepi `--edge-gutter`,
 * variabel warna kartu) supaya kartu kegiatan identik dengan kartu halaman Berita.
 */
export default function KegiatanShell({ children }: { children: ReactNode }) {
  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KegiatanHeader />
      {children}
    </div>
  );
}
