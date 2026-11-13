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
