'use client';
import { FilterAktif } from './FilterAktif';
import { FilterGroup, FilterPillList } from './FilterGroup';
import { visibleFixed, type FilterChip, type LowonganFacets } from './lowongan-filter.logic';
import { FILTER_SKELETON_ROWS, PEMBERI_FACET_VISIBLE } from './lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import { toggleKey, toggleSingle, type LowonganParams, type LowonganUpdate } from './lowongan-params.logic';
import s from './filter.module.css';

type Props = {
  params: LowonganParams;
  /** null = data masih dimuat → kerangka. */
  facets: LowonganFacets | null;
  chips: readonly FilterChip[];
  update: LowonganUpdate;
  onClearAll: () => void;
  /** Tanpa kartu luar dan strip kepala "Filter" (drawer punya kepala sendiri). */
  bare?: boolean;
};

/** Panel Filter gaya Welcome to the Jungle: kotak "Pilihan Anda" + kotak "Atur filter" (panel kiri dan drawer). */
export function FilterPanel({ params, facets, chips, update, onClearAll, bare = false }: Props) {
  const content = (
    <div className={s.content}>
      <FilterAktif chips={chips} onApply={(next) => update(() => next)} onClearAll={onClearAll} />
      <section className={s.atur}>
        <h3 className={s.boxTitle}>{T.aturFilter}</h3>
        {facets === null ? (
          <div className={s.skeleton} aria-busy="true" aria-label={T.memuatFilter}>
            {Array.from({ length: FILTER_SKELETON_ROWS }, (_, i) => (
              <div key={i} className={s.skeletonRow} aria-hidden />
            ))}
          </div>
        ) : (
          <Groups params={params} facets={facets} update={update} />
        )}
      </section>
    </div>
  );
  if (bare) return <div className={s.panel}>{content}</div>;
  return (
    <div className={`${s.panel} ${s.card}`}>
      <h2 className={s.cardHead}>{T.filter}</h2>
      {content}
    </div>
  );
}

type GroupsProps = { params: LowonganParams; facets: LowonganFacets; update: LowonganUpdate };

/** Empat grup filter; grup tanpa pilihan yang tampil tidak dirender. */
function Groups({ params, facets, update }: GroupsProps) {
  const gaji = visibleFixed(facets.gaji, params.gaji);
  const tayang = visibleFixed(facets.tayang, params.tayang);
  return (
    <>
      {facets.tipe.length > 0 ? (
        <FilterGroup group="tipe" activeCount={params.tipe.length} defaultOpen>
          <FilterPillList
            options={facets.tipe.map((o) => ({ value: o.key, label: o.label, count: o.count }))}
            isSelected={(key) => params.tipe.includes(key)}
            onToggle={(key) => update((p) => ({ ...p, tipe: toggleKey(p.tipe, key) }))}
          />
        </FilterGroup>
      ) : null}
      {gaji.length > 0 ? (
        <FilterGroup group="gaji" activeCount={Number(params.gaji !== null)} defaultOpen>
          <FilterPillList
            options={gaji}
            isSelected={(value) => params.gaji === value}
            onToggle={(value) => update((p) => ({ ...p, gaji: toggleSingle(p.gaji, value) }))}
          />
        </FilterGroup>
      ) : null}
      {facets.pemberi.length > 0 ? (
        <FilterGroup group="pemberi" activeCount={params.pemberi.length}>
          <FilterPillList
            options={facets.pemberi.map((o) => ({ value: o.key, label: o.label, count: o.count }))}
            isSelected={(key) => params.pemberi.includes(key)}
            onToggle={(key) => update((p) => ({ ...p, pemberi: toggleKey(p.pemberi, key) }))}
            visibleCount={PEMBERI_FACET_VISIBLE}
          />
        </FilterGroup>
      ) : null}
      {tayang.length > 0 ? (
        <FilterGroup group="tayang" activeCount={Number(params.tayang !== null)}>
          <FilterPillList
            options={tayang}
            isSelected={(value) => params.tayang === value}
            onToggle={(value) => update((p) => ({ ...p, tayang: toggleSingle(p.tayang, value) }))}
          />
        </FilterGroup>
      ) : null}
    </>
  );
}
