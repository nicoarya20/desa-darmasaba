'use client';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { KatalogEmpty } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogEmpty';
import { BukuCard } from './BukuCard';
import s from './perpus-katalog.module.css';
import { daftarBuku, namaKategori } from './perpus-katalog.logic';
import { PERPUS_SKELETON_COUNT, type PerpusUrut } from './perpus.meta';
import { PERPUS_TEXT as T } from './perpus.text';
import type { Buku } from './perpus.types';
import { PerpusToolbar } from './PerpusToolbar';

type Props = {
  state: LoadState<Buku[]>;
  slug: string;
  search: string;
  urut: PerpusUrut;
  onUrut: (urut: PerpusUrut) => void;
  onClearSearch: () => void;
  onRetry: () => void;
};

/** Badan katalog: kerangka saat memuat, galat + coba lagi, kosong (data/kategori/cari), atau baris alat + grid. */
export function PerpusDaftar({ state, slug, search, urut, onUrut, onClearSearch, onRetry }: Props) {
  if (state.status === 'error') {
    return (
      <div role="alert">
        <KatalogEmpty title={T.gagalTitle} description={T.gagalDesc} actionLabel={T.cobaLagi} onAction={onRetry} />
      </div>
    );
  }

  if (state.status !== 'ready') {
    return (
      <ul className={s.grid} aria-busy="true" aria-label={T.memuat}>
        {Array.from({ length: PERPUS_SKELETON_COUNT }, (_, i) => (
          <li key={i} className={s.skeleton} aria-hidden="true">
            <div className={s.skeletonCover} />
            <div className={s.skeletonLine} style={{ width: '85%' }} />
            <div className={s.skeletonLine} style={{ width: '45%' }} />
          </li>
        ))}
      </ul>
    );
  }

  if (state.data.length === 0) return <KatalogEmpty title={T.kosongTitle} description={T.kosongDesc} />;

  const { items, diKategori } = daftarBuku(state.data, slug, search, urut);
  return (
    <section aria-label={T.daftarLabel}>
      <PerpusToolbar jumlah={items.length} total={search ? diKategori : null} urut={urut} onUrut={onUrut} />
      {items.length > 0 ? (
        <ul className={s.grid}>
          {items.map((buku) => (
            <li key={buku.id} className={s.item}>
              <BukuCard buku={buku} />
            </li>
          ))}
        </ul>
      ) : search ? (
        <KatalogEmpty
          title={T.cariKosongTitle}
          description={T.cariKosongDesc(search)}
          actionLabel={T.hapusCari}
          onAction={onClearSearch}
        />
      ) : (
        <KatalogEmpty title={T.kosongTitle} description={T.kosongKategori(namaKategori(slug, state.data))} />
      )}
    </section>
  );
}
