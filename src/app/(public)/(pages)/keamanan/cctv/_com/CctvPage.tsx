'use client';
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { useLazyLoad } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import { useMemo } from "react";
import BackButton from "../../../pemerintahan/layanan/_com/BackButto";
import { summarizeCctv } from "./cctv.logic";
import { CCTV_BRAND_VARS } from "./cctv.meta";
import s from "./cctv.module.css";
import { loadCctvList, type CctvItem } from "./cctv.source";
import { CCTV_TEXT as T } from "./cctv.text";
import { CctvExplorer } from "./CctvExplorer";
import { CctvEmpty, CctvNotice, CctvSkeleton } from "./CctvStates";
import { CctvSummary } from "./CctvSummary";

const TITLE_ID = "cctv-page-title";

/** Halaman publik CCTV Keamanan Desa (gaya APBDes/Monev): ubin status, lalu peta + daftar yang saling terhubung. */
export function CctvPage() {
  const { state, retry } = useLazyLoad(loadCctvList, true, "daftar CCTV");

  return (
    <section className={`${apb.section} ${apb.page}`} style={CCTV_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <div className={apb.inner}>
        <div className={apb.back}>
          <BackButton />
        </div>
        <header className={apb.header}>
          <h1 id={TITLE_ID} className={apb.title}>
            {T.pageTitle}
          </h1>
          <p className={apb.lead}>{T.pageLead}</p>
        </header>
        {state.status === "error" ? (
          <CctvNotice onRetry={retry} />
        ) : state.status === "ready" ? (
          <CctvContent items={state.data} />
        ) : (
          <CctvSkeleton />
        )}
      </div>
    </section>
  );
}

/** Isi setelah data siap; tanpa titik sama sekali → satu ubin kosong. */
export function CctvContent({ items }: { items: readonly CctvItem[] }) {
  const summary = useMemo(() => summarizeCctv(items), [items]);
  if (summary.total === 0) return <CctvEmpty />;
  return (
    <div className={s.body}>
      <CctvSummary summary={summary} />
      <CctvExplorer items={items} />
    </div>
  );
}
