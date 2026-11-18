"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { MountWhenNear } from "../../../lazy-chart/MountWhenNear";
import type { KepuasanCharts as KepuasanChartsType } from "./KepuasanCharts";

// ssr:false + dipasang saat mendekati layar: grafik batang dan tiga donat tidak ikut paket JavaScript awal beranda.
const KepuasanCharts = dynamic(() => import("./KepuasanCharts").then((m) => m.KepuasanCharts), { ssr: false });

/** Tinggi gabungan grafik bulanan + baris kartu komposisi, cadangan sebelum grafik dimuat. */
const KEPUASAN_CHARTS_MIN_HEIGHT = 640;

/** `KepuasanCharts` yang dimuat tunda; props sama. */
export function LazyKepuasanCharts(props: ComponentProps<typeof KepuasanChartsType>) {
  return (
    <MountWhenNear minHeight={KEPUASAN_CHARTS_MIN_HEIGHT}>
      <KepuasanCharts {...props} />
    </MountWhenNear>
  );
}
