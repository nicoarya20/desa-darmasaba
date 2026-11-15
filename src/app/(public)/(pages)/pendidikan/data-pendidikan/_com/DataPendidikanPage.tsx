'use client';
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { formatTanggal } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { useLazyLoad } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import { useMemo } from "react";
import { summarizeDataPendidikan, type DataPendidikanSummary } from "./data-pendidikan.logic";
import { DATA_PENDIDIKAN_BRAND_VARS } from "./data-pendidikan.meta";
import s from "./data-pendidikan.module.css";
import { loadDataPendidikan } from "./data-pendidikan.source";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";
import { DataPendidikanPanel } from "./DataPendidikanPanel";
import { DataPendidikanEmpty, DataPendidikanNotice, DataPendidikanSkeleton } from "./DataPendidikanStates";

const TITLE_ID = "data-pendidikan-title";

/** Halaman publik Data Pendidikan (gaya APBDes/Monev): satu panel daftar batang per jenjang + total. */
export function DataPendidikanPage() {
  const { state, retry } = useLazyLoad(loadDataPendidikan, true, "data pendidikan");
  const summary = useMemo(() => (state.status === "ready" ? summarizeDataPendidikan(state.data) : null), [state]);

  return (
    <section className={`${apb.section} ${apb.page}`} style={DATA_PENDIDIKAN_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <div className={apb.inner}>
        <div className={apb.back}>
          <BackButton />
        </div>
        <header className={apb.header}>
          <h1 id={TITLE_ID} className={apb.title}>
            {T.pageTitle}
          </h1>
          <p className={`${apb.lead} ${s.lead}`}>{T.pageLead}</p>
          {summary?.latest && summary.rows.length > 0 ? (
            <p className={s.updated}>{T.updated(formatTanggal(summary.latest))}</p>
          ) : null}
        </header>
        {state.status === "error" ? (
          <DataPendidikanNotice onRetry={retry} />
        ) : summary ? (
          <DataPendidikanContent summary={summary} />
        ) : (
          <DataPendidikanSkeleton />
        )}
      </div>
    </section>
  );
}

/** Isi setelah data siap; tanpa kategori sama sekali → satu ubin kosong. */
export function DataPendidikanContent({ summary }: { summary: DataPendidikanSummary }) {
  if (summary.rows.length === 0) return <DataPendidikanEmpty />;
  return <DataPendidikanPanel summary={summary} />;
}
