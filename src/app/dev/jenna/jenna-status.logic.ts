/**
 * Alasan widget Jenna tersembunyi di website publik, atau null bila tampil. Sama dengan syarat
 * GET /api/jenna/status: aktif && provider aktif siap && kuota token harian > 0.
 */
export function publicWidgetHiddenReason(s: {
  enabled: boolean;
  providerReady: boolean;
  dailyTokensGlobal: number;
}): string | null {
  const prefix = 'Widget Jenna tersembunyi di website publik:';
  if (!s.enabled) return `${prefix} Jenna sedang nonaktif.`;
  if (!s.providerReady) return `${prefix} provider aktif belum siap.`;
  if (s.dailyTokensGlobal <= 0) return `${prefix} kuota token harian masih 0 (atur di Batas Pemakaian).`;
  return null;
}
