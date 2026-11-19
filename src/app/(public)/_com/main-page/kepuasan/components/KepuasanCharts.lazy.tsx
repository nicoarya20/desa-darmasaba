"use client";

import dynamic from "next/dynamic";
import { useEffect, type ComponentProps } from "react";
import s from "../../../lazy-chart/lazy-chart.module.css";
import { MountWhenNear } from "../../../lazy-chart/MountWhenNear";
import { runOnFirstInteraction } from "../../../lazy-chart/prefetch-on-interaction";
import type { KepuasanCharts as KepuasanChartsType } from "./KepuasanCharts";

const loadCharts = () => import("./KepuasanCharts").then((m) => m.KepuasanCharts);

// ssr:false + dipasang saat mendekati layar: grafik batang dan tiga donat tidak ikut paket JavaScript awal beranda.
const KepuasanCharts = dynamic(loadCharts, { ssr: false });

/** `KepuasanCharts` yang dimuat tunda; props sama. Kodenya diunduh lebih awal pada interaksi pertama pengunjung. */
export function LazyKepuasanCharts(props: ComponentProps<typeof KepuasanChartsType>) {
  useEffect(
    () =>
      runOnFirstInteraction(() => {
        loadCharts().catch((error: unknown) => console.warn("Gagal mengunduh grafik kepuasan lebih awal:", error));
      }),
    [],
  );

  return (
    <MountWhenNear placeholderClassName={s.kepuasan}>
      <KepuasanCharts {...props} />
    </MountWhenNear>
  );
}
