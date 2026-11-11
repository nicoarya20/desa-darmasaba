'use client';
import { KABAR_BRAND_VARS } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.module.css';
import type { ReactNode } from 'react';
import { BeritaHeader } from './BeritaHeader';

/**
 * Kerangka halaman daftar berita. Sengaja memakai `.section` Kabar Desa beranda (latar putih, tepi 24px,
 * variabel warna kartu) supaya kartu berita di beranda dan di halaman ini identik.
 */
export default function BeritaShell({ children }: { children: ReactNode }) {
  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <BeritaHeader />
      {children}
    </div>
  );
}
