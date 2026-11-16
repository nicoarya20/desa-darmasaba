import { Suspense } from 'react';
import { InfoTtgPage } from './_com/InfoTtgPage';

/** Info teknologi tepat guna desa (menu Inovasi); isi tiap entri dibaca langsung tanpa halaman detail. */
export default function Page() {
  // InfoTtgPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <InfoTtgPage />
    </Suspense>
  );
}
