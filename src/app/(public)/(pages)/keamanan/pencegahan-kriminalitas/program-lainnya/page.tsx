import { redirect } from 'next/navigation';
import { PENCEGAHAN_BASE_HREF } from '../_com/pencegahan.meta';

/**
 * URL lama "Jelajahi Program Lainnya": daftar program kini menyatu di halaman utama (sorotan + kartu + cari).
 * Tetap hidup sebagai redirect 307 (bukan permanen, disetujui orchestrator 2026-11-12) agar tautan tersimpan tidak 404.
 */
export default function Page() {
  redirect(PENCEGAHAN_BASE_HREF);
}
