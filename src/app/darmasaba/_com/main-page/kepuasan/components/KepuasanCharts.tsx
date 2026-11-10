import type { KepuasanSummary } from "../kepuasan.logic";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";
import { KepuasanDonutCard } from "./KepuasanDonutCard";
import { KepuasanMonthlyChart } from "./KepuasanMonthlyChart";

/** Isi section saat ada responden: grafik bulanan lalu tiga kartu komposisi. */
export function KepuasanCharts({ summary, total }: { summary: KepuasanSummary; total: number }) {
  return (
    <div className={s.content}>
      <KepuasanMonthlyChart monthly={summary.monthly} total={total} />
      <div className={s.grid}>
        <KepuasanDonutCard title={KEPUASAN_TEXT.jenisKelaminTitle} slices={summary.jenisKelamin} />
        <KepuasanDonutCard title={KEPUASAN_TEXT.ratingTitle} slices={summary.rating} />
        <KepuasanDonutCard title={KEPUASAN_TEXT.kelompokUmurTitle} slices={summary.kelompokUmur} />
      </div>
    </div>
  );
}
