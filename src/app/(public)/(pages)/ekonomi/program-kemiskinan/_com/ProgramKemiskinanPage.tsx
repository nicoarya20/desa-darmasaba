'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { ProgramKemiskinanRows } from './ProgramKemiskinanRows';
import { ProgramKemiskinanTerkait } from './ProgramKemiskinanTerkait';
import { programKemiskinanListHref } from './program-kemiskinan.logic';
import s from './program-kemiskinan.module.css';
import { loadProgramKemiskinan } from './program-kemiskinan.source';
import { PROGRAM_KEMISKINAN_TEXT as T } from './program-kemiskinan.text';

const LIST_TITLE_ID = 'program-kemiskinan-list-title';

/**
 * Halaman Program Pengentasan Kemiskinan di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila entri > 6
 * atau sedang mencari), baris bergaris (muat sekali, saring & paginasi `?page=` di klien), lalu tautan silang.
 */
export function ProgramKemiskinanPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useLoadOnce(loadProgramKemiskinan, 'program pengentasan kemiskinan (Program Pengentasan Kemiskinan)');
  const total = state.status === 'ready' ? state.data.length : null;

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search={search}
        onSearch={(next) => router.replace(programKemiskinanListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <div className={s.stack}>
        <section aria-labelledby={LIST_TITLE_ID}>
          <h2 id={LIST_TITLE_ID} className={l.srOnly}>
            {T.listLabel}
          </h2>
          <ProgramKemiskinanRows
            state={state}
            search={search}
            page={page}
            onPage={(next) => router.push(programKemiskinanListHref({ search, page: next }))}
          />
        </section>
        <ProgramKemiskinanTerkait />
      </div>
    </div>
  );
}
