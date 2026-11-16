import { Suspense } from 'react';
import { GotongRoyongPage } from './_com/GotongRoyongPage';

/** Daftar Gotong Royong: kegiatan desa kategori Lingkungan + Kebersihan (tautan navbar Lingkungan). */
export default function Page() {
  // GotongRoyongPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <GotongRoyongPage />
    </Suspense>
  );
}
