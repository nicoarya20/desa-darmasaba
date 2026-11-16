import { Suspense } from 'react';
import { KolaborasiPage } from './_com/KolaborasiPage';

/** Kolaborasi inovasi desa (dikelompokkan per tahun, deskripsi dibaca di tempat) + dinding logo Mitra Kolaborasi. */
export default function Page() {
  // KolaborasiPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KolaborasiPage />
    </Suspense>
  );
}
