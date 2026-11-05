"use client";
import { useCallback, useEffect, useState } from "react";
import { loopStart, normalizeLoopIndex, realIndex } from "./gallery.logic";

/** `position` = langkah kumulatif yang tak pernah dinormalkan (kunci titik indikator agar tetap bergeser mulus). */
type LoopState = { index: number; animate: boolean; count: number; position: number };

/** State satu baris galeri loop: indeks track aktif + langkah maju/mundur/lompat. */
export function useLoopCarousel(count: number, reducedMotion: boolean) {
  const start = loopStart(count);
  const [state, setState] = useState<LoopState>({ index: start, animate: false, count, position: 0 });

  // Data datang setelah mount (count 0 → n): reset ke salinan tengah saat render, bukan lewat effect.
  if (state.count !== count) {
    setState({ index: start, animate: false, count, position: 0 });
  }

  const step = useCallback(
    (delta: number) => {
      if (count <= 1 || delta === 0) return;
      setState((s) =>
        // Tanpa transisi (reduced motion) `transitionend` tak pernah datang → normalkan langsung.
        reducedMotion
          ? { ...s, index: normalizeLoopIndex(s.index + delta, count), animate: false, position: s.position + delta }
          : { ...s, index: s.index + delta, animate: true, position: s.position + delta },
      );
    },
    [count, reducedMotion],
  );

  const goTo = useCallback(
    (target: number) => {
      if (count <= 1) return;
      setState((s) => {
        const delta = target - realIndex(s.index, count);
        return { ...s, index: s.index + delta, animate: !reducedMotion, position: s.position + delta };
      });
    },
    [count, reducedMotion],
  );

  /** Setelah transisi selesai, lompat diam-diam ke salinan tengah agar loop tak berujung. */
  const settle = useCallback(() => {
    setState((s) => {
      const normalized = normalizeLoopIndex(s.index, count);
      return normalized === s.index ? s : { ...s, index: normalized, animate: false };
    });
  }, [count]);

  // Nyalakan lagi transisi dua frame setelah lompatan tanpa animasi (agar lompatan sempat dilukis).
  useEffect(() => {
    if (state.animate || reducedMotion) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setState((s) => ({ ...s, animate: true })));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [state.animate, reducedMotion]);

  return {
    index: state.index,
    animate: state.animate && !reducedMotion,
    active: realIndex(state.index, count),
    position: state.position,
    step,
    goTo,
    settle,
  };
}

export type LoopCarousel = ReturnType<typeof useLoopCarousel>;
