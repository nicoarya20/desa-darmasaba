import { BERITA_LIST_HREF } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import { redirect } from 'next/navigation';

/**
 * Informasi Desa lama dialihkan 307 ke daftar Berita (keputusan user 2026-11-16): berita & pengumuman sudah punya
 * halaman sendiri; hub Layanan Online menaut keduanya. Route dipertahankan karena masih ditaut cari global.
 */
export default function Page() {
  redirect(BERITA_LIST_HREF);
}
