import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { formatPercent } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import type { CSSProperties } from "react";
import { formatJumlah, type DataPendidikanRow, type DataPendidikanSummary } from "./data-pendidikan.logic";
import s from "./data-pendidikan.module.css";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";

const PANEL_TITLE_ID = "data-pendidikan-panel-title";

/** Panel: judul + total di kepala, lalu daftar batang horizontal satu warna (urut jenjang). */
export function DataPendidikanPanel({ summary }: { summary: DataPendidikanSummary }) {
  const { rows, total, belumDiisi } = summary;
  return (
    <div className={apb.panel}>
      <div className={s.head}>
        <div>
          <h2 id={PANEL_TITLE_ID} className={s.title}>
            {T.panelTitle}
          </h2>
          <p className={s.caption}>{T.panelCaption}</p>
        </div>
        {total !== null ? (
          <p className={s.total}>
            <span className={s.totalLabel}>{T.totalLabel}</span>
            <span className={s.totalValue}>
              {formatJumlah(total)}
              <span className={s.totalUnit}>{T.unit}</span>
            </span>
          </p>
        ) : null}
      </div>
      <ol className={s.list} aria-labelledby={PANEL_TITLE_ID}>
        {rows.map((row, i) => (
          // Nama bisa ganda (data lama, mis. dua "SD"), jadi kunci = id.
          <DataPendidikanRowItem key={row.id} row={row} index={i} />
        ))}
      </ol>
      {belumDiisi > 0 && total !== null ? <p className={s.note}>{T.notFilledNote(belumDiisi)}</p> : null}
    </div>
  );
}

/** Satu jenjang: nama, angka + persen tercetak langsung (tanpa hover), batang relatif ke jenjang terbanyak. */
export function DataPendidikanRowItem({ row, index }: { row: DataPendidikanRow; index: number }) {
  return (
    <li className={s.row}>
      <span className={s.name}>{row.nama}</span>
      {row.jumlah === null ? (
        <span className={s.missing}>{T.notFilled}</span>
      ) : (
        <>
          <span className={s.track} aria-hidden>
            <span className={s.bar} style={{ width: `${row.width}%`, "--i": index } as CSSProperties} />
          </span>
          <span className={s.figure}>
            <span className={s.count}>{formatJumlah(row.jumlah)}</span>
            <span className={s.unit}>{T.unit}</span>
            {row.share !== null ? <span className={s.share}>{formatPercent(row.share)}</span> : null}
          </span>
        </>
      )}
    </li>
  );
}
