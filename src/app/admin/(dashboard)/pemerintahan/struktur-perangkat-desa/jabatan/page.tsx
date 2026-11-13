'use client'
import { JabatanListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanListPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../_com/struktur-perangkat.config';

/** Tab Jabatan Struktur Perangkat Desa (halaman admin bersama). */
export default function Page() {
  return <JabatanListPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
