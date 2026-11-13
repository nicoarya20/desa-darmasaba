'use client'
import { PegawaiCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiCreatePage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../../_com/struktur-perangkat.config';

/** Tambah perangkat desa (halaman admin bersama). */
export default function Page() {
  return <PegawaiCreatePage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
