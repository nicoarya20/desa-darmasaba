'use client';
import { useId, useState } from 'react';
import type { KatalogUrut } from '../katalog/katalog-filter.meta';
import type { KatalogProduk } from '../katalog/katalog.types';
import { KatalogEmpty } from '../katalog/KatalogEmpty';
import { KatalogGrid } from '../katalog/KatalogGrid';
import { KatalogUrutSelect } from '../katalog/KatalogUrutSelect';
import { ProdukCard } from '../katalog/ProdukCard';
import { buildTokoProdukView, TOKO_URUT_DEFAULT } from './toko-produk.logic';
import s from './toko-produk.module.css';
import { TOKO_PRODUK_TEXT as T } from './toko-produk.text';

/** Daftar produk satu toko: judul + jumlah, Urutkan (state lokal, mulai 2 produk), grid kartu katalog atau keadaan kosong. */
export function TokoProduk({ produk }: { produk: KatalogProduk[] }) {
  const titleId = useId();
  const [urut, setUrut] = useState<KatalogUrut>(TOKO_URUT_DEFAULT);
  const { items, showUrut } = buildTokoProdukView(produk, urut);

  return (
    <section className={s.section} aria-labelledby={titleId}>
      <div className={s.head}>
        <div className={s.heading}>
          <h2 id={titleId} className={s.title}>
            {T.judul}
          </h2>
          {produk.length > 0 && <p className={s.count}>{T.jumlah(produk.length)}</p>}
        </div>
        {showUrut && (
          <div className={s.urut}>
            <KatalogUrutSelect tab="produk" value={urut} onChange={setUrut} />
          </div>
        )}
      </div>
      <KatalogGrid variant="produk" empty={<KatalogEmpty title={T.kosong} />}>
        {items.map((p) => (
          <ProdukCard key={p.id} produk={p} />
        ))}
      </KatalogGrid>
    </section>
  );
}
