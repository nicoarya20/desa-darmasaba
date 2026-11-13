'use client'
import { JabatanCreatePage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanCreatePage';
import { STRUKTUR_BUMDES_ADMIN } from '../../_com/struktur-bumdes.config';

/** Tambah jabatan Struktur BUMDes (halaman admin bersama). */
export default function Page() {
  return <JabatanCreatePage config={STRUKTUR_BUMDES_ADMIN} />;
}
