'use client'
import { PegawaiDetailPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/PegawaiDetailPage';
import { STRUKTUR_PPID_ADMIN } from '../../_com/struktur-ppid.config';

/** Detail pegawai PPID (halaman admin bersama). */
export default function Page() {
  return <PegawaiDetailPage config={STRUKTUR_PPID_ADMIN} />;
}
