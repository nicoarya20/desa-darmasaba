"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

/** Jarak (px) dari tepi layar saat foto galeri mulai dimuat, cukup jauh agar foto siap sebelum section terlihat. */
export const NEAR_ROOT_MARGIN = "600px 0px";

/**
 * `true` (sekali, lalu tetap) setelah elemen pada `ref` mendekati layar. Sebelum itu (juga bila browser tanpa
 * IntersectionObserver) nilainya `false`, sehingga pemanggil jatuh ke perilaku lazy bawaan browser.
 */
export function useNearViewport<T extends Element>(rootMargin: string = NEAR_ROOT_MARGIN): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near || typeof IntersectionObserver === "undefined") return;
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
