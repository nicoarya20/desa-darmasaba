"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Tinggi cadangan (px) sebelum isi dimuat, mendekati tinggi aslinya agar halaman tidak melompat. */
  minHeight: number;
  /** Isi mulai dimuat sebelum benar-benar terlihat, supaya tidak ada ruang kosong saat pengunjung menggulir. */
  rootMargin?: string;
};

/**
 * Memasang `children` hanya setelah kotak ini mendekati layar (sekali, lalu tetap). Dipakai untuk grafik di bawah lipatan:
 * kode grafik (recharts) baru diunduh saat dibutuhkan sehingga JavaScript awal beranda lebih ringan (TBT, juknis lomba 5.4).
 * Bergantung pada IntersectionObserver (semua browser modern); tanpa itu efeknya tidak jalan dan isi tidak muncul.
 */
export function MountWhenNear({ children, minHeight, rootMargin = "400px 0px" }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return (
    <div ref={boxRef} style={near ? undefined : { minHeight }}>
      {near ? children : null}
    </div>
  );
}
