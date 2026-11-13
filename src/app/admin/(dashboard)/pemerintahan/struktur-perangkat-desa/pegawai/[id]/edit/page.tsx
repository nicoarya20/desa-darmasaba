'use client'
import { PegawaiEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiEditPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../../../_com/struktur-perangkat.config';

/** Edit perangkat desa (halaman admin bersama). */
export default function Page() {
  return <PegawaiEditPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
