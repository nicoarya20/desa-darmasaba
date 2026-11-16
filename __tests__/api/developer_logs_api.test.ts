// @vitest-environment node
// /api/developer/{audit-log,login-log}: khusus role "0", validasi query 400 seragam, filter → where
// Prisma, limit maks 100, select tanpa field sensitif, facets aksi & statistik login.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    auditLog: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    loginLog: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: { NODE_ENV: 'production', BETTER_AUTH_SECRET: 'x' } }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { auditLogList, parseAuditLogQuery } from '@/app/api/[[...slugs]]/_lib/developer/audit-log';
import { loginLogList, parseLoginLogQuery } from '@/app/api/[[...slugs]]/_lib/developer/login-log';
import { AUDIT_ACTIONS } from '@/lib/audit';

function ctx(query: Record<string, unknown> = {}) {
  const set: { status?: number; headers: Record<string, string> } = { headers: {} };
  return { context: { query, params: {}, set, body: undefined } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const HANDLERS = [
  ['GET /audit-log', auditLogList],
  ['GET /login-log', loginLogList],
] as const;

const allPrismaFns = () => [...Object.values(prismaMock.auditLog), ...Object.values(prismaMock.loginLog)];

const NOW = new Date('2026-11-16T10:00:00Z');

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  for (const fn of [prismaMock.auditLog.count, prismaMock.loginLog.count]) fn.mockResolvedValue(0);
  for (const fn of [prismaMock.auditLog.findMany, prismaMock.loginLog.findMany]) fn.mockResolvedValue([]);
  for (const fn of [prismaMock.auditLog.groupBy, prismaMock.loginLog.groupBy]) fn.mockResolvedValue([]);
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

describe('validasi query (400 seragam)', () => {
  const BAD_COMMON: Record<string, unknown>[] = [
    { page: '0' },
    { page: 'abc' },
    { page: ['1', '2'] },
    { limit: '0' },
    { limit: '101' },
    { limit: '-5' },
    { q: 'x'.repeat(101) },
    { from: 'kemarin' },
    { from: '2026-02-31' },
    { from: '2026-11-16T10:00:00' },
    { to: '2026-13-01' },
    { from: '2026-11-17', to: '2026-11-16' },
  ];
  const BAD: [string, (typeof HANDLERS)[number][1], Record<string, unknown>][] = [
    ...BAD_COMMON.flatMap((q) => HANDLERS.map(([name, h]) => [name, h, q] as [string, typeof h, typeof q])),
    ['GET /audit-log', auditLogList, { action: 'user.hack' }],
    ['GET /audit-log', auditLogList, { actorId: 'a b' }],
    ['GET /audit-log', auditLogList, { targetType: 'User;drop' }],
    ['GET /login-log', loginLogList, { result: 'failed' }],
    ['GET /login-log', loginLogList, { userId: '../x' }],
  ];

  it.each(BAD)('%s %j → 400 tanpa query DB', async (_name, handler, query) => {
    asUser('0');
    const { context, set } = ctx(query);
    const res = await handler(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.any(String) });
    for (const fn of allPrismaFns()) expect(fn).not.toHaveBeenCalled();
  });

  it('nilai kosong = default; q dipangkas; from/to inklusif menerima tanggal atau tanggal-waktu berzona', () => {
    expect(parseAuditLogQuery({ page: '', limit: '', q: '  ', action: '' })).toEqual({
      ok: true,
      value: { page: 1, limit: 25, q: null, from: null, to: null, action: null, actorId: null, targetType: null },
    });
    const parsed = parseLoginLogQuery({ q: ' budi ', from: '2026-11-01', to: '2026-11-16T23:59:59.999+08:00' });
    expect(parsed).toMatchObject({
      ok: true,
      value: { q: 'budi', from: new Date('2026-11-01T00:00:00Z'), to: new Date('2026-11-16T15:59:59.999Z') },
    });
  });
});

describe('GET /audit-log', () => {
  it('tanpa filter: urut terbaru, limit default 25, select tanpa field sensitif, tanggal ISO', async () => {
    asUser('0');
    const createdAt = new Date('2026-11-16T09:00:00Z');
    prismaMock.auditLog.count.mockResolvedValue(1);
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: 'a1',
        createdAt,
        actorId: 'u-0',
        actorEmail: 'dev@desa.id',
        actorRoleId: '0',
        action: 'user.role.update',
        targetType: 'user',
        targetId: 'u-9',
        summary: 'Role diubah',
        meta: { from: '5', to: '2' },
      },
    ]);
    const { context, set } = ctx();
    const res = await auditLogList(context);

    expect(set.headers['cache-control']).toBe('no-store');
    const args = prismaMock.auditLog.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: {}, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: 0, take: 25 });
    expect(Object.keys(args.select).sort()).toEqual(
      ['action', 'actorEmail', 'actorId', 'actorRoleId', 'createdAt', 'id', 'meta', 'summary', 'targetId', 'targetType'],
    );
    expect(res).toEqual({
      success: true,
      data: {
        items: [expect.objectContaining({ id: 'a1', createdAt: '2026-11-16T09:00:00.000Z', meta: { from: '5', to: '2' } })],
        page: 1,
        limit: 25,
        total: 1,
        facets: { actions: [] },
      },
    });
  });

  it('semua filter → where Prisma; facet aksi dihitung tanpa filter aksi, urut jumlah terbanyak', async () => {
    asUser('0');
    prismaMock.auditLog.groupBy.mockResolvedValue([
      { action: 'role.create', _count: { _all: 2 } },
      { action: 'user.update', _count: { _all: 5 } },
      { action: 'user.delete', _count: { _all: 2 } },
    ]);
    const { context } = ctx({
      page: '3',
      limit: '100',
      action: AUDIT_ACTIONS.USER_DELETE,
      actorId: 'u-0',
      targetType: 'user',
      q: 'budi',
      from: '2026-11-01',
      to: '2026-11-16T23:59:59Z',
    });
    const res = await auditLogList(context);

    const baseWhere = {
      actorId: 'u-0',
      targetType: 'user',
      createdAt: { gte: new Date('2026-11-01T00:00:00Z'), lte: new Date('2026-11-16T23:59:59Z') },
      OR: [
        { summary: { contains: 'budi', mode: 'insensitive' } },
        { actorEmail: { contains: 'budi', mode: 'insensitive' } },
        { targetId: { contains: 'budi', mode: 'insensitive' } },
      ],
    };
    const where = { ...baseWhere, action: 'user.delete' };
    expect(prismaMock.auditLog.count).toHaveBeenCalledWith({ where });
    expect(prismaMock.auditLog.findMany.mock.calls[0][0]).toMatchObject({ where, skip: 200, take: 100 });
    expect(prismaMock.auditLog.groupBy).toHaveBeenCalledWith({ by: ['action'], where: baseWhere, _count: { _all: true } });
    expect(res).toMatchObject({
      data: {
        page: 3,
        limit: 100,
        facets: {
          actions: [
            { action: 'user.update', count: 5 },
            { action: 'role.create', count: 2 },
            { action: 'user.delete', count: 2 },
          ],
        },
      },
    });
  });
});

describe('GET /login-log', () => {
  it('filter → where Prisma, select tanpa token, statistik 24 jam / 7 hari dari seluruh log', async () => {
    asUser('0');
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    prismaMock.loginLog.count.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if ('OR' in where) return 4;
      if (where.result === 'blocked_inactive') return 2;
      const gte = (where.createdAt as { gte: Date }).gte.getTime();
      return gte === NOW.getTime() - 86_400_000 ? 3 : 9;
    });
    prismaMock.loginLog.groupBy.mockResolvedValue([{ userId: 'u-1' }, { userId: 'u-2' }]);
    prismaMock.loginLog.findMany.mockResolvedValue([
      {
        id: 'l1',
        createdAt: new Date('2026-11-16T08:00:00Z'),
        userId: 'u-1',
        email: 'staf@desa.id',
        roleId: '2',
        result: 'blocked_inactive',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    ]);
    const { context } = ctx({ result: 'blocked_inactive', userId: 'u-1', q: '10.0', page: '2', limit: '10' });
    const res = await loginLogList(context);

    const where = {
      result: 'blocked_inactive',
      userId: 'u-1',
      OR: [{ email: { contains: '10.0', mode: 'insensitive' } }, { ipAddress: { contains: '10.0', mode: 'insensitive' } }],
    };
    expect(prismaMock.loginLog.count).toHaveBeenCalledWith({ where });
    const args = prismaMock.loginLog.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: 10, take: 10 });
    expect(Object.keys(args.select).sort()).toEqual(
      ['createdAt', 'email', 'id', 'ipAddress', 'result', 'roleId', 'userAgent', 'userId'],
    );
    const since7d = new Date(NOW.getTime() - 7 * 86_400_000);
    expect(prismaMock.loginLog.count).toHaveBeenCalledWith({ where: { createdAt: { gte: since7d }, result: 'blocked_inactive' } });
    expect(prismaMock.loginLog.groupBy).toHaveBeenCalledWith({
      by: ['userId'],
      where: { createdAt: { gte: since7d }, userId: { not: null } },
    });
    expect(res).toEqual({
      success: true,
      data: {
        items: [expect.objectContaining({ id: 'l1', createdAt: '2026-11-16T08:00:00.000Z', ipAddress: '10.0.0.1' })],
        page: 2,
        limit: 10,
        total: 4,
        stats: { last24h: 3, last7d: 9, blocked7d: 2, uniqueUsers7d: 2 },
      },
    });
  });
});
