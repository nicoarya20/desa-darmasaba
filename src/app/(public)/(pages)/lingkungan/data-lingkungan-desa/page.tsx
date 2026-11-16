import { Suspense } from 'react';
import { DataLingkunganPage } from './_com/DataLingkunganPage';

/** Daftar Data Lingkungan Desa (tautan navbar Lingkungan). */
export default function Page() {
  // DataLingkunganPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <DataLingkunganPage />
    </Suspense>
  );
}
