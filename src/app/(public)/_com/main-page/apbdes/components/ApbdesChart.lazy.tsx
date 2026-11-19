"use client";

import dynamic from "next/dynamic";
import { useEffect, type ComponentProps } from "react";
import s from "../../../lazy-chart/lazy-chart.module.css";
import { MountWhenNear } from "../../../lazy-chart/MountWhenNear";
import { runOnFirstInteraction } from "../../../lazy-chart/prefetch-on-interaction";
import type { ApbdesChart as ApbdesChartType } from "./ApbdesChart";

const loadChart = () => import("./ApbdesChart").then((m) => m.ApbdesChart);

// ssr:false + dipasang saat mendekati layar: recharts tidak ikut paket JavaScript awal beranda.
const ApbdesChart = dynamic(loadChart, { ssr: false });

/** `ApbdesChart` yang dimuat tunda; props sama. Kodenya diunduh lebih awal pada interaksi pertama pengunjung. */
export function LazyApbdesChart(props: ComponentProps<typeof ApbdesChartType>) {
  useEffect(
    () =>
      runOnFirstInteraction(() => {
        loadChart().catch((error: unknown) => console.warn("Gagal mengunduh grafik APBDes lebih awal:", error));
      }),
    [],
  );

  return (
    <MountWhenNear placeholderClassName={s.apbdes}>
      <ApbdesChart {...props} />
    </MountWhenNear>
  );
}
