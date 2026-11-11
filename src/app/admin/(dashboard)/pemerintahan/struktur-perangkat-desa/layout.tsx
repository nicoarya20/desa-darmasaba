'use client'
import { StrukturTabs, type StrukturTab } from '@/app/admin/(dashboard)/_com/struktur-organisasi/StrukturTabs';
import { IconBuildingCommunity, IconHierarchy2, IconUsers } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { STRUKTUR_PERANGKAT_ROUTES as R } from './_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from './_com/struktur-perangkat.text';

const TABS: StrukturTab[] = [
  { label: T.tabs.pegawai, href: R.pegawai, icon: <IconUsers size={18} stroke={1.8} /> },
  { label: T.tabs.jabatan, href: R.jabatan, icon: <IconHierarchy2 size={18} stroke={1.8} /> },
  { label: T.tabs.bagan, href: R.bagan, icon: <IconBuildingCommunity size={18} stroke={1.8} /> },
];

/** Tab Pegawai · Jabatan · Bagan; halaman tambah/detail/edit tampil tanpa tab. */
export default function Layout({ children }: { children: ReactNode }) {
  return <StrukturTabs title={T.title} tabs={TABS}>{children}</StrukturTabs>;
}
