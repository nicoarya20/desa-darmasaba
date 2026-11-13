import { Suspense } from 'react';
import { LaporanPublikPage } from './_com/LaporanPublikPage';

/** Daftar laporan publik keamanan lingkungan + formulir Tambah Laporan (tautan navbar Keamanan). */
export default function Page() {
  // LaporanPublikPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <LaporanPublikPage />
    </Suspense>
  );
}
