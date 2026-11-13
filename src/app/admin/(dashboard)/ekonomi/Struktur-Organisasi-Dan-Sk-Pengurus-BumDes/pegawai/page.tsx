'use client'
import { PegawaiListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiListPage';
import { STRUKTUR_BUMDES_ADMIN } from '../_com/struktur-bumdes.config';

/** Tab Pegawai Struktur BUMDes: daftar pegawai BUMDes berpaginasi + cari + filter status. */
export default function Page() {
  return <PegawaiListPage config={STRUKTUR_BUMDES_ADMIN} />;
}
