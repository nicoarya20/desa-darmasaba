import { redirect } from 'next/navigation';
import { POLSEK_HREF } from '../_com/polsek.meta';

/**
 * `/keamanan/polsek-terdekat/semua-polsek` dulu memuat daftar berpaginasi; kini semua polsek tampil di halaman
 * utama. Rute dipertahankan sebagai redirect sementara (307, bukan 308 yang di-cache browser) agar tautan lama hidup.
 */
export default function Page() {
  redirect(POLSEK_HREF);
}
