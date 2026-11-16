import type { LoginLogResult } from '@/lib/login-log';

/** Nama role (tabel Role, lihat src/lib/auth-policy.ts). */
const ROLE_LABELS: Record<string, string> = {
  '0': 'Developer',
  '1': 'Super Admin',
  '2': 'Admin Desa',
  '3': 'Admin Kesehatan',
  '4': 'Admin Pendidikan',
  '5': 'User',
};

export function roleLabel(roleId: string | null): string {
  if (roleId === null) return '—';
  return Object.hasOwn(ROLE_LABELS, roleId) ? ROLE_LABELS[roleId] : `Role ${roleId}`;
}

export const LOGIN_RESULT_LABELS: Record<LoginLogResult, string> = {
  success: 'Berhasil',
  blocked_inactive: 'Ditolak: akun nonaktif',
};

export function loginResultLabel(result: string): string {
  return Object.hasOwn(LOGIN_RESULT_LABELS, result) ? LOGIN_RESULT_LABELS[result as LoginLogResult] : result;
}

export const loginResultColor = (result: string) => (result === 'success' ? 'green' : 'red');

// Urutan penting: Edge/Opera/Samsung memuat "Chrome", Chrome memuat "Safari".
const BROWSERS: [RegExp, string][] = [
  [/\bEdg(?:e|A|iOS)?\//, 'Edge'],
  [/\b(?:OPR|Opera)\//, 'Opera'],
  [/\bSamsungBrowser\//, 'Samsung Internet'],
  [/\b(?:Firefox|FxiOS)\//, 'Firefox'],
  [/\b(?:Chrome|CriOS)\//, 'Chrome'],
  [/\bVersion\/[\d.]+.*\bSafari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/\bWindows NT\b/, 'Windows'],
  [/\b(?:iPhone|iPad|iPod)\b/, 'iOS'],
  [/\bAndroid\b/, 'Android'],
  [/\bCrOS\b/, 'ChromeOS'],
  [/\b(?:Macintosh|Mac OS X)\b/, 'macOS'],
  [/\bLinux\b/, 'Linux'],
];

const firstMatch = (ua: string, rules: [RegExp, string][]) => rules.find(([re]) => re.test(ua))?.[1] ?? null;

/** User-Agent mentah → "Chrome · Windows"; "—" bila kosong, "Tidak dikenal" bila tak terbaca. */
export function deviceLabel(userAgent: string | null): string {
  if (!userAgent?.trim()) return '—';
  const parts = [firstMatch(userAgent, BROWSERS), firstMatch(userAgent, SYSTEMS)].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Tidak dikenal';
}

/** Nilai DatePickerInput range ("YYYY-MM-DD", zona browser) → batas inklusif from/to untuk API. */
export type DateRange = [string | null, string | null];

function localDay(value: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? [Number(match[1]), Number(match[2]) - 1, Number(match[3])] : null;
}

export function dateRangeParams([start, end]: DateRange): { from?: string; to?: string } {
  const out: { from?: string; to?: string } = {};
  const s = start ? localDay(start) : null;
  // Rentang setengah jadi (baru pilih tanggal awal) = satu hari itu saja.
  const e = end ? localDay(end) : s;
  if (s) out.from = new Date(s[0], s[1], s[2]).toISOString();
  if (e) out.to = new Date(e[0], e[1], e[2], 23, 59, 59, 999).toISOString();
  return out;
}

/** Query string daftar log; nilai kosong tidak dikirim. */
export function logListQuery(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) search.set(key, text);
  }
  return search.toString();
}

/** `meta` audit → JSON terformat; null bila tidak ada isi. */
export function formatAuditMeta(meta: unknown): string | null {
  if (meta === null || meta === undefined) return null;
  if (typeof meta === 'object' && Object.keys(meta).length === 0) return null;
  return JSON.stringify(meta, null, 2);
}
