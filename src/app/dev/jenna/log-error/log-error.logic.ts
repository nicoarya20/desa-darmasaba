import type { JennaErrorLogDays, JennaErrorLogItem, JennaErrorLogResponse } from '@/lib/jenna/usage-types';

export const ERROR_LOG_DEFAULT_DAYS: JennaErrorLogDays = 7;

export const ERROR_LOG_RANGES: readonly { days: JennaErrorLogDays; label: string }[] = [
  { days: 1, label: '24 jam' },
  { days: 7, label: '7 hari' },
  { days: 30, label: '30 hari' },
];

/** Nilai SegmentedControl (string) → rentang hari; null bila bukan salah satu pilihan. */
export function parseErrorLogDays(value: string): JennaErrorLogDays | null {
  return ERROR_LOG_RANGES.find((range) => String(range.days) === value)?.days ?? null;
}

export type ErrorLogState = {
  days: JennaErrorLogDays;
  /** null = rentang ini belum pernah berhasil dimuat. */
  items: JennaErrorLogItem[] | null;
  nextCursor: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  moreError: string | null;
};

export const initialErrorLog = (): ErrorLogState => ({
  days: ERROR_LOG_DEFAULT_DAYS,
  items: null,
  nextCursor: null,
  loading: false,
  loadingMore: false,
  error: null,
  moreError: null,
});

/** Mulai memuat halaman pertama. Ganti rentang → daftar lama dibuang; rentang sama → daftar lama tetap tampil. */
export function beginLoad(state: ErrorLogState, days: JennaErrorLogDays): ErrorLogState {
  const sameRange = days === state.days;
  return {
    days,
    items: sameRange ? state.items : null,
    nextCursor: sameRange ? state.nextCursor : null,
    loading: true,
    loadingMore: false,
    error: null,
    moreError: null,
  };
}

export function loadSucceeded(state: ErrorLogState, res: JennaErrorLogResponse): ErrorLogState {
  return { ...state, items: res.items, nextCursor: res.nextCursor, loading: false };
}

export function loadFailed(state: ErrorLogState, message: string): ErrorLogState {
  return { ...state, loading: false, error: message };
}

export function canLoadMore(state: ErrorLogState): boolean {
  return state.items !== null && state.nextCursor !== null && !state.loading && !state.loadingMore;
}

export function beginLoadMore(state: ErrorLogState): ErrorLogState {
  return { ...state, loadingMore: true, moreError: null };
}

export function loadMoreSucceeded(state: ErrorLogState, res: JennaErrorLogResponse): ErrorLogState {
  return { ...state, items: [...(state.items ?? []), ...res.items], nextCursor: res.nextCursor, loadingMore: false };
}

/** Kursor dipertahankan supaya "Muat lebih banyak" bisa dicoba lagi. */
export function loadMoreFailed(state: ErrorLogState, message: string): ErrorLogState {
  return { ...state, loadingMore: false, moreError: message };
}

/** Query string endpoint log error; `limit` mengikuti bawaan server. */
export function errorLogQuery(days: JennaErrorLogDays, cursor: string | null): string {
  const params = new URLSearchParams({ days: String(days) });
  if (cursor) params.set('cursor', cursor);
  return params.toString();
}
