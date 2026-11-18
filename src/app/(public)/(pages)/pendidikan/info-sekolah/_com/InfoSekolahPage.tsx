'use client';
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import { useLazyLoad, type LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import { useEffect } from "react";
import frame from "../../_com/page-frame/page-frame.module.css";
import { PpidHeader } from "../../../ppid/_com/PpidHeader";
import { InfoSekolahSummary } from "./InfoSekolahSummary";
import { InfoSekolahEmpty, InfoSekolahNotice, InfoSekolahSkeleton } from "./InfoSekolahStates";
import { LEMBAGA_ANCHOR, type InfoSekolahRingkasan } from "./info-sekolah.logic";
import s from "./info-sekolah.module.css";
import { loadInfoSekolah } from "./info-sekolah.source";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";
import { JenjangDirectory } from "./JenjangDirectory";

/** Halaman publik Info Sekolah: kerangka Pendidikan, ringkasan 3 ubin (gaya APBDes/Monev) + direktori per jenjang. */
export function InfoSekolahPage() {
  const { state, retry } = useLazyLoad(loadInfoSekolah, true, "info sekolah");
  useScrollToAnchorWhenReady(state.status === "ready");

  return (
    <section className={`${frame.frame} ${s.page}`} aria-label={T.pageTitle}>
      <div className={frame.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        <div className={s.pageHead}>
          <PpidHeader title={T.pageTitle} lead={T.pageLead} />
        </div>
        <InfoSekolahBody state={state} onRetry={retry} />
      </div>
    </section>
  );
}

/** Isi halaman untuk satu keadaan muat (dipisah agar bisa dites tanpa memuat data). */
export function InfoSekolahBody({ state, onRetry }: { state: LoadState<InfoSekolahRingkasan>; onRetry: () => void }) {
  if (state.status === "error") return <InfoSekolahNotice message={T.failed} onRetry={onRetry} />;
  if (state.status !== "ready") {
    return (
      <div className={s.body}>
        <InfoSekolahSkeleton label={T.loading} count={3} height={220} grid />
        <InfoSekolahSkeleton label={T.loading} count={1} height={360} />
      </div>
    );
  }
  if (state.data.totalLembaga === 0) return <InfoSekolahEmpty title={T.emptyTitle} message={T.emptyBody} />;
  return (
    <div className={s.body}>
      <InfoSekolahSummary ringkasan={state.data} />
      <JenjangDirectory ringkasan={state.data} />
    </div>
  );
}

/**
 * Tujuan `#lembaga` (tautan `/lembaga` lama) baru ada setelah data dimuat, jadi lompatan bawaan peramban
 * meleset; gulir sekali saat isi siap.
 */
function useScrollToAnchorWhenReady(ready: boolean) {
  useEffect(() => {
    if (!ready || window.location.hash !== `#${LEMBAGA_ANCHOR}`) return;
    document.getElementById(LEMBAGA_ANCHOR)?.scrollIntoView({ block: "start" });
  }, [ready]);
}
