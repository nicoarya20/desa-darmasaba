// @vitest-environment node
// Logika murni Ringkasan Sistem: diff status migrasi, daftar "Perlu perhatian", kartu migrasi.
import { describe, expect, it } from 'vitest';
import { diffMigrations, type MigrationRow } from '@/app/api/[[...slugs]]/_lib/developer/migration-status';
import { buildDevWarnings } from '@/app/dev/ringkasan/dev-warnings.logic';
import { formatRelativeTime, migrationCard } from '@/app/dev/ringkasan/system.logic';
import type { SystemOverviewResponse } from '@/lib/jenna/types';

const at = (iso: string) => new Date(iso);
const done = (name: string, iso = '2026-11-01T00:00:00Z'): MigrationRow => ({
  migration_name: name,
  finished_at: at(iso),
  rolled_back_at: null,
});

describe('diffMigrations', () => {
  it('semua diterapkan → tanpa pending/failed, terakhir = finished_at paling baru', () => {
    const res = diffMigrations(
      ['b_second', 'a_first'],
      [done('a_first', '2026-11-01T00:00:00Z'), done('b_second', '2026-11-02T00:00:00Z')],
    );
    expect(res).toEqual({
      ok: true,
      total: 2,
      applied: 2,
      pending: [],
      failed: [],
      latestApplied: 'b_second',
      latestAppliedAt: '2026-11-02T00:00:00.000Z',
    });
  });

  it('folder tanpa baris sukses → pending terurut', () => {
    const res = diffMigrations(['c', 'a', 'b'], [done('a')]);
    expect(res).toMatchObject({ ok: true, total: 3, applied: 1, pending: ['b', 'c'], failed: [] });
  });

  it('finished_at & rolled_back_at null → failed, tidak dihitung pending', () => {
    const res = diffMigrations(['a', 'b'], [done('a'), { migration_name: 'b', finished_at: null, rolled_back_at: null }]);
    expect(res).toMatchObject({ applied: 1, pending: [], failed: ['b'], latestApplied: 'a' });
  });

  it('rolled back lalu diterapkan ulang → diterapkan, bukan failed', () => {
    const res = diffMigrations(
      ['a'],
      [
        { migration_name: 'a', finished_at: null, rolled_back_at: at('2026-11-01T00:00:00Z') },
        done('a', '2026-11-03T00:00:00Z'),
      ],
    );
    expect(res).toMatchObject({ applied: 1, pending: [], failed: [], latestAppliedAt: '2026-11-03T00:00:00.000Z' });
  });

  it('hanya rolled back → tetap pending', () => {
    const res = diffMigrations(['a'], [{ migration_name: 'a', finished_at: at('2026-11-01T00:00:00Z'), rolled_back_at: at('2026-11-02T00:00:00Z') }]);
    expect(res).toMatchObject({ applied: 0, pending: ['a'], failed: [], latestApplied: null, latestAppliedAt: null });
  });

  it('folder kosong & tabel kosong → nol semua', () => {
    expect(diffMigrations([], [])).toEqual({
      ok: true,
      total: 0,
      applied: 0,
      pending: [],
      failed: [],
      latestApplied: null,
      latestAppliedAt: null,
    });
  });
});

const healthy = (): SystemOverviewResponse => ({
  version: '0.1.288',
  nodeEnv: 'production',
  uptimeSec: 100,
  database: { ok: true, latencyMs: 3, error: null },
  minio: { ok: true, latencyMs: 5, error: null, bucket: 'desa' },
  env: [
    { name: 'DATABASE_URL', set: true, required: true },
    { name: 'MINIO_BUCKET', set: true, required: true },
  ],
  jenna: { cryptoConfigured: true, enabled: true, ready: true },
  migrations: {
    ok: true,
    total: 2,
    applied: 2,
    pending: [],
    failed: [],
    latestApplied: 'b',
    latestAppliedAt: '2026-11-14T00:00:00.000Z',
  },
  generatedAt: '2026-11-16T00:00:00.000Z',
});

const ids = (s: SystemOverviewResponse) => buildDevWarnings(s).map((w) => w.id);

describe('buildDevWarnings', () => {
  it('semua sehat → kosong', () => {
    expect(buildDevWarnings(healthy())).toEqual([]);
  });

  it('database gagal → danger dengan pesan generik dari server', () => {
    const s = healthy();
    s.database = { ok: false, latencyMs: 5000, error: 'Gagal terhubung ke database.' };
    expect(buildDevWarnings(s)).toEqual([
      expect.objectContaining({ id: 'database', severity: 'danger', detail: 'Gagal terhubung ke database.' }),
    ]);
  });

  it('MinIO gagal → danger', () => {
    const s = healthy();
    s.minio = { ok: false, latencyMs: 0, error: 'MINIO_BUCKET belum diset.', bucket: '' };
    expect(buildDevWarnings(s)).toEqual([expect.objectContaining({ id: 'minio', severity: 'danger' })]);
  });

  it('env wajib belum diatur → warning menyebut nama env wajib saja', () => {
    const s = healthy();
    s.env = [
      { name: 'DATABASE_URL', set: true, required: true },
      { name: 'GOOGLE_CLIENT_ID', set: false, required: true },
      { name: 'DEVELOPER_EMAIL', set: false, required: false },
      { name: 'MINIO_BUCKET', set: false, required: true },
    ];
    const [w] = buildDevWarnings(s);
    expect(w).toMatchObject({ id: 'env-missing', severity: 'warning' });
    expect(w.detail).toBe('Belum diatur: GOOGLE_CLIENT_ID, MINIO_BUCKET.');
  });

  it('env opsional kosong → bukan peringatan', () => {
    const s = healthy();
    s.env = [
      { name: 'DATABASE_URL', set: true, required: true },
      ...['SUPER_ADMIN_EMAIL', 'DEVELOPER_EMAIL', 'MINIO_USE_SSL', 'JENNA_CREDENTIALS_KEY', 'NEXT_PUBLIC_BASE_URL'].map(
        (name) => ({ name, set: false, required: false }),
      ),
    ];
    expect(buildDevWarnings(s)).toEqual([]);
  });

  it('kunci enkripsi Jenna belum ada → warning', () => {
    const s = healthy();
    s.jenna = { cryptoConfigured: false, enabled: false, ready: false };
    expect(ids(s)).toEqual(['jenna-crypto']);
  });

  it('Jenna aktif tapi tidak siap → warning dengan tautan provider', () => {
    const s = healthy();
    s.jenna = { cryptoConfigured: true, enabled: true, ready: false };
    expect(buildDevWarnings(s)).toEqual([
      expect.objectContaining({ id: 'jenna-not-ready', severity: 'warning', href: '/dev/jenna/provider' }),
    ]);
  });

  it('Jenna nonaktif & tidak siap → bukan peringatan', () => {
    const s = healthy();
    s.jenna = { cryptoConfigured: true, enabled: false, ready: false };
    expect(ids(s)).toEqual([]);
  });

  it('migrasi gagal → danger menyebut nama', () => {
    const s = healthy();
    s.migrations = { ...healthy().migrations, failed: ['20261116_audit'] } as SystemOverviewResponse['migrations'];
    const [w] = buildDevWarnings(s);
    expect(w).toMatchObject({ id: 'migrations-failed', severity: 'danger' });
    expect(w.detail).toContain('20261116_audit');
  });

  it('migrasi tertunda → warning menyebut jumlah + nama pertama', () => {
    const s = healthy();
    s.migrations = { ...healthy().migrations, pending: ['m1', 'm2', 'm3'] } as SystemOverviewResponse['migrations'];
    const [w] = buildDevWarnings(s);
    expect(w).toMatchObject({ id: 'migrations-pending', severity: 'warning' });
    expect(w.detail).toBe('3 migrasi belum diterapkan, mulai dari m1.');
  });

  it('satu migrasi tertunda → kalimat tunggal', () => {
    const s = healthy();
    s.migrations = { ...healthy().migrations, pending: ['m1'] } as SystemOverviewResponse['migrations'];
    expect(buildDevWarnings(s)[0].detail).toBe('Migrasi m1 belum diterapkan.');
  });

  it('status migrasi tidak terbaca → warning', () => {
    const s = healthy();
    s.migrations = { ok: false, error: 'Gagal membaca riwayat migrasi dari database.' };
    expect(buildDevWarnings(s)).toEqual([
      expect.objectContaining({ id: 'migrations-unreadable', severity: 'warning', detail: 'Gagal membaca riwayat migrasi dari database.' }),
    ]);
  });

  it('danger selalu di atas warning', () => {
    const s = healthy();
    s.env = [{ name: 'DATABASE_URL', set: false, required: true }];
    s.jenna = { cryptoConfigured: false, enabled: true, ready: false };
    s.migrations = { ...healthy().migrations, pending: ['m1'], failed: ['m0'] } as SystemOverviewResponse['migrations'];
    s.database = { ok: false, latencyMs: 1, error: 'x' };
    s.minio = { ok: false, latencyMs: 1, error: 'y', bucket: 'desa' };
    expect(ids(s)).toEqual([
      'database',
      'minio',
      'migrations-failed',
      'migrations-pending',
      'env-missing',
      'jenna-crypto',
      'jenna-not-ready',
    ]);
  });
});

describe('formatRelativeTime', () => {
  const now = '2026-11-16T12:00:00Z';
  it('di bawah semenit → baru saja', () => {
    expect(formatRelativeTime('2026-11-16T11:59:30Z', now)).toBe('baru saja');
  });
  it('menit, jam, hari dalam bahasa Indonesia', () => {
    expect(formatRelativeTime('2026-11-16T11:55:00Z', now)).toBe('5 menit yang lalu');
    expect(formatRelativeTime('2026-11-16T09:00:00Z', now)).toBe('3 jam yang lalu');
    expect(formatRelativeTime('2026-11-13T12:00:00Z', now)).toBe('3 hari yang lalu');
  });
});

describe('migrationCard', () => {
  const now = '2026-11-19T00:00:00.000Z';
  it('lengkap → hijau, "2/2 diterapkan", nama + waktu relatif', () => {
    expect(migrationCard(healthy().migrations, now)).toEqual({
      value: '2/2 diterapkan',
      status: { tone: 'ok', label: 'Lengkap' },
      details: 'Terakhir: b (5 hari yang lalu)',
    });
  });
  it('tertunda atau gagal → merah', () => {
    const pending = { ...healthy().migrations, applied: 1, pending: ['c'] } as SystemOverviewResponse['migrations'];
    expect(migrationCard(pending, now)).toMatchObject({ value: '1/2 diterapkan', status: { tone: 'error', label: 'Tertunda' } });
    const failed = { ...healthy().migrations, failed: ['c'] } as SystemOverviewResponse['migrations'];
    expect(migrationCard(failed, now).status).toEqual({ tone: 'error', label: 'Gagal' });
  });
  it('tidak terbaca → pesan error server', () => {
    expect(migrationCard({ ok: false, error: 'Folder migrasi tidak ditemukan di server.' }, now)).toEqual({
      value: 'Tidak terbaca',
      status: { tone: 'warn', label: 'Tidak terbaca' },
      details: 'Folder migrasi tidak ditemukan di server.',
    });
  });
});
