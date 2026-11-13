'use client'
import { BaganPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/BaganPage';
import { STRUKTUR_BUMDES_ADMIN } from '../_com/struktur-bumdes.config';

/** Tab Bagan Struktur BUMDes (halaman admin bersama). */
export default function Page() {
  return <BaganPage config={STRUKTUR_BUMDES_ADMIN} />;
}
