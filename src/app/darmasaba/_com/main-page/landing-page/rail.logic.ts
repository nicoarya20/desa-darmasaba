/** Hitungan murni rel program inovasi: posisi geser → tombol panah dan garis posisi. */

/** Jumlah ubin yang muat penuh di rel (harus sama dengan `--visible-tiles` di programs.module.css). */
export const RAIL_VISIBLE_TILES = 4;
/** Sekali klik panah menggeser sejauh ini (dalam ubin). */
export const RAIL_STEP_TILES = 2;
/** Toleransi piksel pecahan saat membandingkan posisi geser dengan ujung rel. */
const EDGE_TOLERANCE = 2;

export type RailState = {
  /** Isi rel lebih lebar dari bingkainya. */
  scrollable: boolean;
  canPrev: boolean;
  canNext: boolean;
  /** Porsi isi yang sedang terlihat (0–1) = lebar garis posisi. */
  visible: number;
  /** Posisi geser (0 = paling kiri, 1 = paling kanan). */
  progress: number;
};

/** Keadaan rel dari ukuran DOM-nya. */
export function getRailState(scrollLeft: number, clientWidth: number, scrollWidth: number): RailState {
  const max = scrollWidth - clientWidth;
  if (clientWidth <= 0 || max <= EDGE_TOLERANCE) {
    return { scrollable: false, canPrev: false, canNext: false, visible: 1, progress: 0 };
  }
  const left = Math.min(Math.max(scrollLeft, 0), max);
  return {
    scrollable: true,
    canPrev: left > EDGE_TOLERANCE,
    canNext: left < max - EDGE_TOLERANCE,
    visible: clientWidth / scrollWidth,
    progress: left / max,
  };
}

/** Tebakan sebelum DOM terukur (render server): rel bisa digeser bila ubinnya lebih dari yang muat. */
export function getInitialRailState(itemCount: number): RailState {
  const scrollable = itemCount > RAIL_VISIBLE_TILES;
  return {
    scrollable,
    canPrev: false,
    canNext: scrollable,
    visible: scrollable ? RAIL_VISIBLE_TILES / itemCount : 1,
    progress: 0,
  };
}

/** Gaya garis posisi: lebar = porsi terlihat, geser = sisa lintasan × progress (persen terhadap lebarnya sendiri). */
export function getThumbStyle({ visible, progress }: RailState): { width: string; transform: string } {
  const travel = visible > 0 ? ((1 - visible) / visible) * progress * 100 : 0;
  return { width: `${(visible * 100).toFixed(2)}%`, transform: `translateX(${travel.toFixed(2)}%)` };
}
