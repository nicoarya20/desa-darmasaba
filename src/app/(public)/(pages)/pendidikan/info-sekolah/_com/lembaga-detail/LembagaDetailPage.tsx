'use client';
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import r from "@/app/(public)/_com/link-reveal/link-reveal.module.css";
import { useLazyLoad, type LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import type { LembagaDetail } from "@/lib/lembaga-pendidikan/lembaga.types";
import { Link } from "next-view-transitions";
import { useCallback } from "react";
import frame from "../../../_com/page-frame/page-frame.module.css";
import { PpidHeader } from "../../../../ppid/_com/PpidHeader";
import { InfoSekolahEmpty, InfoSekolahNotice, InfoSekolahSkeleton } from "../InfoSekolahStates";
import { INFO_SEKOLAH_PATH, LEMBAGA_ANCHOR } from "../info-sekolah.logic";
import { INFO_SEKOLAH_BRAND_VARS, namaPanjangJenjang } from "../info-sekolah.meta";
import s from "../info-sekolah.module.css";
import { loadLembagaDetail } from "../info-sekolah.source";
import LembagaDetailContent from "./LembagaDetailContent";
import { LEMBAGA_DETAIL_TEXT as T } from "./lembaga-detail.text";
import d from "./lembaga-detail.module.css";

/** Halaman publik detail satu sekolah (Info Sekolah): kerangka Pendidikan, kepala nama sekolah, isi detail. */
export function LembagaDetailPage({ id }: { id: string }) {
  const load = useCallback(() => loadLembagaDetail(id), [id]);
  const { state, retry } = useLazyLoad(load, true, `detail lembaga ${id}`);
  return (
    <section className={`${frame.frame} ${s.page}`} style={INFO_SEKOLAH_BRAND_VARS} aria-label={T.pageLabel}>
      <div className={frame.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        <LembagaDetailBody state={state} onRetry={retry} />
      </div>
    </section>
  );
}

/** Kalimat di bawah nama sekolah: nama panjang jenjang (mis. "Taman Kanak-kanak"), atau kalimat umum. */
function leadSekolah(data: LembagaDetail): string {
  const jenjang = data.jenjangPendidikan?.nama;
  return (jenjang && (namaPanjangJenjang(jenjang) ?? jenjang)) || T.leadFallback;
}

/** Isi halaman untuk satu keadaan muat (dipisah agar bisa dites tanpa memuat data). */
export function LembagaDetailBody({ state, onRetry }: { state: LoadState<LembagaDetail | null>; onRetry: () => void }) {
  if (state.status === "error") return <InfoSekolahNotice message={T.failed} onRetry={onRetry} />;
  if (state.status !== "ready") return <InfoSekolahSkeleton label={T.loading} count={2} height={320} />;
  if (!state.data) {
    return (
      <div className={d.notFound}>
        <InfoSekolahEmpty title={T.notFoundTitle} message={T.notFoundBody} />
        <Link href={`${INFO_SEKOLAH_PATH}#${LEMBAGA_ANCHOR}`} className={`${d.backLink} ${r.trigger}`}>
          <span className={r.cta} data-text={T.backToList}>
            {T.backToList}
          </span>
        </Link>
      </div>
    );
  }
  return (
    <>
      <div className={s.pageHead}>
        <PpidHeader title={state.data.nama} lead={leadSekolah(state.data)} />
      </div>
      <LembagaDetailContent data={state.data} />
    </>
  );
}
