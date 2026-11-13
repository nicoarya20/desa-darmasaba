'use client'
import { strukturTabs } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/StrukturAdminLayout';
import { StrukturTabs, type StrukturTab } from '@/app/admin/(dashboard)/_com/struktur-organisasi/StrukturTabs';
import { IconBuildingStore, IconId } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { STRUKTUR_BUMDES_ADMIN } from '../_com/struktur-bumdes.config';
import { BUMDES_ADMIN_BASE } from '../_com/struktur-bumdes.routes';

/** Tab admin BUMDes: Profil BUMDes · Unit Usaha, lalu tab struktur bersama Pegawai · Jabatan · Bagan. */
export const BUMDES_TABS: StrukturTab[] = [
  { label: 'Profil BUMDes', href: `${BUMDES_ADMIN_BASE}/profil`, icon: <IconId size={18} stroke={1.8} /> },
  { label: 'Unit Usaha', href: `${BUMDES_ADMIN_BASE}/unit-usaha`, icon: <IconBuildingStore size={18} stroke={1.8} /> },
  ...strukturTabs(STRUKTUR_BUMDES_ADMIN),
];

/** Kerangka tab admin BUMDes; halaman tambah/detail/edit (di luar tab) tampil tanpa baris tab. */
function LayoutTabs({ children }: { children: ReactNode }) {
  return <StrukturTabs title={STRUKTUR_BUMDES_ADMIN.text.title} tabs={BUMDES_TABS}>{children}</StrukturTabs>;
}

export default LayoutTabs;
