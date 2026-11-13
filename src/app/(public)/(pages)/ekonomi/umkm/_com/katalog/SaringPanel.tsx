'use client';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { toggleOption, type ProdukFacets, type TokoFacets } from './katalog-filter.logic';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import type { KatalogParams } from './katalog-params.logic';
import { SaringCheck, SaringCheckList, SaringGroup } from './SaringGroup';
import { SaringHarga } from './SaringHarga';
import s from './saring.module.css';

export type KatalogUpdate = (change: (current: KatalogParams) => KatalogParams) => void;

type Props = {
  params: KatalogParams;
  /** null = data masih dimuat → kerangka. */
  facets: ProdukFacets | TokoFacets | null;
  update: KatalogUpdate;
  /** Judul "Saring" + ikon (panel kiri); drawer punya kepala sendiri. */
  withTitle?: boolean;
};

const SKELETON_ROWS = 4;

/** Isi panel saring (panel kiri desktop & drawer ponsel memakai komponen yang sama). */
export function SaringPanel({ params, facets, update, withTitle = false }: Props) {
  return (
    <div className={s.panel}>
      {withTitle ? (
        <h2 className={s.title}>
          <IconAdjustmentsHorizontal size={20} stroke={1.75} aria-hidden />
          {T.saring}
        </h2>
      ) : null}
      {facets === null ? (
        <div aria-busy="true" aria-label={T.memuatSaring}>
          {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <div key={i} className={s.skeletonRow} aria-hidden />
          ))}
        </div>
      ) : 'toko' in facets ? (
        <ProdukGroups params={params} facets={facets} update={update} />
      ) : (
        <SaringGroup label={T.group.kategoriUsaha} activeCount={params.kategori.length} defaultOpen>
          <SaringCheckList
            options={facets.kategori}
            selected={params.kategori}
            onToggle={(option) => update((p) => ({ ...p, kategori: toggleOption(p.kategori, option) }))}
          />
        </SaringGroup>
      )}
    </div>
  );
}

type GroupsProps = { params: KatalogParams; facets: ProdukFacets; update: KatalogUpdate };

/** Grup saring tab Produk: kategori, toko, harga, ketersediaan, unggulan. */
function ProdukGroups({ params, facets, update }: GroupsProps) {
  return (
    <>
      {facets.kategori.length > 0 ? (
        <SaringGroup label={T.group.kategori} activeCount={params.kategori.length} defaultOpen>
          <SaringCheckList
            options={facets.kategori}
            selected={params.kategori}
            onToggle={(option) => update((p) => ({ ...p, kategori: toggleOption(p.kategori, option) }))}
          />
        </SaringGroup>
      ) : null}
      {facets.toko.length > 0 ? (
        <SaringGroup label={T.group.toko} activeCount={params.toko.length} defaultOpen>
          <SaringCheckList
            options={facets.toko}
            selected={params.toko}
            onToggle={(option) => update((p) => ({ ...p, toko: toggleOption(p.toko, option) }))}
            collapsible
          />
        </SaringGroup>
      ) : null}
      <SaringGroup label={T.group.harga} activeCount={params.min !== null || params.max !== null ? 1 : 0}>
        <SaringHarga min={params.min} max={params.max} onChange={(range) => update((p) => ({ ...p, ...range }))} />
      </SaringGroup>
      <SaringGroup label={T.group.tersedia} activeCount={Number(params.tersedia)}>
        <SaringCheck
          label={T.tersediaOption}
          count={facets.tersedia}
          checked={params.tersedia}
          onChange={() => update((p) => ({ ...p, tersedia: !p.tersedia }))}
        />
      </SaringGroup>
      <SaringGroup label={T.group.unggulan} activeCount={Number(params.unggulan)}>
        <SaringCheck
          label={T.unggulanOption}
          count={facets.unggulan}
          checked={params.unggulan}
          disabled={facets.unggulan === 0 && !params.unggulan}
          onChange={() => update((p) => ({ ...p, unggulan: !p.unggulan }))}
        />
      </SaringGroup>
    </>
  );
}
