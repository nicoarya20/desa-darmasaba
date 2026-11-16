'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { DataLingkunganRows } from './DataLingkunganRows';
import { dataLingkunganListHref } from './data-lingkungan.logic';
import { loadDataLingkungan } from './data-lingkungan.source';
import { DATA_LINGKUNGAN_TEXT as T } from './data-lingkungan.text';

const LIST_TITLE_ID = 'data-lingkungan-list-title';

/**
 * Halaman Data Lingkungan Desa di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila entri > 6 atau
 * sedang mencari), lalu daftar baris bergaris (muat sekali, saring & paginasi `?page=` di klien).
 */
export function DataLingkunganPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useLoadOnce(loadDataLingkungan, 'data lingkungan desa (Data Lingkungan Desa)');
  const total = state.status === 'ready' ? state.data.length : null;

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search={search}
        onSearch={(next) => router.replace(dataLingkunganListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <section aria-labelledby={LIST_TITLE_ID}>
        <h2 id={LIST_TITLE_ID} className={l.srOnly}>
          {T.listLabel}
        </h2>
        <DataLingkunganRows
          state={state}
          search={search}
          page={page}
          onPage={(next) => router.push(dataLingkunganListHref({ search, page: next }))}
        />
      </section>
    </div>
  );
}
