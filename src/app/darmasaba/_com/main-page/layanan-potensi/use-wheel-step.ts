"use client";
import { useEffect, useRef, type RefObject } from "react";
import { INITIAL_WHEEL_STATE, reduceWheel } from "./gallery.logic";

const LINE_HEIGHT_PX = 16;

/**
 * Geser dua jari trackpad (atau Shift+scroll) di atas elemen → `onStep(±1)`, maksimal 1 kartu per gerakan.
 *
 * Mencegah gestur "Back" browser dengan dua lapis:
 * 1. `overscroll-behavior-x: none` di <html> selama kursor di atas elemen. Ini lapis utama: Chrome hanya
 *    mengizinkan preventDefault pada event wheel PERTAMA satu gerakan; bila event pertama lolos (gerak awal
 *    kecil/miring), sisanya `cancelable: false` dan Back tetap jalan. Di luar galeri gestur Back normal.
 * 2. `preventDefault` pada event yang dominan horizontal (untuk browser yang tidak memakai overscroll-behavior).
 * Scroll vertikal tidak disentuh.
 */
export function useWheelStep(ref: RefObject<HTMLElement | null>, onStep: (delta: -1 | 1) => void, enabled: boolean) {
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const root = document.documentElement;
    let state = INITIAL_WHEEL_STATE;

    const lockBackGesture = () => {
      root.style.overscrollBehaviorX = "none";
    };
    // Hapus nilai inline (bukan simpan-pulihkan): dua baris galeri berbagi <html>, nilai "lama" bisa
    // ikut tertangkap sebagai "none". Tidak ada kode lain yang memasang nilai inline ini.
    const releaseBackGesture = () => {
      root.style.removeProperty("overscroll-behavior-x");
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (e.cancelable) e.preventDefault();
      const deltaX = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaX * LINE_HEIGHT_PX : e.deltaX;
      const result = reduceWheel(state, deltaX, e.timeStamp);
      state = result.state;
      if (result.step !== 0) onStepRef.current(result.step);
    };

    if (el.matches(":hover")) lockBackGesture();
    el.addEventListener("pointerenter", lockBackGesture);
    el.addEventListener("pointerleave", releaseBackGesture);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerenter", lockBackGesture);
      el.removeEventListener("pointerleave", releaseBackGesture);
      el.removeEventListener("wheel", onWheel);
      releaseBackGesture();
    };
  }, [ref, enabled]);
}
