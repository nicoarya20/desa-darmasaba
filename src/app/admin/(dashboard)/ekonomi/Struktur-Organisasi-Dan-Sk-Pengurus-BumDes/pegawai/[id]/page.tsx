'use client'
import { PegawaiDetailPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiDetailPage';
import { STRUKTUR_BUMDES_ADMIN } from '../../_com/struktur-bumdes.config';

/** Detail pegawai BUMDes (halaman admin bersama). */
export default function Page() {
  return <PegawaiDetailPage config={STRUKTUR_BUMDES_ADMIN} />;
}
