'use client'
import { JabatanCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanCreatePage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../../_com/struktur-perangkat.config';

/** Tambah jabatan Struktur Perangkat Desa (halaman admin bersama). */
export default function Page() {
  return <JabatanCreatePage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
