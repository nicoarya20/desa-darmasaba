'use client'
import { PegawaiCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiCreatePage';
import { STRUKTUR_BUMDES_ADMIN } from '../../_com/struktur-bumdes.config';

/** Tambah pegawai BUMDes (halaman admin bersama). */
export default function Page() {
  return <PegawaiCreatePage config={STRUKTUR_BUMDES_ADMIN} />;
}
