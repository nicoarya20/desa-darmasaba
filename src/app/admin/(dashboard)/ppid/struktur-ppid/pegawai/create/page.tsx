'use client'
import { PegawaiCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiCreatePage';
import { STRUKTUR_PPID_ADMIN } from '../../_com/struktur-ppid.config';

/** Tambah pegawai PPID (halaman admin bersama). */
export default function Page() {
  return <PegawaiCreatePage config={STRUKTUR_PPID_ADMIN} />;
}
