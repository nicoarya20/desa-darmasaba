import { useCallback, useEffect, useState, type RefObject } from "react";
import { stepPhoto } from "./program-overlay.logic";

type ViewerState = { key: string | null; index: number | null; returnTo: { index: number } | null };

/**
 * Tampilan besar foto di dalam overlay: indeks aktif (null = detail), buka, kembali, sebelumnya/berikutnya.
 * Reset saat `resetKey` (id program; null = tertutup) berganti. Saat kembali, fokus pindah ke foto asal di
 * galeri (`[data-photo-index]` di dalam `containerRef`).
 */
export function usePhotoViewer(resetKey: string | null, total: number, containerRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<ViewerState>({ key: resetKey, index: null, returnTo: null });
  if (state.key !== resetKey) setState({ key: resetKey, index: null, returnTo: null });

  const index = state.key === resetKey && state.index !== null && state.index < total ? state.index : null;

  useEffect(() => {
    if (!state.returnTo) return;
    containerRef.current?.querySelector<HTMLElement>(`[data-photo-index="${state.returnTo.index}"]`)?.focus();
  }, [state.returnTo, containerRef]);

  const open = useCallback((i: number) => setState({ key: resetKey, index: i, returnTo: null }), [resetKey]);
  const back = useCallback(
    () => setState((s) => ({ ...s, index: null, returnTo: s.index === null ? null : { index: s.index } })),
    [],
  );
  const step = useCallback(
    (delta: -1 | 1) => setState((s) => (s.index === null ? s : { ...s, index: stepPhoto(s.index, delta, total) })),
    [total],
  );

  return { index, open, back, step };
}
