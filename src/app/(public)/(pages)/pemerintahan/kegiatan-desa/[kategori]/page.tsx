import { Suspense } from 'react';
import { KegiatanList } from '../_com/KegiatanList';

/** Daftar kegiatan satu kategori; kategori dibaca KegiatanList dari URL. */
export default function Page() {
  // KegiatanList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KegiatanList />
    </Suspense>
  );
}
