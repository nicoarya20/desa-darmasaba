import { Suspense } from 'react';
import { PengumumanList } from '../_com/PengumumanList';

/** Daftar pengumuman satu kategori; kategori dibaca PengumumanList dari URL. */
export default function Page() {
  // PengumumanList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <PengumumanList />
    </Suspense>
  );
}
