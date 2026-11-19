"use client";

import type { ReactNode } from "react";
import { useNearViewport } from "../lazy-load/use-near-viewport";

type Props = {
  children: ReactNode;
  /**
   * Kelas CSS yang memberi kotak setinggi isi aslinya (lihat lazy-chart.module.css). TIDAK dilepas setelah isi
   * terpasang: komponen `dynamic()` tidak menampilkan apa pun selama kodenya diunduh, dan tanpa tinggi minimum kotak
   * runtuh lalu mengembang lagi (dua pergeseran besar, CLS 0,5-0,8 saat gulir cepat dengan cache dingin).
   */
  placeholderClassName: string;
  /** Isi mulai dimuat sebelum benar-benar terlihat, supaya pergeseran akibat pemasangan terjadi di luar layar. */
  rootMargin?: string;
};

/**
 * Jarak mulai memasang isi dari tepi layar. Cukup jauh agar saat grafik terpasang (dan tingginya menyesuaikan),
 * konten yang terdorong masih di luar layar: pergeseran di luar layar tidak dihitung CLS.
 */
export const MOUNT_ROOT_MARGIN = "1200px 0px";

/**
 * Memasang `children` hanya setelah kotak ini mendekati layar (sekali, lalu tetap). Dipakai untuk grafik di bawah lipatan:
 * kode grafik (recharts) baru diunduh saat dibutuhkan sehingga JavaScript awal beranda lebih ringan (TBT, juknis lomba 5.4).
 * Pengamatan memakai `useNearViewport` bersama (browser tanpa IntersectionObserver langsung memasang isi).
 */
export function MountWhenNear({ children, placeholderClassName, rootMargin = MOUNT_ROOT_MARGIN }: Props) {
  const [boxRef, near] = useNearViewport<HTMLDivElement>(rootMargin);

  return (
    <div ref={boxRef} className={placeholderClassName}>
      {near ? children : null}
    </div>
  );
}
