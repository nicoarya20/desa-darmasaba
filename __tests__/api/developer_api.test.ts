// @vitest-environment node
// Kontrak API /api/developer/*: semua handler khusus role "0" (tanpa sesi 401, role 1-5 403),
// API key tidak pernah ada di respons, simpan key tanpa JENNA_CREDENTIALS_KEY ditolak (fail-closed).
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const KEY = 'c'.repeat(64);
const SECRET = 'sk-ant-secret-1234567890QRST';

const { requireAuthMock, envMock, prismaMock, minioMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  envMock: { NODE_ENV: 'production', JENNA_CREDENTIALS_KEY: '' },
  prismaMock: {
    $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
    jennaSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    jennaProvider: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  },
  minioMock: { bucketExists: vi.fn(async () => true) },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: envMock }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'desa' }));

import {
  jennaConfigGet,
  jennaProviderTest,
  jennaProviderUpdate,
  jennaSettingsUpdate,
} from '@/app/api/[[...slugs]]/_lib/developer/jenna';
import { systemOverviewGet } from '@/app/api/[[...slugs]]/_lib/developer/system';
import { encryptSecret } from '@/lib/jenna/crypto';

function ctx(body: unknown = {}, params: Record<string, string> = {}) {
  const set: { status?: number } = {};
  return { context: { body, params, set } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const HANDLERS = [
  ['GET /jenna', () => jennaConfigGet(ctx().context)],
  ['PUT /jenna/settings', () => jennaSettingsUpdate(ctx({ enabled: true }).context)],
  ['PUT /jenna/providers/:slot', () => jennaProviderUpdate(ctx({ baseUrl: 'https://a.com', model: 'm' }, { slot: 'chat_openai' }).context)],
  ['POST /jenna/providers/:slot/test', () => jennaProviderTest(ctx({}, { slot: 'chat_openai' }).context)],
  ['GET /system', () => systemOverviewGet(ctx().context)],
] as const;

const encRow = () => ({
  slot: 'chat_anthropic',
  baseUrl: 'https://api.anthropic.com',
  apiKeyEnc: encryptSecret(SECRET, KEY),
  apiKeyHint: 'QRST',
  model: 'claude-x',
  temperature: null,
  maxTokens: null,
  reasoningEffort: null,
  timeoutMs: 30000,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
  updatedAt: new Date('2026-11-13T00:00:00Z'),
  updatedById: 'u-0',
});

beforeEach(() => {
  vi.clearAllMocks();
  envMock.JENNA_CREDENTIALS_KEY = '';
  prismaMock.jennaSettings.findUnique.mockResolvedValue(null);
  prismaMock.jennaProvider.findMany.mockResolvedValue([]);
});

describe('guard role developer', () => {
  it.each(HANDLERS)('%s tanpa sesi → 401, DB tidak disentuh', async (_name, call) => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const res = await call();
    expect(res).toEqual({ success: false, message: 'Unauthorized' });
    expect(prismaMock.jennaSettings.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it.each(HANDLERS.flatMap(([name, call]) => ['1', '2', '3', '4', '5'].map((r) => [name, r, call] as const)))(
    '%s role %s → 403',
    async (_name, roleId, call) => {
      asUser(roleId);
      const res = await call();
      expect(res).toMatchObject({ success: false });
      expect(prismaMock.jennaSettings.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.jennaSettings.upsert).not.toHaveBeenCalled();
      expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
    },
  );

  it('status 403 di-set untuk role non-developer', async () => {
    asUser('1');
    const { context, set } = ctx();
    await jennaConfigGet(context);
    expect(set.status).toBe(403);
  });
});

describe('GET /jenna', () => {
  it('respons tidak pernah memuat API key (plaintext maupun terenkripsi)', async () => {
    asUser('0');
    envMock.JENNA_CREDENTIALS_KEY = KEY;
    prismaMock.jennaProvider.findMany.mockResolvedValue([encRow()]);
    const res = await jennaConfigGet(ctx().context);
    const json = JSON.stringify(res);
    expect(json).not.toContain(SECRET);
    expect(json).not.toContain('apiKeyEnc');
    expect(json).not.toContain('v1:');
    expect(res).toMatchObject({ success: true, data: { cryptoConfigured: true, updatedBy: null } });
    if (!res.success) throw new Error('unreachable');
    expect(res.data.providers.find((p) => p.slot === 'chat_anthropic')).toMatchObject({ hasApiKey: true, apiKeyHint: 'QRST', ready: true });
  });
});

describe('PUT /jenna/settings', () => {
  it('body tidak valid → 400, DB tidak disentuh', async () => {
    asUser('0');
    const { context, set } = ctx({ rateLimitPerMinute: 0 });
    const res = await jennaSettingsUpdate(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.jennaSettings.upsert).not.toHaveBeenCalled();
  });

  it('valid → upsert singleton dengan updatedById', async () => {
    asUser('0');
    await jennaSettingsUpdate(ctx({ enabled: true, assistantName: ' Jenna ' }).context);
    expect(prismaMock.jennaSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'global' },
        update: { enabled: true, assistantName: 'Jenna', updatedById: 'u-0' },
      }),
    );
  });
});

describe('PUT /jenna/providers/:slot', () => {
  const body = { baseUrl: 'https://api.anthropic.com/', model: 'claude-x', apiKey: SECRET };

  it('slot tak dikenal → 404', async () => {
    asUser('0');
    const { context, set } = ctx(body, { slot: 'voice' });
    await jennaProviderUpdate(context);
    expect(set.status).toBe(404);
  });

  it('fail-closed: apiKey dikirim tanpa JENNA_CREDENTIALS_KEY → 400, tidak disimpan', async () => {
    asUser('0');
    const { context, set } = ctx(body, { slot: 'chat_anthropic' });
    const res = await jennaProviderUpdate(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('JENNA_CREDENTIALS_KEY') });
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
  });

  it('dengan kunci: key disimpan terenkripsi + hint, hasil tes di-reset', async () => {
    asUser('0');
    envMock.JENNA_CREDENTIALS_KEY = KEY;
    await jennaProviderUpdate(ctx(body, { slot: 'chat_anthropic' }).context);
    const arg = prismaMock.jennaProvider.upsert.mock.calls[0][0] as { update: Record<string, unknown> };
    expect(JSON.stringify(arg)).not.toContain(SECRET);
    expect(arg.update).toMatchObject({
      baseUrl: 'https://api.anthropic.com',
      apiKeyHint: 'QRST',
      lastTestAt: null,
      lastTestOk: null,
      updatedById: 'u-0',
    });
    expect(String(arg.update.apiKeyEnc).startsWith('v1:')).toBe(true);
  });

  it('apiKey kosong → kunci lama dipertahankan (field key tidak ikut di-update)', async () => {
    asUser('0');
    await jennaProviderUpdate(ctx({ ...body, apiKey: '' }, { slot: 'chat_anthropic' }).context);
    const arg = prismaMock.jennaProvider.upsert.mock.calls[0][0] as { update: Record<string, unknown> };
    expect(arg.update).not.toHaveProperty('apiKeyEnc');
    expect(arg.update).not.toHaveProperty('apiKeyHint');
  });

  it('reasoningEffort: disimpan untuk chat_openai, dipaksa null untuk chat_anthropic, nilai asing → 400', async () => {
    asUser('0');
    const openai = { baseUrl: 'https://api.openai.com/v1', model: 'gpt-6-luna' };
    await jennaProviderUpdate(ctx({ ...openai, reasoningEffort: 'none' }, { slot: 'chat_openai' }).context);
    await jennaProviderUpdate(ctx({ ...body, apiKey: '', reasoningEffort: 'low' }, { slot: 'chat_anthropic' }).context);
    await jennaProviderUpdate(ctx({ ...openai, reasoningEffort: '' }, { slot: 'chat_openai' }).context);
    const updates = prismaMock.jennaProvider.upsert.mock.calls.map((c) => (c[0] as { update: Record<string, unknown> }).update);
    expect(updates.map((u) => u.reasoningEffort)).toEqual(['none', null, null]);

    const { context, set } = ctx({ ...openai, reasoningEffort: 'turbo' }, { slot: 'chat_openai' });
    const res = await jennaProviderUpdate(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('Reasoning effort') });
    expect(prismaMock.jennaProvider.upsert).toHaveBeenCalledTimes(3);
  });
});

describe('POST /jenna/providers/:slot/test', () => {
  it('slot belum disimpan → 400 tanpa fetch', async () => {
    asUser('0');
    prismaMock.jennaProvider.findUnique.mockResolvedValue(null);
    const { context, set } = ctx({}, { slot: 'chat_openai' });
    await jennaProviderTest(context);
    expect(set.status).toBe(400);
  });

  it('kunci enkripsi hilang → hasil gagal disimpan, tanpa fetch & tanpa bocor key', async () => {
    asUser('0');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    prismaMock.jennaProvider.findUnique.mockResolvedValue(encRow());
    prismaMock.jennaProvider.update.mockImplementation(async ({ data }: { data: object }) => ({ ...encRow(), ...data }));
    const res = await jennaProviderTest(ctx({}, { slot: 'chat_anthropic' }).context);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(res).toMatchObject({ success: true, data: { ok: false } });
    expect(prismaMock.jennaProvider.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastTestOk: false }) }),
    );
    expect(JSON.stringify(res)).not.toContain(SECRET);
    fetchSpy.mockRestore();
  });
});

describe('GET /system', () => {
  it('ringkasan: DB & MinIO ok, env hanya nama+set', async () => {
    asUser('0');
    process.env.JENNA_TEST_SENTINEL = 'nilai-rahasia';
    const res = await systemOverviewGet(ctx().context);
    expect(res).toMatchObject({
      success: true,
      data: {
        nodeEnv: 'production',
        database: { ok: true, error: null },
        minio: { ok: true, bucket: 'desa' },
        jenna: { cryptoConfigured: false, enabled: false, ready: false },
      },
    });
    if (!res.success) throw new Error('unreachable');
    expect(typeof res.data.version).toBe('string');
    expect(res.data.env.every((e) => Object.keys(e).sort().join() === 'name,set')).toBe(true);
    expect(JSON.stringify(res)).not.toContain('nilai-rahasia');
    delete process.env.JENNA_TEST_SENTINEL;
  });

  it('DB gagal → ok false dengan pesan generik (tanpa detail driver)', async () => {
    asUser('0');
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error('connect postgres://user:pw@host failed'));
    const res = await systemOverviewGet(ctx().context);
    if (!res.success) throw new Error('unreachable');
    expect(res.data.database.ok).toBe(false);
    expect(JSON.stringify(res)).not.toContain('pw@host');
  });
});
