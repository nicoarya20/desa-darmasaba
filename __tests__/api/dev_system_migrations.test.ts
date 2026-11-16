// @vitest-environment node
// GET /api/developer/system: tetap khusus role "0" dan menyertakan status migrasi (folder nyata vs _prisma_migrations).
import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const { requireAuthMock, queryRawMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  queryRawMock: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: { NODE_ENV: 'production' } }));
vi.mock('@/lib/prisma', () => ({ default: { $queryRaw: queryRawMock } }));
vi.mock('@/lib/minio', () => ({ default: { bucketExists: vi.fn(async () => true) }, MINIO_BUCKET: 'desa' }));
vi.mock('@/lib/jenna/service', () => ({
  getJennaReadiness: vi.fn(async () => ({ cryptoConfigured: true, enabled: false, ready: false })),
}));

import { systemOverviewGet } from '@/app/api/[[...slugs]]/_lib/developer/system';

const FOLDERS = fs
  .readdirSync(path.join(process.cwd(), 'prisma/migrations'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const isMigrationQuery = (strings: TemplateStringsArray) => strings.join('').includes('_prisma_migrations');

function ctx() {
  const set: { status?: number } = {};
  return { context: { body: {}, params: {}, set } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

let migrationRows: () => Promise<unknown>;

beforeEach(() => {
  vi.clearAllMocks();
  migrationRows = async () =>
    FOLDERS.map((name, i) => ({ migration_name: name, finished_at: new Date(Date.UTC(2026, 0, 1, 0, i)), rolled_back_at: null }));
  queryRawMock.mockImplementation((strings: TemplateStringsArray) =>
    isMigrationQuery(strings) ? migrationRows() : Promise.resolve([{ '?column?': 1 }]),
  );
});

describe('guard GET /system', () => {
  it('tanpa sesi → 401, DB tidak disentuh', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const c = ctx();
    const res = await systemOverviewGet(c.context);
    expect(c.set.status).toBe(401);
    expect(res).toMatchObject({ success: false });
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it.each(['1', '2', '3', '4', '5'])('role %s → 403, DB tidak disentuh', async (roleId) => {
    asUser(roleId);
    const c = ctx();
    const res = await systemOverviewGet(c.context);
    expect(c.set.status).toBe(403);
    expect(res).toMatchObject({ success: false });
    expect(queryRawMock).not.toHaveBeenCalled();
  });
});

describe('migrations di GET /system', () => {
  it('semua folder punya baris sukses → lengkap, terakhir = folder terbaru', async () => {
    asUser('0');
    const res = await systemOverviewGet(ctx().context);
    if (!res.success) throw new Error('unreachable');
    expect(FOLDERS.length).toBeGreaterThan(0);
    expect(res.data.migrations).toEqual({
      ok: true,
      total: FOLDERS.length,
      applied: FOLDERS.length,
      pending: [],
      failed: [],
      latestApplied: FOLDERS[FOLDERS.length - 1],
      latestAppliedAt: new Date(Date.UTC(2026, 0, 1, 0, FOLDERS.length - 1)).toISOString(),
    });
    expect(res.data.database.ok).toBe(true);
  });

  it('migration_lock.toml bukan migrasi', async () => {
    asUser('0');
    const res = await systemOverviewGet(ctx().context);
    if (!res.success || !res.data.migrations.ok) throw new Error('unreachable');
    expect(res.data.migrations.pending).not.toContain('migration_lock.toml');
    expect(res.data.migrations.total).toBe(FOLDERS.length);
  });

  it('tabel migrasi gagal dibaca → ok false, pesan generik, field lain tetap ada', async () => {
    asUser('0');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    migrationRows = async () => {
      throw new Error('connect postgres://user:pw@host failed');
    };
    const res = await systemOverviewGet(ctx().context);
    if (!res.success) throw new Error('unreachable');
    expect(res.data.migrations).toEqual({ ok: false, error: 'Gagal membaca riwayat migrasi dari database.' });
    expect(res.data.database.ok).toBe(true);
    expect(JSON.stringify(res)).not.toContain('pw@host');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('_prisma_migrations'), expect.any(Error));
    warn.mockRestore();
  });

  it('tabel migrasi macet → ok false setelah 5 detik, field lain tetap ada', async () => {
    asUser('0');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      let queried!: () => void;
      const migrationQueried = new Promise<void>((resolve) => (queried = resolve));
      migrationRows = () => {
        queried();
        return new Promise(() => {});
      };
      const pending = systemOverviewGet(ctx().context);
      await migrationQueried;
      await vi.advanceTimersByTimeAsync(5000);
      const res = await pending;
      if (!res.success) throw new Error('unreachable');
      expect(res.data.migrations).toEqual({ ok: false, error: 'Riwayat migrasi tidak terbaca dalam 5 detik.' });
      expect(res.data.database.ok).toBe(true);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('_prisma_migrations'), expect.any(Error));
    } finally {
      vi.useRealTimers();
      warn.mockRestore();
    }
  });
});
