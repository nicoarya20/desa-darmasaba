import colors from "@/con/colors";
import { BarChart } from "@mantine/charts";
import { APBDES_TEXT } from "../apbdes.text";
import { formatRupiah, formatRupiahCompact, type CategorySummary } from "../apbdes.logic";
import s from "../apbdes.module.css";

const SERIES = [
  { name: "pagu", label: APBDES_TEXT.pagu, color: colors["blue-button-3"] },
  { name: "realisasi", label: APBDES_TEXT.realisasi, color: colors["blue-button"] },
];

/** Grafik batang pagu vs realisasi per kategori; sumbu ringkas (Jt/M/T), tooltip Rupiah penuh. */
export function ApbdesChart({ categories, tahun }: { categories: readonly CategorySummary[]; tahun: number }) {
  const data = categories.map((c) => ({ kategori: APBDES_TEXT.tipe[c.tipe], pagu: c.pagu, realisasi: c.realisasi }));
  const hasRealisasi = categories.some((c) => c.realisasi > 0);

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{APBDES_TEXT.chartTitle}</h3>
      <BarChart
        h={280}
        data={data}
        dataKey="kategori"
        series={SERIES}
        withLegend
        legendProps={{ verticalAlign: "top", height: 44 }}
        valueFormatter={formatRupiah}
        yAxisProps={{ tickFormatter: (v: number) => formatRupiahCompact(v, 1), width: 76 }}
        gridAxis="x"
        tickLine="none"
        maxBarWidth={56}
        barProps={{ radius: [6, 6, 0, 0] }}
      />
      {hasRealisasi ? null : <p className={s.note}>{APBDES_TEXT.chartNoRealisasi(tahun)}</p>}
    </div>
  );
}
