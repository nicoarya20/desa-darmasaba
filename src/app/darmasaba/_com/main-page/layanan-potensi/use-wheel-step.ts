"use client";
import { useEffect, useRef, type RefObject } from "react";
import { INITIAL_WHEEL_STATE, reduceWheel } from "./gallery.logic";

const LINE_HEIGHT_PX = 16;

/**
 * Geser dua jari trackpad (atau Shift+scroll) di atas elemen → `onStep(±1)`, maksimal 1 kartu per gerakan.
 * Listener non-passive agar `preventDefault` mencegah gestur "Back" browser; scroll vertikal tidak disentuh.
 */
export function useWheelStep(ref: RefObject<HTMLElement | null>, onStep: (delta: -1 | 1) => void, enabled: boolean) {
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let state = INITIAL_WHEEL_STATE;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const deltaX = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaX * LINE_HEIGHT_PX : e.deltaX;
      const result = reduceWheel(state, deltaX, e.timeStamp);
      state = result.state;
      if (result.step !== 0) onStepRef.current(result.step);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, enabled]);
}
