'use client'
import { BaganPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/BaganPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../_com/struktur-perangkat.config';

/** Tab Bagan Struktur Perangkat Desa (halaman admin bersama). */
export default function Page() {
  return <BaganPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
