"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { MountWhenNear } from "../../../lazy-chart/MountWhenNear";
import type { ApbdesChart as ApbdesChartType } from "./ApbdesChart";

// ssr:false + dipasang saat mendekati layar: recharts tidak ikut paket JavaScript awal beranda.
const ApbdesChart = dynamic(() => import("./ApbdesChart").then((m) => m.ApbdesChart), { ssr: false });

/** Tinggi panel grafik (judul + grafik 280px + padding), cadangan sebelum grafik dimuat. */
const APBDES_CHART_MIN_HEIGHT = 360;

/** `ApbdesChart` yang dimuat tunda; props sama. */
export function LazyApbdesChart(props: ComponentProps<typeof ApbdesChartType>) {
  return (
    <MountWhenNear minHeight={APBDES_CHART_MIN_HEIGHT}>
      <ApbdesChart {...props} />
    </MountWhenNear>
  );
}
