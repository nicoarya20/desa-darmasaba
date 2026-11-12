import { Suspense } from 'react';
import { KegiatanList } from '../_com/KegiatanList';

/** Daftar semua kegiatan desa (tautan navbar). */
export default function Page() {
  // KegiatanList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KegiatanList />
    </Suspense>
  );
}
