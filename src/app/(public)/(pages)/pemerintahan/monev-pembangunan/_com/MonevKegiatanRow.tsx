import { formatPercent, formatRupiah } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import type { MonevKegiatan } from "@/app/admin/(dashboard)/_state/desa/monevPembangunan";
import { STATUS_PEMBANGUNAN_LABEL } from "@/lib/kegiatan-pembangunan";
import { rkpSourceLabel, type RkpRef } from "@/lib/dokumen-perencanaan";
import { Image } from "@mantine/core";
import { IconBackhoe } from "@tabler/icons-react";
import Link from "next/link";
import { kegiatanMeta, kegiatanProgres, kegiatanStatus } from "./monev.logic";
import { kegiatanDetailHref, statusVars } from "./monev.meta";
import r from "./monev-rows.module.css";
import { MONEV_TEXT } from "./monev.text";

type Props = {
  item: MonevKegiatan;
  /** Indeks RKP per tahun; bila ada dokumen RKP di tahun kegiatan, baris diberi label sumber. */
  rkpIndex?: ReadonlyMap<number, RkpRef>;
};

/** Satu baris kegiatan: foto · judul + lokasi/sumber dana (+ label RKP) · status + progres · anggaran. */
export function MonevKegiatanRow({ item, rkpIndex }: Props) {
  const status = kegiatanStatus(item.statusPembangunan);
  const progres = kegiatanProgres(item.progres);
  const meta = kegiatanMeta(item);
  const rkp = rkpIndex ? rkpSourceLabel(item.tanggal, rkpIndex) : null;

  return (
    <li className={r.row}>
      {item.image?.link ? (
        <Image src={item.image.link} alt="" className={r.thumb} loading="lazy" decoding="async" />
      ) : (
        <span className={`${r.thumb} ${r.thumbFallback}`} aria-hidden>
          <IconBackhoe size={24} stroke={1.5} />
        </span>
      )}

      <div className={r.rowMain}>
        <Link href={kegiatanDetailHref(item.id)} className={r.rowTitle}>
          {item.judul}
        </Link>
        {meta ? <p className={r.rowMeta}>{meta}</p> : null}
        {rkp ? (
          <p className={r.rowRkp}>
            {rkp.fileLink ? (
              <a href={rkp.fileLink} target="_blank" rel="noreferrer">
                {rkp.label}
              </a>
            ) : (
              rkp.label
            )}
          </p>
        ) : null}
      </div>

      <div className={r.rowProgress} style={statusVars(status ?? "belumDiisi")}>
        <span className={`${r.pill} ${status ? "" : r.pillMuted}`}>
          {status ? STATUS_PEMBANGUNAN_LABEL[status] : MONEV_TEXT.belumDiisi}
        </span>
        {progres !== null ? (
          <div className={r.progressLine}>
            <div
              className={r.rowBar}
              role="progressbar"
              aria-label={MONEV_TEXT.progresAria(item.judul)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progres)}
            >
              <span className={r.rowBarFill} style={{ width: `${progres}%` }} />
            </div>
            <span className={r.progressPct}>{formatPercent(progres)}</span>
          </div>
        ) : (
          <span className={r.progressNone}>{MONEV_TEXT.progresBelumDiisi}</span>
        )}
      </div>

      <div className={r.rowAnggaran}>
        <span className={r.cellLabel}>{MONEV_TEXT.colAnggaran}</span>
        {item.anggaran !== null && item.anggaran !== undefined ? (
          <span>{formatRupiah(item.anggaran)}</span>
        ) : (
          <span className={r.anggaranNone}>{MONEV_TEXT.anggaranBelumDiisi}</span>
        )}
      </div>
    </li>
  );
}
