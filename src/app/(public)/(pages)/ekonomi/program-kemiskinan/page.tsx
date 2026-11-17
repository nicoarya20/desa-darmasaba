import { Suspense } from 'react';
import { ProgramKemiskinanPage } from './_com/ProgramKemiskinanPage';

/** Daftar Program Pengentasan Kemiskinan (tautan navbar Ekonomi & footer "Layanan Sosial"). */
export default function Page() {
  // ProgramKemiskinanPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <ProgramKemiskinanPage />
    </Suspense>
  );
}
