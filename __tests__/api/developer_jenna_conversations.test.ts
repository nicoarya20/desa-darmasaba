// @vitest-environment node
// Viewer percakapan Jenna /api/developer/jenna/{stats,conversations}: khusus role "0", validasi
// query/id (400), 404, hapus permanen, dan hash sesi/IP utuh tidak pernah ada di respons.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const SESSION_HASH = 'abcdef0123456789'.repeat(4);
const IP_HASH = '9876543210fedcba'.repeat(4);

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    jennaSettings: { findUnique: vi.fn() },
    jennaConversation: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), deleteMany: vi.fn() },
    jennaMessage: { groupBy: vi.fn(), findMany: vi.fn(), aggregate: vi.fn() },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: { NODE_ENV: 'production', BETTER_AUTH_SECRET: 'x' } }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import {
  jennaConversationDelete,
  jennaConversationGet,
  jennaConversationsList,
  jennaStatsGet,
} from '@/app/api/[[...slugs]]/_lib/developer/jenna-conversations';
import { clipPreview } from '@/lib/jenna/chat/conversation-admin.repo';
import { parseConversationListQuery } from '@/lib/jenna/validation';

function ctx({ query = {}, params = {} }: { query?: Record<string, unknown>; params?: Record<string, unknown> } = {}) {
  const set: { status?: number; headers: Record<string, string> } = { headers: {} };
  return { context: { query, params, set, body: undefined } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const HANDLERS = [
  ['GET /jenna/stats', () => ctx(), jennaStatsGet],
  ['GET /jenna/conversations', () => ctx(), jennaConversationsList],
  ['GET /jenna/conversations/:id', () => ctx({ params: { id: 'c1' } }), jennaConversationGet],
  ['DELETE /jenna/conversations/:id', () => ctx({ params: { id: 'c1' } }), jennaConversationDelete],
] as const;

const allPrismaFns = () => [
  prismaMock.jennaSettings.findUnique,
  ...Object.values(prismaMock.jennaConversation),
  ...Object.values(prismaMock.jennaMessage),
];

const convRow = (id: string, minutesAgo: number) => ({
  id,
  createdAt: new Date(Date.UTC(2026, 10, 13, 1, 0) - minutesAgo * 60_000),
  lastMessageAt: new Date(Date.UTC(2026, 10, 13, 2, 0) - minutesAgo * 60_000),
  sessionHash: SESSION_HASH,
  ipHash: IP_HASH,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.jennaSettings.findUnique.mockResolvedValue(null);
  prismaMock.jennaConversation.count.mockResolvedValue(0);
  prismaMock.jennaConversation.findMany.mockResolvedValue([]);
  prismaMock.jennaMessage.groupBy.mockResolvedValue([]);
  prismaMock.jennaMessage.findMany.mockResolvedValue([]);
  prismaMock.jennaMessage.aggregate.mockResolvedValue({ _sum: { inputTokens: null, outputTokens: null } });
});

describe('guard role developer', () => {
  it.each(HANDLERS)('%s tanpa sesi → 401, DB tidak disentuh, no-store', async (_name, make, handler) => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const { context, set } = make();
    const res = await handler(context);
    expect(res).toEqual({ success: false, message: 'Unauthorized' });
    expect(set.status).toBe(401);
    expect(set.headers['cache-control']).toBe('no-store');
    for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
  });

  it.each(HANDLERS.flatMap(([name, make, handler]) => ['1', '2', '3', '4', '5'].map((r) => [name, r, make, handler] as const)))(
    '%s role %s → 403',
    async (_name, roleId, make, handler) => {
      asUser(roleId);
      const { context, set } = make();
      const res = await handler(context);
      expect(res).toMatchObject({ success: false });
      expect(set.status).toBe(403);
      for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
    },
  );
});

describe('GET /jenna/stats', () => {
  it('menghitung pesan hari ini (sejak 00:00 WIB), token, galat, dan setelan', async () => {
    asUser('0');
    vi.useFakeTimers({ now: new Date('2026-11-13T03:00:00Z'), toFake: ['Date'] });
    prismaMock.jennaMessage.groupBy.mockResolvedValue([
      { role: 'user', status: 'ok', _count: { _all: 7 } },
      { role: 'user', status: 'error', _count: { _all: 2 } },
      { role: 'assistant', status: 'ok', _count: { _all: 7 } },
    ]);
    prismaMock.jennaMessage.aggregate.mockResolvedValue({ _sum: { inputTokens: 1200, outputTokens: 300 } });
    prismaMock.jennaConversation.count.mockResolvedValue(42);
    prismaMock.jennaSettings.findUnique.mockResolvedValue({
      enabled: true,
      assistantName: 'Jenna',
      personaNote: '',
      maxInputChars: 2000,
      historyWindow: 6,
      rateLimitPerMinute: 10,
      dailyMessagesUser: 100,
      dailyTokensGlobal: 50000,
      retentionDays: 30,
      chatProtocol: 'openai',
      updatedAt: new Date(),
    });
    const { context, set } = ctx();
    const res = await jennaStatsGet(context);
    vi.useRealTimers();

    expect(set.headers['cache-control']).toBe('no-store');
    expect(res).toEqual({
      success: true,
      data: {
        today: {
          since: '2026-11-12T17:00:00.000Z',
          userMessages: 9,
          assistantMessages: 7,
          errorTurns: 2,
          tokensUsed: 1500,
        },
        dailyTokensGlobal: 50000,
        conversationsStored: 42,
        retentionDays: 30,
        generatedAt: '2026-11-13T03:00:00.000Z',
      },
    });
    const since = new Date('2026-11-12T17:00:00.000Z');
    expect(prismaMock.jennaMessage.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { createdAt: { gte: since } } }),
    );
    expect(prismaMock.jennaMessage.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { createdAt: { gte: since } } }),
    );
  });

  it('tanpa setelan tersimpan → default (dailyTokensGlobal 0)', async () => {
    asUser('0');
    const res = await jennaStatsGet(ctx().context);
    expect(res).toMatchObject({ success: true, data: { dailyTokensGlobal: 0, retentionDays: 90, conversationsStored: 0 } });
  });
});

describe('GET /jenna/conversations', () => {
  it.each([
    [{ page: '0' }],
    [{ page: '-1' }],
    [{ page: 'abc' }],
    [{ page: '1.5' }],
    [{ limit: '0' }],
    [{ limit: '51' }],
    [{ limit: '10x' }],
    [{ session: 'ABCDEF01' }],
    [{ session: 'abcdef0' }],
    [{ session: SESSION_HASH }],
    [{ page: ['1', '2'] }],
  ])('query %j → 400, DB tidak disentuh', async (query) => {
    asUser('0');
    const { context, set } = ctx({ query });
    const res = await jennaConversationsList(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.any(String) });
    expect(prismaMock.jennaConversation.findMany).not.toHaveBeenCalled();
  });

  it('default page 1 limit 20, urut lastMessageAt desc', async () => {
    asUser('0');
    const res = await jennaConversationsList(ctx().context);
    expect(res).toEqual({ success: true, data: { items: [], total: 0, page: 1, limit: 20 } });
    expect(prismaMock.jennaConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
      }),
    );
    expect(prismaMock.jennaMessage.groupBy).not.toHaveBeenCalled();
  });

  it('page/limit → skip/take; filter session = prefix sessionHash', async () => {
    asUser('0');
    await jennaConversationsList(ctx({ query: { page: '3', limit: '50', session: 'abcdef01' } }).context);
    const where = { sessionHash: { startsWith: 'abcdef01' } };
    expect(prismaMock.jennaConversation.count).toHaveBeenCalledWith({ where });
    expect(prismaMock.jennaConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where, skip: 100, take: 50 }),
    );
  });

  it('item: agregat pesan/galat/token, pratinjau pesan pengunjung pertama, hash dipotong 8', async () => {
    asUser('0');
    prismaMock.jennaConversation.count.mockResolvedValue(2);
    prismaMock.jennaConversation.findMany.mockResolvedValue([convRow('c1', 0), convRow('c2', 60)]);
    prismaMock.jennaMessage.groupBy.mockResolvedValue([
      { conversationId: 'c1', status: 'ok', _count: { _all: 4 }, _sum: { inputTokens: 800, outputTokens: 200 } },
      { conversationId: 'c1', status: 'error', _count: { _all: 1 }, _sum: { inputTokens: 50, outputTokens: null } },
    ]);
    prismaMock.jennaMessage.findMany.mockResolvedValue([
      { conversationId: 'c1', content: `Jam buka   kantor desa?\n${'x'.repeat(200)}` },
    ]);

    const res = await jennaConversationsList(ctx().context);
    if (!res.success) throw new Error('unreachable');
    const [c1, c2] = res.data.items;
    expect(c1).toMatchObject({
      id: 'c1',
      messageCount: 5,
      errorCount: 1,
      tokens: 1050,
      session: 'abcdef01',
      ip: '98765432',
      lastMessageAt: '2026-11-13T02:00:00.000Z',
    });
    expect(c1.preview.startsWith('Jam buka kantor desa? xxx')).toBe(true);
    expect(c1.preview.length).toBe(120);
    expect(c1.preview.endsWith('…')).toBe(true);
    expect(c2).toMatchObject({ id: 'c2', messageCount: 0, errorCount: 0, tokens: 0, preview: '' });
    expect(prismaMock.jennaMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId: { in: ['c1', 'c2'] }, role: 'user' },
        distinct: ['conversationId'],
      }),
    );

    const json = JSON.stringify(res);
    expect(json).not.toContain(SESSION_HASH);
    expect(json).not.toContain(IP_HASH);
    expect(json).not.toContain('sessionHash');
    expect(json).not.toContain('ipHash');
  });
});

describe('GET /jenna/conversations/:id', () => {
  it.each(['', 'a'.repeat(65), 'c1;drop', 'c 1', '../x', 42])('id %j → 400', async (id) => {
    asUser('0');
    const { context, set } = ctx({ params: { id } });
    await jennaConversationGet(context);
    expect(set.status).toBe(400);
    expect(prismaMock.jennaConversation.findUnique).not.toHaveBeenCalled();
  });

  it('tidak ada → 404', async () => {
    asUser('0');
    prismaMock.jennaConversation.findUnique.mockResolvedValue(null);
    const { context, set } = ctx({ params: { id: 'missing' } });
    const res = await jennaConversationGet(context);
    expect(set.status).toBe(404);
    expect(res).toEqual({ success: false, message: 'Percakapan tidak ditemukan.' });
  });

  it('pesan urut createdAt naik, field lengkap, hash dipotong', async () => {
    asUser('0');
    const at = (ms: number) => new Date(Date.UTC(2026, 10, 13, 2, 0) + ms);
    prismaMock.jennaConversation.findUnique.mockResolvedValue({
      ...convRow('c1', 0),
      messages: [
        { role: 'user', content: 'Halo <b>Jenna</b>', status: 'ok', errorCode: null, inputTokens: 0, outputTokens: 0, toolsUsed: [], createdAt: at(0) },
        { role: 'assistant', content: 'Halo!', status: 'ok', errorCode: null, inputTokens: 900, outputTokens: 40, toolsUsed: ['cariKonten'], createdAt: at(1) },
        { role: 'user', content: 'Lagi', status: 'error', errorCode: 'timeout', inputTokens: 10, outputTokens: 0, toolsUsed: [], createdAt: at(2) },
      ],
    });
    const { context, set } = ctx({ params: { id: 'c1' } });
    const res = await jennaConversationGet(context);
    expect(set.headers['cache-control']).toBe('no-store');
    expect(prismaMock.jennaConversation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        select: expect.objectContaining({
          messages: expect.objectContaining({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
        }),
      }),
    );
    if (!res.success) throw new Error('unreachable');
    expect(res.data).toMatchObject({ id: 'c1', session: 'abcdef01', ip: '98765432' });
    expect(res.data.messages).toEqual([
      { role: 'user', content: 'Halo <b>Jenna</b>', status: 'ok', errorCode: null, inputTokens: 0, outputTokens: 0, toolsUsed: [], createdAt: '2026-11-13T02:00:00.000Z' },
      { role: 'assistant', content: 'Halo!', status: 'ok', errorCode: null, inputTokens: 900, outputTokens: 40, toolsUsed: ['cariKonten'], createdAt: '2026-11-13T02:00:00.001Z' },
      { role: 'user', content: 'Lagi', status: 'error', errorCode: 'timeout', inputTokens: 10, outputTokens: 0, toolsUsed: [], createdAt: '2026-11-13T02:00:00.002Z' },
    ]);
    const json = JSON.stringify(res);
    expect(json).not.toContain(SESSION_HASH);
    expect(json).not.toContain(IP_HASH);
  });
});

describe('DELETE /jenna/conversations/:id', () => {
  it('id tidak valid → 400 tanpa hapus', async () => {
    asUser('0');
    const { context, set } = ctx({ params: { id: 'a b' } });
    await jennaConversationDelete(context);
    expect(set.status).toBe(400);
    expect(prismaMock.jennaConversation.deleteMany).not.toHaveBeenCalled();
  });

  it('tidak ada → 404', async () => {
    asUser('0');
    prismaMock.jennaConversation.deleteMany.mockResolvedValue({ count: 0 });
    const { context, set } = ctx({ params: { id: 'missing' } });
    const res = await jennaConversationDelete(context);
    expect(set.status).toBe(404);
    expect(res).toMatchObject({ success: false });
  });

  it('ada → hapus permanen by id (pesan ikut cascade)', async () => {
    asUser('0');
    vi.spyOn(console, 'info').mockImplementation(() => {});
    prismaMock.jennaConversation.deleteMany.mockResolvedValue({ count: 1 });
    const { context, set } = ctx({ params: { id: 'c1' } });
    const res = await jennaConversationDelete(context);
    expect(set.status).toBeUndefined();
    expect(res).toEqual({ success: true, data: { id: 'c1' } });
    expect(prismaMock.jennaConversation.deleteMany).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });
});

describe('parseConversationListQuery', () => {
  it('kosong → default; nilai valid diteruskan', () => {
    expect(parseConversationListQuery(undefined)).toEqual({ ok: true, value: { page: 1, limit: 20, session: null } });
    expect(parseConversationListQuery({ page: '', limit: '', session: '' })).toEqual({
      ok: true,
      value: { page: 1, limit: 20, session: null },
    });
    expect(parseConversationListQuery({ page: '2', limit: '1', session: '0123abcd' })).toEqual({
      ok: true,
      value: { page: 2, limit: 1, session: '0123abcd' },
    });
  });
});

describe('clipPreview', () => {
  it('pendek tetap; spasi/baris baru dirapatkan', () => {
    expect(clipPreview('  Halo\n\n  Jenna  ')).toBe('Halo Jenna');
  });

  it('panjang dipotong tepat max karakter termasuk elipsis, aman untuk emoji', () => {
    const out = clipPreview('😀'.repeat(200), 10);
    expect(Array.from(out)).toHaveLength(10);
    expect(out.endsWith('…')).toBe(true);
  });
});
