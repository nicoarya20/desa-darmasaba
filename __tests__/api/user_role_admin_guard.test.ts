// @vitest-environment node
// T19: API /user & mutasi /role hanya role 0/1 (tanpa sesi 401, role 2-5 403); hanya Developer yang
// boleh memberi role "0" atau mengubah/menghapus akun role "0"; ubah role / nonaktifkan mencabut sesi
// Better Auth (tabel `session`). GET /role tetap terbuka untuk user login.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Elysia } from 'elysia';

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    user: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    role: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    userMenuAccess: { deleteMany: vi.fn(), createMany: vi.fn() },
    userSession: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/admin/(dashboard)/user&role/_com/getMenuIdByRole', () => ({ getMenuIdsByRoleId: () => ['Menu'] }));

import User from '@/app/api/[[...slugs]]/_lib/user';
import Role from '@/app/api/[[...slugs]]/_lib/user/role';

const app = new Elysia({ prefix: '/api' }).use(User).use(Role);

const call = async (method: string, path: string, body?: unknown) => {
  const res = await app.handle(
    new Request(`http://localhost/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  return { status: res.status, json: await res.json() };
};

const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `actor-${roleId}`, roleId, isActive: true } });

const asAnonymous = () =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
  });

const targetWithRole = (roleId: string, isActive = true) =>
  prismaMock.user.findUnique.mockResolvedValue({ id: 'target', roleId, isActive });

const ROUTES = [
  ['GET /user/findMany', () => call('GET', '/user/findMany')],
  ['GET /user/findUnique/:id', () => call('GET', '/user/findUnique/target')],
  ['PUT /user/del/:id', () => call('PUT', '/user/del/target')],
  ['PUT /user/updt', () => call('PUT', '/user/updt', { id: 'target', roleId: '1' })],
  ['DELETE /user/delUser/:id', () => call('DELETE', '/user/delUser/target')],
  ['POST /role/create', () => call('POST', '/role/create', { name: 'X' })],
  ['PUT /role/:id', () => call('PUT', '/role/r1', { name: 'X' })],
  ['DELETE /role/del/:id', () => call('DELETE', '/role/del/r1')],
] as const;

const expectNoDbWrite = () => {
  expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  expect(prismaMock.user.update).not.toHaveBeenCalled();
  expect(prismaMock.$transaction).not.toHaveBeenCalled();
  expect(prismaMock.role.create).not.toHaveBeenCalled();
  expect(prismaMock.role.update).not.toHaveBeenCalled();
  expect(prismaMock.role.delete).not.toHaveBeenCalled();
  expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.user.count.mockResolvedValue(0);
  prismaMock.user.update.mockImplementation(async ({ where, data }) => ({
    id: where.id,
    username: 'Target',
    nomor: null,
    isActive: data.isActive ?? true,
    roleId: data.roleId ?? '5',
    role: { name: 'R' },
  }));
  prismaMock.role.findMany.mockResolvedValue([{ id: '1', name: 'SUPER ADMIN' }]);
  prismaMock.role.count.mockResolvedValue(1);
  prismaMock.role.findUnique.mockImplementation(async ({ where }) => ({ id: where.id, name: `Role ${where.id}` }));
  prismaMock.userMenuAccess.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.userMenuAccess.createMany.mockResolvedValue({ count: 1 });
  prismaMock.userSession.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });
  prismaMock.auditLog.create.mockResolvedValue({ id: 'a1' });
  prismaMock.$transaction.mockImplementation(async (fn) =>
    fn({
      userSession: { deleteMany: vi.fn(async () => ({ count: 0 })) },
      userMenuAccess: { deleteMany: vi.fn(async () => ({ count: 0 })) },
      user: { delete: vi.fn(async () => ({ id: 'target' })) },
    }),
  );
});

describe('guard role 0/1 untuk API user & mutasi role', () => {
  it.each(ROUTES)('%s tanpa sesi → 401, DB tidak disentuh', async (_name, run) => {
    asAnonymous();
    const res = await run();
    expect(res).toEqual({ status: 401, json: { success: false, message: 'Unauthorized' } });
    expectNoDbWrite();
  });

  it.each(ROUTES.flatMap(([name, run]) => ['2', '3', '4', '5'].map((r) => [name, r, run] as const)))(
    '%s role %s → 403',
    async (_name, roleId, run) => {
      asUser(roleId);
      const res = await run();
      expect(res.status).toBe(403);
      expect(res.json).toMatchObject({ success: false });
      expect(res.json.message).toMatch(/Hanya Developer atau Super Admin/);
      expectNoDbWrite();
    },
  );

  it.each(['0', '1'])('role %s boleh membaca daftar user', async (roleId) => {
    asUser(roleId);
    const res = await call('GET', '/user/findMany');
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({ success: true });
  });

  it('GET /role tetap terbuka untuk user login role 5 (router setelah /user tidak ikut terkunci)', async () => {
    asUser('5');
    expect(await call('GET', '/role/findMany')).toMatchObject({ status: 200, json: { success: true } });
  });
});

describe('PUT /user/updt', () => {
  it('role 5 tidak bisa menaikkan dirinya jadi SUPER ADMIN', async () => {
    asUser('5');
    const res = await call('PUT', '/user/updt', { id: 'actor-5', roleId: '1' });
    expect(res.status).toBe(403);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('role 1 boleh mengubah role user biasa; sesi Better Auth target dicabut', async () => {
    asUser('1');
    targetWithRole('5');
    const res = await call('PUT', '/user/updt', { id: 'target', roleId: '2' });
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({ success: true, roleChanged: true, data: { id: 'target', roleId: '2' } });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
    expect(prismaMock.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });

  it('role 1 menonaktifkan user biasa → sesi Better Auth dicabut', async () => {
    asUser('1');
    targetWithRole('3');
    const res = await call('PUT', '/user/updt', { id: 'target', isActive: false });
    expect(res.json).toMatchObject({ success: true, isActiveChanged: true });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });

  it('tanpa ubah role & tanpa nonaktifkan → sesi tidak dicabut', async () => {
    asUser('1');
    targetWithRole('3', false);
    const res = await call('PUT', '/user/updt', { id: 'target', isActive: true });
    expect(res.json).toMatchObject({ success: true });
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

  it('role 1 memberi roleId "0" → 403', async () => {
    asUser('1');
    targetWithRole('5');
    const res = await call('PUT', '/user/updt', { id: 'target', roleId: '0' });
    expect(res.status).toBe(403);
    expect(res.json).toEqual({ success: false, message: expect.stringMatching(/Hanya Developer/) });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.userMenuAccess.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

  it.each([
    ['menonaktifkan', { isActive: false }],
    ['menurunkan role', { roleId: '5' }],
  ])('role 1 %s akun role 0 → 403', async (_name, patch) => {
    asUser('1');
    targetWithRole('0');
    const res = await call('PUT', '/user/updt', { id: 'target', ...patch });
    expect(res.status).toBe(403);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('role 0 boleh memberi roleId "0"', async () => {
    asUser('0');
    targetWithRole('5');
    const res = await call('PUT', '/user/updt', { id: 'target', roleId: '0' });
    expect(res).toMatchObject({ status: 200, json: { success: true, roleChanged: true } });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });

  it('role 0 boleh menonaktifkan akun role 0', async () => {
    asUser('0');
    targetWithRole('0');
    const res = await call('PUT', '/user/updt', { id: 'target', isActive: false });
    expect(res).toMatchObject({ status: 200, json: { success: true } });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });
});

describe('PUT /user/del/:id (nonaktifkan)', () => {
  it('role 1 menonaktifkan user biasa → sesi Better Auth dicabut', async () => {
    asUser('1');
    targetWithRole('5');
    const res = await call('PUT', '/user/del/target');
    expect(res.json).toMatchObject({ success: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: 'target' }, data: { isActive: false } });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });

  it('role 1 menonaktifkan akun role 0 → 403', async () => {
    asUser('1');
    targetWithRole('0');
    const res = await call('PUT', '/user/del/target');
    expect(res.status).toBe(403);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

  it('role 0 boleh menonaktifkan akun role 0', async () => {
    asUser('0');
    targetWithRole('0');
    const res = await call('PUT', '/user/del/target');
    expect(res).toMatchObject({ status: 200, json: { success: true } });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'target' } });
  });
});

describe('DELETE /user/delUser/:id', () => {
  it('role 1 menghapus user biasa → boleh', async () => {
    asUser('1');
    targetWithRole('5');
    const res = await call('DELETE', '/user/delUser/target');
    expect(res.json).toMatchObject({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('role 1 menghapus akun role 0 → 403', async () => {
    asUser('1');
    targetWithRole('0');
    const res = await call('DELETE', '/user/delUser/target');
    expect(res.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('role 0 boleh menghapus akun role 0', async () => {
    asUser('0');
    targetWithRole('0');
    const res = await call('DELETE', '/user/delUser/target');
    expect(res).toMatchObject({ status: 200, json: { success: true } });
  });
});

describe('mutasi role', () => {
  it.each(['0', '1'])('role %s boleh membuat role', async (roleId) => {
    asUser(roleId);
    prismaMock.role.create.mockResolvedValue({ id: 'r9', name: 'X' });
    const res = await call('POST', '/role/create', { name: 'X' });
    expect(res.status).toBe(200);
    expect(prismaMock.role.create).toHaveBeenCalled();
  });
});

describe('audit log mutasi user & role', () => {
  const asActor = (roleId: string) =>
    requireAuthMock.mockResolvedValue({
      authenticated: true,
      user: { id: `actor-${roleId}`, email: `admin${roleId}@desa.id`, roleId, isActive: true },
    });
  const auditData = () => prismaMock.auditLog.create.mock.calls.map(([arg]) => arg.data);
  const actorFields = { actorId: 'actor-1', actorEmail: 'admin1@desa.id', actorRoleId: '1' };

  it('ubah role → user.role.update dengan fromRoleId/toRoleId', async () => {
    asActor('1');
    prismaMock.user.findUnique.mockResolvedValue({ id: 'target', email: 't@desa.id', roleId: '5', isActive: true });
    await call('PUT', '/user/updt', { id: 'target', roleId: '2' });
    expect(auditData()).toEqual([
      expect.objectContaining({
        ...actorFields,
        action: 'user.role.update',
        targetType: 'user',
        targetId: 'target',
        summary: 'Mengubah role user t@desa.id dari 5 ke 2',
        meta: { fromRoleId: '5', toRoleId: '2' },
      }),
    ]);
  });

  it('ubah role + nonaktifkan sekaligus → 2 baris audit', async () => {
    asActor('1');
    targetWithRole('5');
    await call('PUT', '/user/updt', { id: 'target', roleId: '2', isActive: false });
    expect(auditData().map((d) => d.action)).toEqual(['user.role.update', 'user.deactivate']);
  });

  it('PUT /user/updt aktifkan → user.activate', async () => {
    asActor('1');
    targetWithRole('3', false);
    await call('PUT', '/user/updt', { id: 'target', isActive: true });
    expect(auditData()).toEqual([expect.objectContaining({ action: 'user.activate', targetId: 'target' })]);
  });

  it('PUT /user/del/:id → user.deactivate', async () => {
    asActor('1');
    targetWithRole('5');
    await call('PUT', '/user/del/target');
    expect(auditData()).toEqual([
      expect.objectContaining({ ...actorFields, action: 'user.deactivate', targetType: 'user', targetId: 'target' }),
    ]);
  });

  it('DELETE /user/delUser/:id → user.delete dengan snapshot email target', async () => {
    asActor('1');
    prismaMock.user.findUnique.mockResolvedValue({ id: 'target', email: 't@desa.id', roleId: '5', isActive: true });
    await call('DELETE', '/user/delUser/target');
    expect(auditData()).toEqual([
      expect.objectContaining({
        ...actorFields,
        action: 'user.delete',
        targetId: 'target',
        summary: 'Menghapus permanen user t@desa.id',
      }),
    ]);
  });

  it('POST /role/create → role.create dengan meta name', async () => {
    asActor('1');
    prismaMock.role.create.mockResolvedValue({ id: 'r9', name: 'Operator' });
    await call('POST', '/role/create', { name: 'Operator' });
    expect(auditData()).toEqual([
      expect.objectContaining({
        ...actorFields,
        action: 'role.create',
        targetType: 'role',
        targetId: 'r9',
        meta: { name: 'Operator' },
      }),
    ]);
  });

  it('PUT /role/:id rename → role.update dengan nama lama', async () => {
    asActor('1');
    prismaMock.role.update.mockResolvedValue({ id: 'r1', name: 'Baru' });
    await call('PUT', '/role/r1', { name: 'Baru' });
    expect(auditData()).toEqual([
      expect.objectContaining({ action: 'role.update', targetId: 'r1', meta: { name: 'Baru', previousName: 'Role r1' } }),
    ]);
  });

  it('DELETE /role/del/:id → role.delete', async () => {
    asActor('1');
    prismaMock.role.delete.mockResolvedValue({ id: 'r1', name: 'Lama' });
    await call('DELETE', '/role/del/r1');
    expect(auditData()).toEqual([
      expect.objectContaining({ action: 'role.delete', targetId: 'r1', meta: { name: 'Lama' } }),
    ]);
  });

  it.each(ROUTES)('%s ditolak 403 (role 5) → tidak ada audit', async (_name, run) => {
    asActor('5');
    expect((await run()).status).toBe(403);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('role 1 mengubah akun role 0 (403 denyDeveloperAccountChange) → tidak ada audit', async () => {
    asActor('1');
    targetWithRole('0');
    expect((await call('PUT', '/user/updt', { id: 'target', isActive: false })).status).toBe(403);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});
