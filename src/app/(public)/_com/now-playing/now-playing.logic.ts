import { formatTime } from '@/app/context/music/format';

/** Widget desktop hanya tampil bersama navbar desktop: breakpoint md tema Mantine (62em = 992px). */
export const NOW_PLAYING_DESKTOP_QUERY = '(min-width: 62em)';
/** Kartu mengecil jadi pil setelah selama ini tanpa hover/fokus. */
export const NOW_PLAYING_COLLAPSE_MS = 5000;

/** Sisa waktu gaya iPhone, mis. "-1:24". Durasi belum diketahui → "-0:00". */
export function remainingText(currentTime: number, duration: number): string {
  if (!(duration > 0)) return '-0:00';
  return `-${formatTime(Math.max(0, duration - Math.min(currentTime, duration)))}`;
}

/** Keadaan widget: kartu (expanded) atau pil, plus sinyal yang menahan kartu tetap terbuka. */
export interface WidgetState {
  expanded: boolean;
  /** Penunjuk di atas widget. */
  hover: boolean;
  /** Fokus keyboard (:focus-visible) di dalam kartu. */
  focus: boolean;
}

/**
 * - enter/leave, focusin/focusout: sinyal penahan (masuk = buka kartu).
 * - open: klik pil / lagu berganti → kartu.
 * - idle (timer habis) / scroll: mengecil, kecuali sedang disorot atau difokus.
 * - close: paksa mengecil (Escape, room Jenna terbuka), abaikan penahan.
 */
export type WidgetEvent = 'enter' | 'leave' | 'focusin' | 'focusout' | 'open' | 'idle' | 'scroll' | 'close';

export const WIDGET_INITIAL: WidgetState = { expanded: true, hover: false, focus: false };

/** Transisi murni; mengembalikan objek yang sama bila tidak berubah (React melewati render). */
export function widgetReducer(state: WidgetState, event: WidgetEvent): WidgetState {
  const next = ((): WidgetState => {
    switch (event) {
      case 'enter':
        return { ...state, hover: true, expanded: true };
      case 'leave':
        return { ...state, hover: false };
      case 'focusin':
        return { ...state, focus: true, expanded: true };
      case 'focusout':
        return { ...state, focus: false };
      case 'open':
        return { ...state, expanded: true };
      case 'idle':
      case 'scroll':
        return state.hover || state.focus ? state : { ...state, expanded: false };
      case 'close':
        return { ...state, expanded: false, focus: false };
    }
  })();
  const same = next.expanded === state.expanded && next.hover === state.hover && next.focus === state.focus;
  return same ? state : next;
}

/** Timer mengecil berjalan hanya saat kartu terbuka tanpa hover/fokus. */
export const shouldScheduleCollapse = (state: WidgetState): boolean => state.expanded && !state.hover && !state.focus;
