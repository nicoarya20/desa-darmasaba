'use client'
import { JabatanListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanListPage';
import { STRUKTUR_PPID_ADMIN } from '../_com/struktur-ppid.config';

/** Tab Jabatan Struktur PPID (halaman admin bersama). */
export default function Page() {
  return <JabatanListPage config={STRUKTUR_PPID_ADMIN} />;
}
