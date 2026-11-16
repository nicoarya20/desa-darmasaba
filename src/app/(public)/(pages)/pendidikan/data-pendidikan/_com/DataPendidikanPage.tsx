'use client';
import { formatTanggal } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { useLazyLoad } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import { useMemo } from "react";
import frame from "../../_com/page-frame/page-frame.module.css";
import { PpidHeader } from "../../../ppid/_com/PpidHeader";
import { summarizeDataPendidikan, type DataPendidikanSummary } from "./data-pendidikan.logic";
import { DATA_PENDIDIKAN_BRAND_VARS } from "./data-pendidikan.meta";
import s from "./data-pendidikan.module.css";
import { loadDataPendidikan } from "./data-pendidikan.source";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";
import { DataPendidikanPanel } from "./DataPendidikanPanel";
import { DataPendidikanEmpty, DataPendidikanNotice, DataPendidikanSkeleton } from "./DataPendidikanStates";

/** Halaman publik Data Pendidikan (kerangka Pendidikan, panel gaya APBDes/Monev): satu panel daftar batang per jenjang + total. */
export function DataPendidikanPage() {
  const { state, retry } = useLazyLoad(loadDataPendidikan, true, "data pendidikan");
  const summary = useMemo(() => (state.status === "ready" ? summarizeDataPendidikan(state.data) : null), [state]);

  return (
    <section className={`${frame.frame} ${s.page}`} style={DATA_PENDIDIKAN_BRAND_VARS} aria-label={T.pageTitle}>
      <div className={frame.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        <div className={s.pageHead}>
          <PpidHeader title={T.pageTitle} lead={T.pageLead} />
          {summary?.latest && summary.rows.length > 0 ? (
            <p className={s.updated}>{T.updated(formatTanggal(summary.latest))}</p>
          ) : null}
        </div>
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
