import { Suspense } from 'react';
import { PengumumanList } from './_com/PengumumanList';

/** Daftar semua pengumuman. */
export default function Page() {
  // PengumumanList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <PengumumanList />
    </Suspense>
  );
}
