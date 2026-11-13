'use client'
import { JabatanListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanListPage';
import { STRUKTUR_BUMDES_ADMIN } from '../_com/struktur-bumdes.config';

/** Tab Jabatan Struktur BUMDes (halaman admin bersama). */
export default function Page() {
  return <JabatanListPage config={STRUKTUR_BUMDES_ADMIN} />;
}
