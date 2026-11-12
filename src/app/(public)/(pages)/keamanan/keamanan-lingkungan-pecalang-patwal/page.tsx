import { Suspense } from 'react';
import { KeamananLingkunganPage } from './_com/KeamananLingkunganPage';

/** Daftar keamanan lingkungan desa: Pecalang / Patwal (tautan navbar Keamanan). */
export default function Page() {
  // KeamananLingkunganPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KeamananLingkunganPage />
    </Suspense>
  );
}
