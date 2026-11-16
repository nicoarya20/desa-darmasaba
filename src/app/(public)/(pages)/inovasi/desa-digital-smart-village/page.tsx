import { Suspense } from 'react';
import { DesaDigitalPage } from './_com/DesaDigitalPage';

/** Daftar layanan Desa Digital / Smart Village (tautan navbar Inovasi). */
export default function Page() {
  // DesaDigitalPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <DesaDigitalPage />
    </Suspense>
  );
}
