// @vitest-environment node
// /api/developer/jenna/{usage,errors}: khusus role "0", hitungan jendela 24 jam & 7 hari (termasuk
// dibatalkan dan avgLatencyMs null), validasi query log error (400), dan paging cursor.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const SESSION_HASH = 'abcdef0123456789'.repeat(4);
const NOW = Date.UTC(2026, 10, 14, 3, 0);
const DAY = 86_400_000;

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    jennaMessage: { groupBy: vi.fn(), findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: { NODE_ENV: 'production', BETTER_AUTH_SECRET: 'x' } }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { jennaErrorsList, jennaUsageGet } from '@/app/api/[[...slugs]]/_lib/developer/jenna-usage';
import { parseErrorLogQuery } from '@/lib/jenna/validation';

function ctx(query: Record<string, unknown> = {}) {
  const set: { status?: number; headers: Record<string, string> } = { headers: {} };
  return { context: { query, params: {}, set, body: undefined } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const HANDLERS = [
  ['GET /jenna/usage', jennaUsageGet],
  ['GET /jenna/errors', jennaErrorsList],
] as const;

const allPrismaFns = () => [...Object.values(prismaMock.jennaMessage), prismaMock.$queryRaw];

type Sums = { inputTokens?: number; outputTokens?: number; latencyMs?: number; withLatency?: number };
const agg = (count: number, { inputTokens = 0, outputTokens = 0, latencyMs, withLatency = 0 }: Sums = {}) => ({
  _count: { _all: count, latencyMs: withLatency },
  _sum: { inputTokens, outputTokens, latencyMs: latencyMs ?? null },
});

const errorRow = (id: string, minutesAgo: number, over: Record<string, unknown> = {}) => ({
  id,
  conversationId: `conv-${id}`,
  createdAt: new Date(NOW - minutesAgo * 60_000),
  errorCode: 'provider_config',
  errorDetail: 'HTTP 401: {"error":"invalid_api_key"}',
  providerSlot: 'chat_openai',
  model: 'gpt-x',
  latencyMs: 420,
  content: 'Jam buka kantor desa?',
  sessionHash: SESSION_HASH,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: new Date(NOW), toFake: ['Date'] });
  prismaMock.jennaMessage.groupBy.mockResolvedValue([]);
  prismaMock.jennaMessage.findMany.mockResolvedValue([]);
  prismaMock.$queryRaw.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('guard role developer', () => {
  it.each(HANDLERS)('%s tanpa sesi → 401, DB tidak disentuh, no-store', async (_name, handler) => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const { context, set } = ctx();
    expect(await handler(context)).toEqual({ success: false, message: 'Unauthorized' });
    expect(set.status).toBe(401);
    expect(set.headers['cache-control']).toBe('no-store');
    for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
  });

  it.each(HANDLERS.flatMap(([name, handler]) => ['1', '2', '3', '4', '5'].map((r) => [name, r, handler] as const)))(
    '%s role %s → 403',
    async (_name, roleId, handler) => {
      asUser(roleId);
      const { context, set } = ctx();
      expect(await handler(context)).toMatchObject({ success: false });
      expect(set.status).toBe(403);
      for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
    },
  );
});

describe('GET /jenna/usage', () => {
  it('jendela bergulir 24 jam & 7 hari: pertanyaan, terjawab, gagal, dibatalkan, token, rata-rata latensi', async () => {
    asUser('0');
    const groups24h = [
      { role: 'user', status: 'ok', errorCode: null, ...agg(5) },
      { role: 'assistant', status: 'ok', errorCode: null, ...agg(5, { inputTokens: 1000, outputTokens: 200, latencyMs: 6001, withLatency: 4 }) },
      { role: 'user', status: 'error', errorCode: 'timeout', ...agg(2, { inputTokens: 50, latencyMs: 60_000, withLatency: 2 }) },
      // Baris error lama tanpa errorCode tetap dihitung gagal.
      { role: 'user', status: 'error', errorCode: null, ...agg(1) },
      { role: 'user', status: 'error', errorCode: 'client_closed', ...agg(3, { latencyMs: 900, withLatency: 3 }) },
    ];
    // Baris sebelum telemetri ada: tidak satu pun punya latencyMs.
    const groups7d = [
      { role: 'user', status: 'ok', errorCode: null, ...agg(4) },
      { role: 'assistant', status: 'ok', errorCode: null, ...agg(4, { inputTokens: 300, outputTokens: 60 }) },
    ];
    const providerGroups = [
      { providerSlot: 'chat_openai', model: 'gpt-x', status: 'ok', errorCode: null, ...agg(5, { inputTokens: 900, outputTokens: 100, latencyMs: 5000, withLatency: 5 }) },
      { providerSlot: 'chat_openai', model: 'gpt-x', status: 'error', errorCode: 'timeout', ...agg(2, { inputTokens: 20, latencyMs: 60_000, withLatency: 2 }) },
      { providerSlot: 'chat_openai', model: 'gpt-x', status: 'error', errorCode: 'client_closed', ...agg(1, { latencyMs: 100, withLatency: 1 }) },
      { providerSlot: 'chat_anthropic', model: 'claude-x', status: 'ok', errorCode: null, ...agg(9, { inputTokens: 2000, outputTokens: 500, latencyMs: 9000, withLatency: 9 }) },
      { providerSlot: 'chat_anthropic', model: 'claude-x', status: 'error', errorCode: 'provider_busy', ...agg(1, { latencyMs: 1000, withLatency: 1 }) },
    ];
    prismaMock.jennaMessage.groupBy.mockImplementation(async (args: { by: string[]; where: { createdAt: { gte: Date } } }) => {
      if (args.by.includes('providerSlot')) return providerGroups;
      return args.where.createdAt.gte.getTime() === NOW - DAY ? groups24h : groups7d;
    });
    prismaMock.$queryRaw.mockResolvedValue([
      { name: 'cari_konten', count: 7 },
      { name: 'agenda', count: 2 },
    ]);

    const { context, set } = ctx();
    const res = await jennaUsageGet(context);
    expect(set.headers['cache-control']).toBe('no-store');
    expect(res).toEqual({
      success: true,
      data: {
        last24h: {
          since: new Date(NOW - DAY).toISOString(),
          questions: 11,
          answered: 5,
          failed: 3,
          cancelled: 3,
          inputTokens: 1050,
          outputTokens: 200,
          avgLatencyMs: 7433, // (6001 + 60000 + 900) / 9
        },
        last7d: {
          since: new Date(NOW - 7 * DAY).toISOString(),
          questions: 4,
          answered: 4,
          failed: 0,
          cancelled: 0,
          inputTokens: 300,
          outputTokens: 60,
          avgLatencyMs: null,
        },
        providers7d: [
          { slot: 'chat_anthropic', model: 'claude-x', turns: 10, failed: 1, inputTokens: 2000, outputTokens: 500, avgLatencyMs: 1000 },
          { slot: 'chat_openai', model: 'gpt-x', turns: 8, failed: 2, inputTokens: 920, outputTokens: 100, avgLatencyMs: 8138 },
        ],
        tools7d: [
          { name: 'cari_konten', count: 7 },
          { name: 'agenda', count: 2 },
        ],
        generatedAt: new Date(NOW).toISOString(),
      },
    });

    const windows = prismaMock.jennaMessage.groupBy.mock.calls.map(([a]) => a).filter((a) => !a.by.includes('providerSlot'));
    expect(windows.map((a) => a.where)).toEqual([
      { createdAt: { gte: new Date(NOW - DAY) } },
      { createdAt: { gte: new Date(NOW - 7 * DAY) } },
    ]);
    const providers = prismaMock.jennaMessage.groupBy.mock.calls.map(([a]) => a).find((a) => a.by.includes('providerSlot'));
    expect(providers.where).toEqual({ createdAt: { gte: new Date(NOW - 7 * DAY) }, providerSlot: { not: null }, model: { not: null } });
  });

  it('tool dihitung lewat $queryRaw tagged template (unnest, parameter terikat), bukan SQL rakitan', async () => {
    asUser('0');
    await jennaUsageGet(ctx().context);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    const [strings, ...values] = prismaMock.$queryRaw.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(Array.isArray(strings.raw)).toBe(true);
    expect(strings.join('?')).toContain('unnest(m."toolsUsed")');
    expect(strings.join('?')).toContain('LIMIT 10');
    expect(values).toEqual([new Date(NOW - 7 * DAY)]);
  });

  it('tanpa data → semua nol, avgLatencyMs null, daftar kosong', async () => {
    asUser('0');
    const res = await jennaUsageGet(ctx().context);
    if (!res.success) throw new Error('unreachable');
    const empty = { questions: 0, answered: 0, failed: 0, cancelled: 0, inputTokens: 0, outputTokens: 0, avgLatencyMs: null };
    expect(res.data.last24h).toMatchObject(empty);
    expect(res.data.last7d).toMatchObject(empty);
    expect(res.data.providers7d).toEqual([]);
    expect(res.data.tools7d).toEqual([]);
  });
});

describe('GET /jenna/errors — validasi query', () => {
  it('default & nilai sah', () => {
    expect(parseErrorLogQuery(undefined)).toEqual({ ok: true, value: { days: 7, limit: 20, cursor: null } });
    expect(parseErrorLogQuery({ days: '', limit: '', cursor: '' })).toEqual({ ok: true, value: { days: 7, limit: 20, cursor: null } });
    expect(parseErrorLogQuery({ days: '30', limit: '50', cursor: 'cmhx1abc_-9' })).toEqual({
      ok: true,
      value: { days: 30, limit: 50, cursor: 'cmhx1abc_-9' },
    });
    expect(parseErrorLogQuery({ days: '1', limit: '1' })).toMatchObject({ value: { days: 1, limit: 1 } });
  });

  it.each([
    [{ days: '2' }, 'Parameter days harus salah satu dari 1, 7, 30.'],
    [{ days: '0' }, 'Parameter days harus salah satu dari 1, 7, 30.'],
    [{ days: '07' }, 'Parameter days harus salah satu dari 1, 7, 30.'],
    [{ days: ['1', '7'] }, 'Parameter days harus salah satu dari 1, 7, 30.'],
    [{ limit: '0' }, 'Parameter limit harus di antara 1 dan 50.'],
    [{ limit: '51' }, 'Parameter limit harus di antara 1 dan 50.'],
    [{ limit: '1.5' }, 'Parameter limit harus di antara 1 dan 50.'],
    [{ limit: 'abc' }, 'Parameter limit harus di antara 1 dan 50.'],
    [{ cursor: 'a b' }, 'Parameter cursor tidak valid.'],
    [{ cursor: "x' OR 1=1" }, 'Parameter cursor tidak valid.'],
    [{ cursor: 'x'.repeat(65) }, 'Parameter cursor tidak valid.'],
  ])('%j → 400 dengan pesan, DB tidak disentuh', async (query, message) => {
    asUser('0');
    const { context, set } = ctx(query);
    expect(await jennaErrorsList(context)).toEqual({ success: false, message });
    expect(set.status).toBe(400);
    for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
  });
});

describe('GET /jenna/errors — daftar & paging', () => {
  it('halaman pertama: filter, urutan, limit + 1, nextCursor = id terakhir; hash dipotong & preview dipangkas', async () => {
    asUser('0');
    prismaMock.jennaMessage.findMany.mockResolvedValue([
      errorRow('m3', 1, { content: `Tanya   panjang\n${'a'.repeat(300)}` }),
      errorRow('m2', 2, { errorCode: null, errorDetail: null, providerSlot: null, model: null, latencyMs: null }),
      errorRow('m1', 3),
    ]);
    const { context, set } = ctx({ limit: '2' });
    const res = await jennaErrorsList(context);
    expect(set.headers['cache-control']).toBe('no-store');
    expect(set.status).toBeUndefined();

    expect(prismaMock.jennaMessage.findMany).toHaveBeenCalledTimes(1);
    const args = prismaMock.jennaMessage.findMany.mock.calls[0][0];
    expect(args.where).toEqual({
      status: 'error',
      createdAt: { gte: new Date(NOW - 7 * DAY) },
      OR: [{ errorCode: null }, { errorCode: { not: 'client_closed' } }],
    });
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.take).toBe(3);
    expect(args).not.toHaveProperty('cursor');
    expect(args).not.toHaveProperty('skip');

    if (!res.success) throw new Error('unreachable');
    expect(res.data.days).toBe(7);
    expect(res.data.nextCursor).toBe('m2');
    expect(res.data.items).toHaveLength(2);
    expect(res.data.items[0]).toEqual({
      id: 'm3',
      conversationId: 'conv-m3',
      createdAt: new Date(NOW - 60_000).toISOString(),
      errorCode: 'provider_config',
      errorDetail: 'HTTP 401: {"error":"invalid_api_key"}',
      providerSlot: 'chat_openai',
      model: 'gpt-x',
      latencyMs: 420,
      preview: `Tanya panjang ${'a'.repeat(105)}…`,
      session: 'abcdef01',
    });
    expect(res.data.items[1]).toMatchObject({ id: 'm2', errorCode: null, errorDetail: null, providerSlot: null, model: null, latencyMs: null });
    expect(JSON.stringify(res)).not.toContain(SESSION_HASH);
  });

  it('halaman berikut: cursor = id pesan (skip 1), jendela mengikuti days; halaman terakhir → nextCursor null', async () => {
    asUser('0');
    prismaMock.jennaMessage.findMany.mockResolvedValue([errorRow('m1', 3)]);
    const res = await jennaErrorsList(ctx({ days: '30', limit: '2', cursor: 'm2' }).context);

    const args = prismaMock.jennaMessage.findMany.mock.calls[0][0];
    expect(args.cursor).toEqual({ id: 'm2' });
    expect(args.skip).toBe(1);
    expect(args.take).toBe(3);
    expect(args.where.createdAt).toEqual({ gte: new Date(NOW - 30 * DAY) });
    expect(res).toMatchObject({ success: true, data: { days: 30, nextCursor: null, items: [{ id: 'm1' }] } });
  });

  it('tepat `limit` baris → tidak ada halaman berikutnya; kosong → items []', async () => {
    asUser('0');
    prismaMock.jennaMessage.findMany.mockResolvedValue([errorRow('m2', 2), errorRow('m1', 3)]);
    expect(await jennaErrorsList(ctx({ days: '1', limit: '2' }).context)).toMatchObject({
      data: { days: 1, nextCursor: null, items: [{ id: 'm2' }, { id: 'm1' }] },
    });

    prismaMock.jennaMessage.findMany.mockResolvedValue([]);
    expect(await jennaErrorsList(ctx().context)).toEqual({ success: true, data: { items: [], nextCursor: null, days: 7 } });
  });
});
