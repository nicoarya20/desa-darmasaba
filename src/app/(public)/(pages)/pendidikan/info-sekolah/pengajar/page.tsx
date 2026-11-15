import { Suspense } from 'react';
import { PengajarPage } from '../_com/PengajarPage';

/** Daftar pengajar; jenjang, pencarian, dan halaman dibaca dari URL. */
export default function Page() {
  // useSearchParams (hook query) → wajib di dalam Suspense.
  return (
    <Suspense>
      <PengajarPage />
    </Suspense>
  );
}
