'use client'
import { JabatanEditPage } from '@/app/admin/(dashboard)/_com/struktur-organisasi/halaman/JabatanEditPage';
import { STRUKTUR_BUMDES_ADMIN } from '../../../_com/struktur-bumdes.config';

/** Edit jabatan Struktur BUMDes (halaman admin bersama). */
export default function Page() {
  return <JabatanEditPage config={STRUKTUR_BUMDES_ADMIN} />;
}
