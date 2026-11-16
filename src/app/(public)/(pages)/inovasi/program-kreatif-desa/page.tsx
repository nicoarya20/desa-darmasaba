import { Suspense } from 'react';
import { ProgramKreatifPage } from './_com/ProgramKreatifPage';

/** Daftar Program Kreatif Desa (tautan navbar Inovasi). */
export default function Page() {
  // ProgramKreatifPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <ProgramKreatifPage />
    </Suspense>
  );
}
