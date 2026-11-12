'use client'
import { JabatanEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanEditPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../../../_com/struktur-perangkat.config';

/** Edit jabatan Struktur Perangkat Desa (halaman admin bersama). */
export default function Page() {
  return <JabatanEditPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
