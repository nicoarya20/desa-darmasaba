import { APBDES_TEXT } from "../apbdes.text";
import { formatTanggal } from "../apbdes.logic";
import s from "../apbdes.module.css";

type Props = {
  year: number;
  updated: Date | null;
};

/** Keterangan tahun APBDes yang ditampilkan + tanggal pembaruan data. */
export function ApbdesYearCaption({ year, updated }: Props) {
  return (
    <div className={s.years}>
      <p className={s.yearCaption}>{APBDES_TEXT.singleYear(year)}</p>
      {updated ? (
        <p className={s.updated}>
          <time dateTime={updated.toISOString()}>{APBDES_TEXT.updatedAt(formatTanggal(updated))}</time>
        </p>
      ) : null}
    </div>
  );
}
