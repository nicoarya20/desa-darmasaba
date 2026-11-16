// @vitest-environment node
// LoginLog: recordLogin best-effort, purge 90 hari, scheduler retensi, dan pencatatan di hook after sign-in Better Auth.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    loginLog: { create: vi.fn(), deleteMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    session: { delete: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/env', () => ({
  env: {
    DEVELOPER_EMAILS: ['dev@desa.id'],
    SUPER_ADMIN_EMAILS: [],
    BETTER_AUTH_SECRET: 'x',
    BETTER_AUTH_URL: 'http://localhost:3000',
    PORT: 3000,
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    NODE_ENV: 'test',
  },
}));
vi.mock('better-auth', () => ({ betterAuth: (options: unknown) => ({ options }) }));
vi.mock('better-auth/adapters/prisma', () => ({ prismaAdapter: () => ({}) }));
vi.mock('better-auth/api', () => ({
  createAuthMiddleware: (fn: unknown) => fn,
  APIError: class APIError extends Error {
    constructor(
      public status: string,
      body?: { message?: string },
    ) {
      super(body?.message);
    }
  },
}));

import {
  LOGIN_LOG_RETENTION_DAYS,
  purgeLoginLogs,
  recordLogin,
  startLoginLogRetentionScheduler,
} from '@/lib/login-log';
import { JENNA_PURGE_INTERVAL_MS, JENNA_PURGE_JEDA_AWAL_MS } from '@/lib/jenna/chat/retention';
import { auth } from '@/lib/auth';

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.loginLog.create.mockResolvedValue({ id: 'l1' });
  prismaMock.loginLog.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.session.delete.mockResolvedValue({});
  prismaMock.user.update.mockResolvedValue({});
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe('recordLogin()', () => {
  it('insert LoginLog dengan bentuk benar', async () => {
    await recordLogin({
      userId: 'u1',
      email: 'a@desa.id',
      roleId: '2',
      result: 'success',
      ipAddress: '10.0.0.1',
      userAgent: 'Mozilla',
    });
    expect(prismaMock.loginLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        email: 'a@desa.id',
        roleId: '2',
        result: 'success',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla',
      },
    });
  });

  it('memotong userAgent ke 512 karakter dan mengisi null untuk field kosong', async () => {
    await recordLogin({ userId: 'u1', result: 'blocked_inactive', userAgent: 'x'.repeat(600) });
    const { data } = prismaMock.loginLog.create.mock.calls[0][0];
    expect(data.userAgent).toHaveLength(512);
    expect(data).toMatchObject({ email: null, roleId: null, ipAddress: null });
  });

  it('gagal insert → console.warn, tidak melempar', async () => {
    const err = new Error('db down');
    prismaMock.loginLog.create.mockRejectedValue(err);
    await expect(recordLogin({ userId: 'u1', result: 'success' })).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[login-log]'), err);
  });
});

describe('purgeLoginLogs()', () => {
  it('menghapus createdAt < now - 90 hari dan mengembalikan jumlah', async () => {
    prismaMock.loginLog.deleteMany.mockResolvedValue({ count: 3 });
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const now = new Date('2026-11-16T00:00:00.000Z');
    expect(LOGIN_LOG_RETENTION_DAYS).toBe(90);
    await expect(purgeLoginLogs(now)).resolves.toBe(3);
    expect(prismaMock.loginLog.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: new Date('2026-08-18T00:00:00.000Z') } },
    });
    info.mockRestore();
  });
});

describe('startLoginLogRetentionScheduler()', () => {
  const prodEnv = { NODE_ENV: 'production' };

  function fakeTimers() {
    const unrefTimeout = vi.fn();
    const unrefInterval = vi.fn();
    const timers = {
      setTimeout: vi.fn<(fn: () => void, ms: number) => { unref: () => void }>(() => ({ unref: unrefTimeout })),
      setInterval: vi.fn<(fn: () => void, ms: number) => { unref: () => void }>(() => ({ unref: unrefInterval })),
    };
    return { timers, unrefTimeout, unrefInterval };
  }

  it('memasang timer tertunda lalu interval harian (unref), menjalankan run', async () => {
    const { timers, unrefTimeout, unrefInterval } = fakeTimers();
    const run = vi.fn().mockResolvedValue(0);
    expect(startLoginLogRetentionScheduler({ run, env: prodEnv, timers, store: {} })).toBe(true);
    expect(timers.setTimeout).toHaveBeenCalledWith(expect.any(Function), JENNA_PURGE_JEDA_AWAL_MS);
    expect(unrefTimeout).toHaveBeenCalled();

    timers.setTimeout.mock.calls[0][0]();
    expect(run).toHaveBeenCalledTimes(1);
    expect(timers.setInterval).toHaveBeenCalledWith(expect.any(Function), JENNA_PURGE_INTERVAL_MS);
    expect(unrefInterval).toHaveBeenCalled();
  });

  it('tidak dobel start pada store yang sama', () => {
    const { timers } = fakeTimers();
    const store = {};
    const run = vi.fn().mockResolvedValue(0);
    expect(startLoginLogRetentionScheduler({ run, env: prodEnv, timers, store })).toBe(true);
    expect(startLoginLogRetentionScheduler({ run, env: prodEnv, timers, store })).toBe(false);
    expect(timers.setTimeout).toHaveBeenCalledTimes(1);
  });

  it('mati di luar production dan saat next build', () => {
    const { timers } = fakeTimers();
    expect(startLoginLogRetentionScheduler({ env: { NODE_ENV: 'development' }, timers, store: {} })).toBe(false);
    expect(
      startLoginLogRetentionScheduler({
        env: { NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build' },
        timers,
        store: {},
      }),
    ).toBe(false);
    expect(timers.setTimeout).not.toHaveBeenCalled();
  });
});

describe('hook after sign-in (auth.ts)', () => {
  type Hook = (ctx: unknown) => Promise<void>;
  const hook = (auth as unknown as { options: { hooks: { after: Hook } } }).options.hooks.after;
  const ctx = {
    path: '/callback/google',
    context: {
      newSession: {
        user: { id: 'u1' },
        session: { id: 's1', ipAddress: '10.0.0.9', userAgent: 'UA-Test' },
      },
    },
  };

  it('login aktif → LoginLog success dengan IP/UA dari sesi', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ isActive: true, email: 'a@desa.id', roleId: '2' });
    await hook(ctx);
    expect(prismaMock.loginLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        email: 'a@desa.id',
        roleId: '2',
        result: 'success',
        ipAddress: '10.0.0.9',
        userAgent: 'UA-Test',
      },
    });
  });

  it('login aktif dengan promote → roleId hasil akhir', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ isActive: true, email: 'dev@desa.id', roleId: '5' });
    await hook(ctx);
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { roleId: '0' } });
    expect(prismaMock.loginLog.create.mock.calls[0][0].data).toMatchObject({ roleId: '0', result: 'success' });
  });

  it('gagal tulis log tidak memblokir login', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ isActive: true, email: 'a@desa.id', roleId: '2' });
    prismaMock.loginLog.create.mockRejectedValue(new Error('db down'));
    await expect(hook(ctx)).resolves.toBeUndefined();
  });

  it('akun nonaktif → LoginLog blocked_inactive lalu FORBIDDEN', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ isActive: false, email: 'b@desa.id', roleId: '5' });
    await expect(hook(ctx)).rejects.toMatchObject({ status: 'FORBIDDEN' });
    expect(prismaMock.loginLog.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      result: 'blocked_inactive',
      ipAddress: '10.0.0.9',
    });
    expect(prismaMock.session.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
  });

  it('gagal hapus sesi akun nonaktif → warn, tetap FORBIDDEN', async () => {
    const err = new Error('gone');
    prismaMock.user.findUnique.mockResolvedValue({ isActive: false, email: 'b@desa.id', roleId: '5' });
    prismaMock.session.delete.mockRejectedValue(err);
    await expect(hook(ctx)).rejects.toMatchObject({ status: 'FORBIDDEN' });
    expect(warn).toHaveBeenCalledWith('[auth] gagal menghapus sesi akun nonaktif', err);
  });

  it('user tidak ditemukan → tidak menulis log', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await hook(ctx);
    expect(prismaMock.loginLog.create).not.toHaveBeenCalled();
  });

  it('bukan path sign-in → tidak menulis log', async () => {
    await hook({ ...ctx, path: '/get-session' });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.loginLog.create).not.toHaveBeenCalled();
  });
});
