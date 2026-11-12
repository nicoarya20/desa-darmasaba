'use client'
import { StrukturAdminLayout } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/StrukturAdminLayout';
import type { ReactNode } from 'react';
import { STRUKTUR_PERANGKAT_ADMIN } from './_com/struktur-perangkat.config';

/** Tab Pegawai · Jabatan · Bagan Struktur Perangkat Desa; halaman tambah/detail/edit tampil tanpa tab. */
export default function Layout({ children }: { children: ReactNode }) {
  return <StrukturAdminLayout config={STRUKTUR_PERANGKAT_ADMIN}>{children}</StrukturAdminLayout>;
}
