import { Suspense } from 'react';
import { PenghijauanPage } from './_com/PenghijauanPage';

/** Daftar Program Penghijauan (tautan navbar Lingkungan). */
export default function Page() {
  // PenghijauanPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <PenghijauanPage />
    </Suspense>
  );
}
