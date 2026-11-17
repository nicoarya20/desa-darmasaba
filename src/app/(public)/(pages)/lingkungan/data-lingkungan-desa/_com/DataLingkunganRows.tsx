import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { paginate } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import { IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import { dataLingkunganEmptyMessage, filterDataLingkungan, type DataLingkungan } from './data-lingkungan.logic';
import { DATA_LINGKUNGAN_PAGE_SIZE } from './data-lingkungan.meta';
import s from './data-lingkungan.module.css';
import { DATA_LINGKUNGAN_TEXT as T } from './data-lingkungan.text';

const PLACEHOLDER_ROWS = 3;

type Props = {
  state: LoadState<DataLingkungan[]>;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Daftar data lingkungan untuk satu keadaan muat: kerangka, pesan kosong/galat, atau baris + paginasi klien (diekspor untuk test). */
export function DataLingkunganRows({ state, search, page, onPage }: Props) {
  if (state.status === 'loading') {
    return (
      <ul className={s.rows} aria-busy="true" aria-label={T.loading}>
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
          <li key={i} className={s.placeholderRow} aria-hidden />
        ))}
      </ul>
    );
  }

  const matches = state.status === 'ready' ? filterDataLingkungan(state.data, search) : [];
  if (matches.length === 0) return <p className={kabar.empty}>{dataLingkunganEmptyMessage(search, state.status === 'error')}</p>;

  const current = paginate(matches, page, DATA_LINGKUNGAN_PAGE_SIZE);
  return (
    <>
      <ul className={s.rows} aria-label={T.listLabel}>
        {current.items.map((item) => (
          <DataLingkunganRow key={item.id} item={item} />
        ))}
      </ul>
      <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
    </>
  );
}

/** Satu baris bergaris: kiri ikon + nama + jumlah apa adanya, kanan deskripsi (HTML sudah disaring di `toDataLingkungan`). */
export function DataLingkunganRow({ item }: { item: DataLingkungan }) {
  return (
    <li className={s.row}>
      <div className={s.head}>
        {item.icon ? (
          <span className={s.icon} aria-hidden>
            <IconMapper name={item.icon} size={32} color="currentColor" />
          </span>
        ) : null}
        <h3 className={s.title}>{item.title}</h3>
        {item.amount ? <p className={s.amount}>{item.amount}</p> : null}
      </div>
      {item.html ? <div className={`${s.prose} ${rt.root}`} dangerouslySetInnerHTML={{ __html: item.html }} /> : null}
    </li>
  );
}
