'use client'
import { PegawaiListPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiListPage';
import { STRUKTUR_PPID_ADMIN } from '../_com/struktur-ppid.config';

/** Tab Pegawai Struktur PPID: daftar pegawai PPID berpaginasi + cari + filter status. */
export default function Page() {
  return <PegawaiListPage config={STRUKTUR_PPID_ADMIN} />;
}
