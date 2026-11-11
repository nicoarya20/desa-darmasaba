import { Suspense } from 'react';
import { BeritaList } from '../_com/BeritaList';

/** Daftar berita satu kategori; kategori dibaca BeritaList dari URL. */
export default function Page() {
  // BeritaList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <BeritaList />
    </Suspense>
  );
}
