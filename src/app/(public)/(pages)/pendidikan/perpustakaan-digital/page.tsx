import { PerpusPenghubung } from './_com/PerpusPenghubung';

/**
 * `/pendidikan/perpustakaan-digital`: halaman penghubung ke website perpustakaan desa (Pustaka Ananta Loka).
 * Rute katalog lama (`/semua`, `/{kategori}`, `/{kategori}/{id}`) dialihkan ke sini lewat next.config.ts.
 */
export default function Page() {
  return <PerpusPenghubung />;
}
