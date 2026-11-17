import { useLayoutEffect, useRef } from "react";
import { fitTextScale } from "./fit-text.logic";

/**
 * Menjaga teks tetap satu baris: ukuran huruf CSS dipakai bila muat, diperkecil seperlunya bila tidak.
 * `frameRef` = pembungkus yang lebarnya ditentukan tata letak (bukan isi), diamati ukurannya.
 * Teks wajib `white-space: nowrap` dan wadahnya dibatasi `max-width`.
 */
export function useFitText<F extends HTMLElement, T extends HTMLElement>(text: string) {
  const frameRef = useRef<F>(null);
  const textRef = useRef<T>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const el = textRef.current;
    if (!frame || !el) return;

    const fit = () => {
      // Kembali ke ukuran CSS dulu supaya teks bisa membesar lagi saat layar melebar.
      el.style.fontSize = "";
      const scale = fitTextScale(el.clientWidth, el.scrollWidth);
      if (scale < 1) {
        el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * scale}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    // Lebar teks berubah begitu fon web selesai dimuat.
    let active = true;
    void document.fonts?.ready.then(() => active && fit());
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [text]);

  return { frameRef, textRef };
}
