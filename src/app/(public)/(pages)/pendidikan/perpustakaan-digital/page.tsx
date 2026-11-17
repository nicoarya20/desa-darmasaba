import type { Metadata } from 'next';
import { PerpusPenghubung } from './_com/PerpusPenghubung';
import { PERPUS_TEXT } from './_com/perpus.text';

export const metadata: Metadata = { title: PERPUS_TEXT.title, description: PERPUS_TEXT.lead };

/**
 * `/pendidikan/perpustakaan-digital`: halaman penghubung ke website perpustakaan desa (Pustaka Ananta Loka).
 * Rute katalog lama (`/semua`, `/{kategori}`, `/{kategori}/{id}`) dialihkan ke sini lewat next.config.ts.
 */
export default function Page() {
  return <PerpusPenghubung />;
}
