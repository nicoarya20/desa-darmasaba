import { Suspense } from 'react';
import { ProgramKesehatanPage } from './_com/ProgramKesehatanPage';

/** Daftar program kesehatan desa (tautan navbar Kesehatan). */
export default function Page() {
  // ProgramKesehatanPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <ProgramKesehatanPage />
    </Suspense>
  );
}
