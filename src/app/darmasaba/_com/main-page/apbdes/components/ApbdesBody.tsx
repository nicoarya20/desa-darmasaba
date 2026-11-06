import { APBDES_TEXT } from "../apbdes.text";
import s from "../apbdes.module.css";
import type { useApbdesData } from "../use-apbdes-data";
import { ApbdesChart } from "./ApbdesChart";
import { ApbdesDetail, type DetailVariant } from "./ApbdesDetail";
import { ApbdesDocument } from "./ApbdesDocument";
import { ApbdesSkeleton } from "./ApbdesSkeleton";
import { ApbdesSummary } from "./ApbdesSummary";
import { ApbdesYearPicker } from "./ApbdesYearPicker";

type Props = {
  data: ReturnType<typeof useApbdesData>;
  /** `compact` = beranda (rincian tertutup); `full` = halaman detail (rincian terbuka + kolom selisih + dokumen). */
  variant: DetailVariant;
};

/** Isi APBDes bersama beranda & halaman detail: loading, kosong, pilihan tahun, ringkasan, grafik, rincian. */
export function ApbdesBody({ data, variant }: Props) {
  const { list, years, year, setYear, current, categories, updated, hasItems } = data;

  if (list === null) return <ApbdesSkeleton />;
  if (year === null) return <p className={s.empty}>{APBDES_TEXT.emptyAll}</p>;

  return (
    <>
      <ApbdesYearPicker years={years} year={year} onChange={setYear} updated={updated} />
      {/* key=tahun: konten dipasang ulang agar animasi masuk berjalan tiap ganti tahun */}
      <div key={year} className={s.content}>
        {hasItems ? (
          <>
            <ApbdesSummary categories={categories} />
            <ApbdesChart categories={categories} tahun={year} />
            <ApbdesDetail categories={categories} variant={variant} />
          </>
        ) : (
          <p className={s.empty}>{APBDES_TEXT.emptyYear(year)}</p>
        )}
        {variant === "full" && current ? <ApbdesDocument apbdes={current} /> : null}
      </div>
    </>
  );
}
