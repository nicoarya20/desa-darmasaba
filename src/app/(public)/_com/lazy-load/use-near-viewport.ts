"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

/** Jarak (px) dari tepi layar saat foto galeri mulai dimuat, cukup jauh agar foto siap sebelum section terlihat. */
export const NEAR_ROOT_MARGIN = "600px 0px";

/**
 * Jarak mulai fetch data section beranda di bawah lipatan: dua tinggi layar di atas & bawah (persen rootMargin
 * dihitung dari tinggi viewport). Section yang jauh di bawah tidak ikut berebut jaringan dengan foto hero (LCP) saat
 * halaman dibuka. Dua layar, bukan satu: beberapa kerangka tidak setinggi isi akhirnya (Anti Korupsi ponsel +466px,
 * SDGs ponsel -467px), jadi data harus tiba saat section masih di luar layar; dengan satu layar, gulir cepat di ponsel
 * sempat menangkap pergeseran itu di layar (CLS 0,15 di QA lokal).
 */
export const FETCH_ROOT_MARGIN = "200% 0px";

/**
 * `true` (sekali, lalu tetap) setelah elemen pada `ref` mendekati layar. Render pertama (juga di server) selalu
 * `false`, jadi markup SSR dan hidrasi sama. Browser tanpa IntersectionObserver (sangat lama) langsung dianggap
 * dekat: pemanggil kembali ke perilaku lama (muat saat mount), bukan tidak pernah memuat.
 * Elemen pada `ref` harus sudah terpasang saat mount (mis. `<section>` yang selalu dirender, termasuk saat kerangka).
 */
export function useNearViewport<T extends Element>(rootMargin: string = NEAR_ROOT_MARGIN): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near];
}
