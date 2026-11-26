import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { ListRefreshRegion } from '@/app/(public)/_com/kabar-list/ListRefreshRegion';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { ProdukHukumTable } from './ProdukHukumTable';
import { PRODUK_HUKUM_LIST_ID, produkHukumEmptyMessage, type ProdukHukumFilter } from './produk-hukum.logic';
import { PRODUK_HUKUM_TEXT as T } from './produk-hukum.text';
import s from './produk-hukum.module.css';
import type { ProdukHukumListState } from './use-produk-hukum';

/** Jumlah baris kerangka saat memuat. */
const SKELETON_ROWS = 5;

type Props = {
  state: ProdukHukumListState;
  filter: ProdukHukumFilter;
  limit: number;
  onPage: (page: number) => void;
};

/** Isi halaman untuk satu keadaan muat: kerangka berdenyut, pesan gagal (`role="alert"`), pesan kosong, atau tabel + paginasi. */
export function ProdukHukumBody({ state, filter, limit, onPage }: Props) {
  if (state.status === 'loading') {
    return (
      <div className={s.skeletons} aria-busy="true" aria-label={T.loading}>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className={s.skeleton} aria-hidden />
        ))}
      </div>
    );
  }
  if (state.status === 'error') {
    return <p className={kabar.empty} role="alert">{T.failed}</p>;
  }
  if (state.items.length === 0) {
    return <p className={kabar.empty}>{produkHukumEmptyMessage(filter)}</p>;
  }
  return (
    <div id={PRODUK_HUKUM_LIST_ID} className={s.tableWrap}>
      <ListRefreshRegion refreshing={state.refreshing}>
        <ProdukHukumTable items={state.items} page={state.page} limit={limit} />
      </ListRefreshRegion>
      <KabarListPagination total={state.totalPages} value={filter.page} label={T.paginationLabel} onChange={onPage} />
    </div>
  );
}
