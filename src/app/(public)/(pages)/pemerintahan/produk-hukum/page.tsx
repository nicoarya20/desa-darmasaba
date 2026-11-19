import { Suspense } from 'react';
import { ProdukHukumPage } from './_com/ProdukHukumPage';

/** Daftar Produk Hukum desa (submenu Pemerintahan; belum ada di navbar, ditambahkan coordinator). */
export default function Page() {
  // ProdukHukumPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <ProdukHukumPage />
    </Suspense>
  );
}
