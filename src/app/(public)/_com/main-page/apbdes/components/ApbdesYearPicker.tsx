import { SegmentedControl } from "@mantine/core";
import { APBDES_TEXT } from "../apbdes.text";
import { formatTanggal } from "../apbdes.logic";
import s from "../apbdes.module.css";

type Props = {
  years: readonly number[];
  year: number;
  onChange: (year: number) => void;
  updated: Date | null;
};

/** Pilihan tahun (SegmentedControl; teks bila hanya satu tahun) + tanggal pembaruan data. */
export function ApbdesYearPicker({ years, year, onChange, updated }: Props) {
  return (
    <div className={s.years}>
      {years.length > 1 ? (
        <SegmentedControl
          aria-label={APBDES_TEXT.yearLabel}
          radius="xl"
          size="md"
          value={String(year)}
          onChange={(v) => onChange(Number(v))}
          data={years.map(String)}
        />
      ) : (
        <p className={s.yearCaption}>{APBDES_TEXT.singleYear(year)}</p>
      )}
      {updated ? (
        <p className={s.updated}>
          <time dateTime={updated.toISOString()}>{APBDES_TEXT.updatedAt(formatTanggal(updated))}</time>
        </p>
      ) : null}
    </div>
  );
}
