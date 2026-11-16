import { Suspense } from 'react';
import { PerpusKatalog } from '../_com/PerpusKatalog';
import { SEMUA_SLUG } from '../_com/perpus-katalog.logic';

/** `/pendidikan/perpustakaan-digital/semua`: katalog semua kategori. */
export default function Page() {
  return (
    <Suspense>
      <PerpusKatalog slugParam={SEMUA_SLUG} />
    </Suspense>
  );
}
