'use client'
import { BaganPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/BaganPage';
import { STRUKTUR_PPID_ADMIN } from '../_com/struktur-ppid.config';

/** Tab Bagan Struktur PPID (halaman admin bersama). */
export default function Page() {
  return <BaganPage config={STRUKTUR_PPID_ADMIN} />;
}
