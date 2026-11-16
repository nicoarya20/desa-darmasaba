import { Suspense } from 'react';
import { LayananOnlinePage } from './_com/LayananOnlinePage';

/** Hub Layanan Online Desa (tautan navbar Inovasi): Administrasi Online, Pengaduan Masyarakat, Informasi Desa. */
export default function Page() {
  // LayananOnlinePage membaca useSearchParams (`?layanan=pengaduan`) → wajib di dalam Suspense.
  return (
    <Suspense>
      <LayananOnlinePage />
    </Suspense>
  );
}
