'use client'
import { JabatanCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanCreatePage';
import { STRUKTUR_PPID_ADMIN } from '../../_com/struktur-ppid.config';

/** Tambah jabatan Struktur PPID (halaman admin bersama). */
export default function Page() {
  return <JabatanCreatePage config={STRUKTUR_PPID_ADMIN} />;
}
