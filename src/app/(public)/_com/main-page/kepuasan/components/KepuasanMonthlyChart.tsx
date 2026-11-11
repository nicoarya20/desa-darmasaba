import { BarChart } from "@mantine/charts";
import type { MonthlyCount } from "../kepuasan.logic";
import { MONTHLY_BAR_COLOR } from "../kepuasan.meta";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";

const SERIES = [{ name: "Responden", label: KEPUASAN_TEXT.monthlySeries, color: MONTHLY_BAR_COLOR }];
const formatCount = (n: number) => n.toLocaleString("id-ID");

type Props = { monthly: readonly MonthlyCount[]; total: number };

/** Panel datar: total responden (angka besar) + grafik batang jumlah responden per bulan. */
export function KepuasanMonthlyChart({ monthly, total }: Props) {
  const shortByMonth = new Map(monthly.map((m) => [m.month, m.short]));

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <div>
          <h3 className={s.panelTitle}>{KEPUASAN_TEXT.monthlyTitle}</h3>
          <p className={s.caption}>{KEPUASAN_TEXT.monthlyCaption}</p>
        </div>
        <div className={s.total}>
          <span className={s.totalLabel}>{KEPUASAN_TEXT.total}</span>
          <span className={s.totalValue}>{formatCount(total)}</span>
        </div>
      </div>
      <BarChart
        h={280}
        data={[...monthly]}
        dataKey="month"
        series={SERIES}
        valueFormatter={formatCount}
        xAxisProps={{ tickFormatter: (v: string) => shortByMonth.get(v) ?? v }}
        yAxisProps={{ allowDecimals: false, width: 40 }}
        gridAxis="y"
        tickLine="none"
        maxBarWidth={56}
        barProps={{ radius: [6, 6, 0, 0] }}
      />
    </div>
  );
}
