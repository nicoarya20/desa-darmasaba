'use client'
import type { ReactNode } from 'react';
import LayoutTabs from './_lib/layoutTabs';

/** Layout admin BUMDes: tab Profil · Unit Usaha · Pegawai · Jabatan · Bagan. */
export default function Layout({ children }: { children: ReactNode }) {
  return <LayoutTabs>{children}</LayoutTabs>;
}
