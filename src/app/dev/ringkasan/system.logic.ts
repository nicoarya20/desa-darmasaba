import type { SystemOverviewResponse } from '@/lib/jenna/types';
import type { StatTone } from './_com/StatCard';

/** Detik → "2 hari 3 jam" / "5 jam 12 menit" / "4 menit" / "< 1 menit". */
export function formatUptime(totalSec: number): string {
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return hours > 0 ? `${days} hari ${hours} jam` : `${days} hari`;
  if (hours > 0) return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
  if (minutes > 0) return `${minutes} menit`;
  return '< 1 menit';
}

export const NODE_ENV_LABEL: Record<string, string> = {
  production: 'Production',
  development: 'Development',
  test: 'Test',
};

const relativeFormat = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86400],
  ['month', 30 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** Waktu ISO relatif terhadap `nowIso` → "3 hari yang lalu" / "kemarin"; di bawah semenit "baru saja". */
export function formatRelativeTime(iso: string, nowIso: string): string {
  const diffSec = Math.round((new Date(iso).getTime() - new Date(nowIso).getTime()) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(diffSec) >= size) return relativeFormat.format(Math.trunc(diffSec / size), unit);
  }
  return 'baru saja';
}

/** Isi kartu "Migrasi database"; merah bila ada migrasi gagal atau tertunda. */
export function migrationCard(
  migrations: Readonly<SystemOverviewResponse['migrations']>,
  nowIso: string,
): { value: string; status: { tone: StatTone; label: string }; details: string } {
  if (!migrations.ok) {
    return { value: 'Tidak terbaca', status: { tone: 'warn', label: 'Tidak terbaca' }, details: migrations.error };
  }
  const status: { tone: StatTone; label: string } =
    migrations.failed.length > 0
      ? { tone: 'error', label: 'Gagal' }
      : migrations.pending.length > 0
        ? { tone: 'error', label: 'Tertunda' }
        : { tone: 'ok', label: 'Lengkap' };
  const details =
    migrations.latestApplied && migrations.latestAppliedAt
      ? `Terakhir: ${migrations.latestApplied} (${formatRelativeTime(migrations.latestAppliedAt, nowIso)})`
      : 'Belum ada migrasi yang diterapkan.';
  return { value: `${migrations.applied}/${migrations.total} diterapkan`, status, details };
}
