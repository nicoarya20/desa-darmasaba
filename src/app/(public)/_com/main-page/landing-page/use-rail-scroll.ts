import { useCallback, useEffect, useRef, useState } from "react";
import { getInitialRailState, getRailState, getThumbStyle, RAIL_STEP_TILES } from "./rail.logic";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Menghubungkan rel geser dengan tombol panah dan garis posisinya. */
export function useRailScroll(itemCount: number) {
  const railRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState(() => getInitialRailState(itemCount));

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const sync = () => {
      const next = getRailState(rail.scrollLeft, rail.clientWidth, rail.scrollWidth);
      // Garis posisi ditulis langsung ke DOM: ikut tiap frame geser tanpa render ulang React.
      if (thumbRef.current) Object.assign(thumbRef.current.style, getThumbStyle(next));
      setState((prev) =>
        prev.scrollable === next.scrollable && prev.canPrev === next.canPrev && prev.canNext === next.canNext
          ? prev
          : next,
      );
    };

    sync();
    rail.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [itemCount]);

  const step = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild;
    if (!rail || !first) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const distance = (first.getBoundingClientRect().width + gap) * RAIL_STEP_TILES;
    const behavior = window.matchMedia(REDUCED_MOTION).matches ? "auto" : "smooth";
    rail.scrollBy({ left: direction * distance, behavior });
  }, []);

  return { railRef, thumbRef, state, step };
}
