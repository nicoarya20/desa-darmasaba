import { redirect } from 'next/navigation';
import { PENGADUAN_HUB_HREF } from '../_com/layanan-online.meta';

/**
 * Route lama (masih ditaut cari global & Jenna): dialihkan 307 ke hub yang langsung membuka formulir pengaduan.
 * Formulirnya modal bersama `PengaduanMasyarakatModal` (juga dipakai Footer & beranda), jadi tidak punya halaman sendiri.
 */
export default function Page() {
  redirect(PENGADUAN_HUB_HREF);
}
