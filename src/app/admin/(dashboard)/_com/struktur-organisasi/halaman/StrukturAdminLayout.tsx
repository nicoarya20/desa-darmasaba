'use client'
import { IconBuildingCommunity, IconHierarchy2, IconUsers } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { StrukturTabs, type StrukturTab } from '../StrukturTabs';

/** Tab Pegawai · Jabatan · Bagan satu struktur; dipakai juga modul yang punya tab tambahan (BUMDes). */
export function strukturTabs(config: StrukturAdminConfig): StrukturTab[] {
  const { routes: R, text: T } = config;
  return [
    { label: T.tabs.pegawai, href: R.pegawai, icon: <IconUsers size={18} stroke={1.8} /> },
    { label: T.tabs.jabatan, href: R.jabatan, icon: <IconHierarchy2 size={18} stroke={1.8} /> },
    { label: T.tabs.bagan, href: R.bagan, icon: <IconBuildingCommunity size={18} stroke={1.8} /> },
  ];
}

/** Kerangka layout admin struktur: tab Pegawai · Jabatan · Bagan; halaman tambah/detail/edit tampil tanpa tab. */
export function StrukturAdminLayout({ config, children }: { config: StrukturAdminConfig; children: ReactNode }) {
  return <StrukturTabs title={config.text.title} tabs={strukturTabs(config)}>{children}</StrukturTabs>;
}
