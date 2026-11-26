'use client';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { paginate } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { KolaborasiRow } from './KolaborasiRow';
import { emptyMessage, filterKolaborasi, groupByYear, type Kolaborasi, type KolaborasiQuery } from './kolaborasi.logic';
import { KOLABORASI_LIST_ID, KOLABORASI_PAGE_LIMIT } from './kolaborasi.meta';
import s from './kolaborasi.module.css';
import { KOLABORASI_TEXT as T } from './kolaborasi.text';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';

const PLACEHOLDER_ROWS = 3;

type Props = {
  state: LoadState<Kolaborasi[]>;
  query: KolaborasiQuery;
  onPage: (page: number) => void;
};

/** Daftar kolaborasi untuk satu keadaan muat: kerangka, pesan kosong/galat, atau kelompok `h2` tahun + paginasi (diekspor untuk test). */
export function KolaborasiList({ state, query, onPage }: Props) {
  if (state.status === 'loading') {
    return (
      <ul className={s.rows} aria-busy="true" aria-label={T.loading}>
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
          <li key={i} className={s.placeholderRow} aria-hidden />
        ))}
      </ul>
    );
  }

  const matches = state.status === 'ready' ? filterKolaborasi(state.data, query) : [];
  if (matches.length === 0) return <p className={kabar.empty}>{emptyMessage(query, state.status === 'error')}</p>;

  const { items, page, totalPages } = paginate(matches, query.page, KOLABORASI_PAGE_LIMIT);
  return (
    <div id={KOLABORASI_LIST_ID} className={s.list}>
      {groupByYear(items).map((group, i) => {
        const headingId = `kolaborasi-tahun-${group.year ?? 'tanpa'}-${i}`;
        return (
          <section key={headingId} className={s.group} aria-labelledby={headingId}>
            <h2 id={headingId} className={s.year}>
              {group.year ?? T.noYear}
            </h2>
            <ul className={s.rows}>
              {group.items.map((item) => (
                <KolaborasiRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        );
      })}
      <KabarListPagination total={totalPages} value={page} label={T.paginationLabel} onChange={onPage} />
    </div>
  );
}
