'use client'
import apb from '@/app/(public)/_com/main-page/apbdes/apbdes.module.css';
import stateDokumenPerencanaanPublik from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaanPublik';
import stateMonevPembangunan from '@/app/admin/(dashboard)/_state/desa/monevPembangunan';
import { buildRkpIndex } from '@/lib/dokumen-perencanaan';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';
import DokumenPerencanaanSection from './_com/DokumenPerencanaanSection';
import { FILTER_ALL, isMonevEmpty, statusQuery } from './_com/monev.logic';
import { MONEV_BRAND_VARS } from './_com/monev.meta';
import s from './_com/monev.module.css';
import { MONEV_TEXT } from './_com/monev.text';
import { MonevApbdesLink } from './_com/MonevApbdesLink';
import { MonevKegiatanPanel } from './_com/MonevKegiatanPanel';
import { MonevEmpty, MonevNotice, MonevSummarySkeleton } from './_com/MonevStates';
import { MonevSummary } from './_com/MonevSummary';

/** Halaman publik Monev & Pembangunan (gaya APBDes): ringkasan, tautan realisasi APBDes, daftar progres, dokumen perencanaan. */
function Page() {
  const state = useProxy(stateMonevPembangunan);
  const [filter, setFilter] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);

  const loadCurrent = () => stateMonevPembangunan.load(page, statusQuery(filter));

  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadCurrent dibuat ulang tiap render; dependensi sebenarnya page & filter
  useEffect(() => { loadCurrent(); }, [page, filter]);

  const dokumenState = useProxy(stateDokumenPerencanaanPublik);
  useEffect(() => { stateDokumenPerencanaanPublik.loadRkpIndex(); }, []);
  const rkpIndex = useMemo(() => buildRkpIndex(dokumenState.rkpDocs), [dokumenState.rkpDocs]);

  const summary = state.summary;
  const empty = summary ? isMonevEmpty(summary) : false;

  return (
    <section className={`${apb.section} ${apb.page}`} style={MONEV_BRAND_VARS} aria-labelledby="monev-page-title">
      <div className={apb.inner}>
        <div className={apb.back}>
          <BackButton />
        </div>
        <header className={apb.header}>
          <h1 id="monev-page-title" className={apb.title}>{MONEV_TEXT.pageTitle}</h1>
          <p className={apb.lead}>{MONEV_TEXT.pageLead}</p>
        </header>

        <div className={s.body}>
          {summary ? (
            empty ? <MonevEmpty /> : <MonevSummary summary={summary} />
          ) : state.failed ? (
            <div className={s.empty}>
              <MonevNotice message={MONEV_TEXT.failedSummary} onRetry={loadCurrent} />
            </div>
          ) : (
            <MonevSummarySkeleton />
          )}

          <MonevApbdesLink />

          {summary && !empty ? (
            <MonevKegiatanPanel
              items={state.data}
              loading={state.loading}
              failed={state.failed}
              filter={filter}
              onFilterChange={(value) => { setFilter(value); setPage(1); }}
              onRetry={loadCurrent}
              page={page}
              totalPages={state.totalPages}
              onPageChange={setPage}
              rkpIndex={rkpIndex}
            />
          ) : null}

          <DokumenPerencanaanSection />
        </div>
      </div>
    </section>
  );
}

export default Page;
