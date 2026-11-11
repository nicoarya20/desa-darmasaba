import { Suspense } from 'react';
import { BeritaList } from '../_com/BeritaList';

/** Daftar semua berita. */
export default function Page() {
  // BeritaList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <BeritaList />
    </Suspense>
  );
}
