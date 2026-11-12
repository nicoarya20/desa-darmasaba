'use client'
import { PegawaiDetailPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiDetailPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../../_com/struktur-perangkat.config';

/** Detail perangkat desa (halaman admin bersama). */
export default function Page() {
  return <PegawaiDetailPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
