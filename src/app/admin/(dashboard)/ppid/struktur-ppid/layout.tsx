'use client'
import { StrukturAdminLayout } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/StrukturAdminLayout';
import type { ReactNode } from 'react';
import { STRUKTUR_PPID_ADMIN } from './_com/struktur-ppid.config';

/** Tab Pegawai · Jabatan · Bagan Struktur PPID; halaman tambah/detail/edit tampil tanpa tab. */
export default function Layout({ children }: { children: ReactNode }) {
  return <StrukturAdminLayout config={STRUKTUR_PPID_ADMIN}>{children}</StrukturAdminLayout>;
}
