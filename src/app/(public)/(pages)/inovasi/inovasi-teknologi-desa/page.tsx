import { Suspense } from 'react';
import { InovasiTeknologiPage } from './_com/InovasiTeknologiPage';

/** Daftar Inovasi Teknologi Desa (tautan navbar Inovasi). */
export default function Page() {
  // InovasiTeknologiPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <InovasiTeknologiPage />
    </Suspense>
  );
}
