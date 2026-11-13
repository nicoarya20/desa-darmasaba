'use client'
import { PegawaiListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiListPage';
import { STRUKTUR_PERANGKAT_ADMIN } from '../_com/struktur-perangkat.config';

/** Tab Pegawai Struktur Perangkat Desa: daftar perangkat desa berpaginasi + cari + filter status. */
export default function Page() {
  return <PegawaiListPage config={STRUKTUR_PERANGKAT_ADMIN} />;
}
