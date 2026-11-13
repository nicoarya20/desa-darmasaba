import { Suspense } from 'react';
import { PencegahanPage } from './_com/PencegahanPage';

/** Program pencegahan kriminalitas desa (tautan navbar Keamanan); juga tujuan redirect `program-lainnya`. */
export default function Page() {
  // PencegahanPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <PencegahanPage />
    </Suspense>
  );
}
