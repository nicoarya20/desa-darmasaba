const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** ISO string → "13 Nov 2026, 14.37" (zona waktu browser). */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

const numberFormat = new Intl.NumberFormat('id-ID');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

const secondsFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Milidetik → "1,8 dtk"; di bawah satu detik tetap milidetik ("850 ms"); "—" bila tidak tercatat. */
export function formatLatency(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${formatNumber(Math.round(ms))} ms`;
  return `${secondsFormat.format(ms / 1000)} dtk`;
}
