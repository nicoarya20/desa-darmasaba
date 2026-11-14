/** Posisi gulir rak: sudah di ujung kiri (`start`) / kanan (`end`). */
export type ShelfEdges = { start: boolean; end: boolean };

type ScrollMetrics = { scrollLeft: number; clientWidth: number; scrollWidth: number };

/** Selisih px yang dianggap sudah di ujung (pembulatan subpiksel di layar 2x). */
export const EDGE_TOLERANCE = 2;

/**
 * Ujung rak dari ukuran gulir. Nilai sama dengan `prev` → objek `prev` itu sendiri, supaya `setState` tidak
 * merender ulang rak di setiap event scroll/resize.
 */
export function nextEdges(prev: ShelfEdges, m: ScrollMetrics): ShelfEdges {
  const start = m.scrollLeft <= EDGE_TOLERANCE;
  const end = m.scrollLeft + m.clientWidth >= m.scrollWidth - EDGE_TOLERANCE;
  return prev.start === start && prev.end === end ? prev : { start, end };
}
