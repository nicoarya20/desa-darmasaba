import { DonutChart } from "@mantine/charts";
import { formatShare, sumValues, type ChartSlice } from "../kepuasan.logic";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";

// Pemisah antar-irisan senada latar kartu (--tile), bukan putih, agar donat tampak datar.
const TILE = "#f5f5f7";

type Props = { title: string; slices: readonly ChartSlice[] };

/** Kartu satu komposisi responden: donat + legenda (jumlah dan persen per kategori). */
export function KepuasanDonutCard({ title, slices }: Props) {
  const total = sumValues(slices);

  return (
    <article className={s.card}>
      <h3 className={s.cardTitle}>{title}</h3>
      {total === 0 ? (
        <p className={s.note}>{KEPUASAN_TEXT.chartEmpty}</p>
      ) : (
        <>
          <div className={s.donut}>
            <DonutChart
              data={[...slices]}
              size={168}
              thickness={24}
              strokeColor={TILE}
              strokeWidth={2}
              withTooltip
              tooltipDataSource="segment"
              valueFormatter={(v) => v.toLocaleString("id-ID")}
            />
          </div>
          <ul className={s.legend}>
            {slices.map((slice) => (
              <li key={slice.name} className={s.legendRow}>
                <span className={s.swatch} style={{ background: slice.color }} aria-hidden />
                <span className={s.legendName}>{slice.name}</span>
                <span className={s.legendValue}>{slice.value.toLocaleString("id-ID")}</span>
                <span className={s.legendShare}>{formatShare(slice.value, total)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
