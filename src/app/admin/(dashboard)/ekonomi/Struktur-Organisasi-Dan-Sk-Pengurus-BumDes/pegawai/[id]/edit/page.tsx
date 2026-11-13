'use client'
import { PegawaiEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiEditPage';
import { STRUKTUR_BUMDES_ADMIN } from '../../../_com/struktur-bumdes.config';

/** Edit pegawai BUMDes (halaman admin bersama). */
export default function Page() {
  return <PegawaiEditPage config={STRUKTUR_BUMDES_ADMIN} />;
}
