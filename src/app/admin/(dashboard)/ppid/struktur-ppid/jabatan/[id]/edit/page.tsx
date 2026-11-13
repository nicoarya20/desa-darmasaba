'use client'
import { JabatanEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanEditPage';
import { STRUKTUR_PPID_ADMIN } from '../../../_com/struktur-ppid.config';

/** Edit jabatan Struktur PPID (halaman admin bersama). */
export default function Page() {
  return <JabatanEditPage config={STRUKTUR_PPID_ADMIN} />;
}
