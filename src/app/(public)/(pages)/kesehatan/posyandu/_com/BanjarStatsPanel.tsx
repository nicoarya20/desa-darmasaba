import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import type { ReactNode } from "react";
import type { BanjarStatsRow, HitunganKey, PosyanduStats } from "./posyandu.logic";
import { hasUnassigned } from "./posyandu.logic";
import s from "./posyandu.module.css";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { PosyanduEmpty, PosyanduNotice, PosyanduSkeleton } from "./PosyanduStates";
import type { LoadState } from "./use-posyandu-data";

/** `desa` null = angka seluruh desa gagal dimuat (baris tetap tampil dengan keterangan gagal). */
export type BanjarStatsData = { desa: PosyanduStats | null; rows: BanjarStatsRow[] };

type Props = {
  titleId: string;
  title: string;
  lead: string;
  desa: LoadState<PosyanduStats>;
  banjar: LoadState<BanjarStatsRow[]>;
  onRetry: () => void;
  /** Hitungan yang dicek untuk catatan "belum terhubung ke banjar". */
  unassignedKey: HitunganKey;
  children: (data: BanjarStatsData) => ReactNode;
};

/**
 * Kerangka panel angka per banjar (tab Balita & Ibu Hamil): judul, pengantar, isi, catatan privasi.
 * Memuat → kerangka; daftar banjar gagal → pesan + coba lagi. Angka desa yang gagal tidak menggagalkan panel.
 */
export function BanjarStatsPanel({ titleId, title, lead, desa, banjar, onRetry, unassignedKey, children }: Props) {
  const loading = banjar.status === "idle" || banjar.status === "loading" || desa.status === "idle" || desa.status === "loading";

  let body: ReactNode;
  if (banjar.status === "error") body = <PosyanduNotice message={T.banjarFailed} onRetry={onRetry} />;
  else if (loading || banjar.status !== "ready") body = <PosyanduSkeleton label={T.banjarLoading} count={6} height={56} />;
  else if (banjar.data.length === 0) body = <PosyanduEmpty message={T.banjarEmpty} />;
  else {
    const desaData = desa.status === "ready" ? desa.data : null;
    body = (
      <>
        {children({ desa: desaData, rows: banjar.data })}
        {desaData && hasUnassigned(desaData, banjar.data, unassignedKey) ? <p className={s.note}>{T.unassignedNote}</p> : null}
      </>
    );
  }

  return (
    <section className={apb.panel} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <div className={s.panelHead}>
        <div>
          <h2 id={titleId} className={apb.panelTitle}>
            {title}
          </h2>
          <p className={s.panelLead}>{lead}</p>
        </div>
      </div>
      {body}
      <p className={s.privacyInPanel}>{T.privacyNote}</p>
    </section>
  );
}
