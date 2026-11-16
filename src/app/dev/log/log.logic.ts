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

export const IP_LOCAL_UNKNOWN_LABEL = 'localhost / tidak diketahui';

function isIPv4(ip: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  return !!match && match.slice(1).every((octet) => Number(octet) <= 255);
}

/** IPv6 (penuh atau ringkas, tanpa IPv4 tertanam) → 8 grup angka; null bila tidak valid. */
function parseIPv6(ip: string): number[] | null {
  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
  return groups.map((g) => parseInt(g, 16));
}

/** Bentuk ringkas RFC 5952: tanpa leading zero, run nol terpanjang (≥2 grup, pertama bila seri) jadi "::". */
function compressIPv6(groups: number[]): string {
  let best = -1;
  let bestLen = 1;
  for (let i = 0; i < groups.length; ) {
    if (groups[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < groups.length && groups[j] === 0) j++;
    if (j - i > bestLen) [best, bestLen] = [i, j - i];
    i = j;
  }
  const hex = groups.map((g) => g.toString(16));
  if (best < 0) return hex.join(':');
  return `${hex.slice(0, best).join(':')}::${hex.slice(best + bestLen).join(':')}`;
}

/**
 * IP tersimpan → teks tampilan + hint tooltip. Better Auth menyimpan IPv6 sebagai subnet /64
 * (8 grup expanded), sehingga `::1` lokal menjadi `0000:…:0000`.
 */
export function ipDisplay(ip: string | null): { text: string; hint: string | null } {
  const value = ip?.trim();
  if (!value) return { text: '—', hint: null };
  if (isIPv4(value)) return value.startsWith('127.') ? { text: 'localhost', hint: value } : { text: value, hint: null };
  const groups = parseIPv6(value);
  if (!groups) return { text: value, hint: null };
  if (groups.every((g) => g === 0)) {
    return { text: IP_LOCAL_UNKNOWN_LABEL, hint: 'IPv6 ::/64 — biasanya login dari server lokal (::1) yang disamarkan ke /64' };
  }
  const compact = compressIPv6(groups);
  if (groups.slice(4).every((g) => g === 0)) {
    return { text: `${compact}/64`, hint: `Tersimpan: ${value}. Better Auth menyimpan IPv6 sebagai subnet /64.` };
  }
  return { text: compact, hint: compact === value ? null : `Tersimpan: ${value}` };
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
