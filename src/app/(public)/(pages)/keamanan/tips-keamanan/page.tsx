import { Suspense } from 'react';
import { TipsKeamananPage } from './_com/TipsKeamananPage';

/** Tips keamanan untuk warga (tautan navbar Keamanan); isi tips dibaca langsung tanpa halaman detail. */
export default function Page() {
  // TipsKeamananPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <TipsKeamananPage />
    </Suspense>
  );
}
