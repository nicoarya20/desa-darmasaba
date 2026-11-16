import { Suspense } from 'react';
import { PerpusKatalog } from '../_com/PerpusKatalog';

/** `/pendidikan/perpustakaan-digital/{kategori}`: katalog satu kategori (slug = nama huruf kecil, spasi → "-"). */
export default async function Page({ params }: { params: Promise<{ kategoriBuku: string }> }) {
  const { kategoriBuku } = await params;
  return (
    <Suspense>
      <PerpusKatalog slugParam={kategoriBuku} />
    </Suspense>
  );
}
