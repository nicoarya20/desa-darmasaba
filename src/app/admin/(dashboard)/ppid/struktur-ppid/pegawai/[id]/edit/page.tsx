'use client'
import { PegawaiEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiEditPage';
import { STRUKTUR_PPID_ADMIN } from '../../../_com/struktur-ppid.config';

/** Edit pegawai PPID (halaman admin bersama). */
export default function Page() {
  return <PegawaiEditPage config={STRUKTUR_PPID_ADMIN} />;
}
