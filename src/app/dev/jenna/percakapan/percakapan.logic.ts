import { formatNumber } from '../../_com/format';

export type UsageTone = 'ok' | 'warn' | 'error' | 'neutral';

export type TokenBudgetUsage = {
  /** 0–100, untuk lebar progress bar. */
  percent: number;
  tone: UsageTone;
  label: string;
};

const WARN_AT = 80;

/** Pemakaian token hari ini terhadap kuota harian. Kuota 0 = Jenna tidak aktif di website publik. */
export function tokenBudgetUsage(used: number, budget: number): TokenBudgetUsage {
  if (budget <= 0) {
    return { percent: 0, tone: 'neutral', label: 'Kuota token 0 — Jenna tidak aktif di website publik.' };
  }
  const raw = (used / budget) * 100;
  const percent = Math.min(100, Math.max(0, raw));
  const tone: UsageTone = raw >= 100 ? 'error' : raw >= WARN_AT ? 'warn' : 'ok';
  const shown = raw > 0 && raw < 1 ? '<1' : formatNumber(Math.floor(raw));
  return { percent, tone, label: `dari ${formatNumber(budget)} token (${shown}%)` };
}

export const pageCount = (total: number, limit: number) => Math.max(1, Math.ceil(total / limit));

/** "21–40 dari 57"; "0 dari 0" bila kosong. */
export function rangeLabel(page: number, limit: number, total: number): string {
  if (total === 0) return '0 dari 0';
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return `${formatNumber(from)}–${formatNumber(to)} dari ${formatNumber(total)}`;
}

/** Setelah hapus item terakhir di halaman terakhir, mundur satu halaman. */
export function pageAfterDelete(page: number, limit: number, totalAfter: number): number {
  return Math.min(page, pageCount(totalAfter, limit));
}

const ERROR_LABELS: Record<string, string> = {
  timeout: 'Waktu habis',
  client_closed: 'Pengunjung menutup sebelum selesai',
  internal: 'Galat internal',
};

/** errorCode persist (`timeout`, `client_closed`, `internal`, `provider_<jenis>`) → label singkat. */
export function errorCodeLabel(code: string | null): string {
  if (!code) return 'Gagal';
  if (ERROR_LABELS[code]) return ERROR_LABELS[code];
  if (code.startsWith('provider_')) return `Galat provider (${code.slice('provider_'.length)})`;
  return code;
}
