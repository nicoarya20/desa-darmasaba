'use client';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import type { ReactNode } from 'react';
import { PengumumanHeader } from './PengumumanHeader';

/**
 * Kerangka halaman daftar pengumuman — `.section` Kabar Desa beranda (latar putih, tepi `--edge-gutter`,
 * variabel warna) supaya senada panel Pengumuman di beranda dan halaman Berita.
 */
export default function PengumumanShell({ children }: { children: ReactNode }) {
  return (
    <div className={kabar.section}>
      <PengumumanHeader />
      {children}
    </div>
  );
}
