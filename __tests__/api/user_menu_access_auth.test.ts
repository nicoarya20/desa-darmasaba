// @vitest-environment node
// Guard /api/admin/user-menu-access: GET milik sendiri (semua role) atau user lain (role 0/1),
// POST hanya role 0/1; tanpa sesi 401. Bentuk response sukses tidak berubah (kontrak publik).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    userMenuAccess: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { GET, POST } from '@/app/api/admin/user-menu-access/route';
import { canManageMenuAccess, canReadMenuAccess } from '@/lib/auth-policy';

const URL_BASE = 'http://localhost/api/admin/user-menu-access';

const asUser = (id: string, roleId: string | number) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id, roleId, isActive: true } });

const asAnonymous = () =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(
      JSON.stringify({ success: false, message: 'Unauthorized - Silakan login terlebih dahulu' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    ),
  });

const get = (userId: string) => GET(new Request(`${URL_BASE}?userId=${userId}`));

const post = (body: unknown) =>
  POST(
    new Request(URL_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.userMenuAccess.findMany.mockResolvedValue([{ menuId: 'Kesehatan' }, { menuId: 'Musik' }]);
  prismaMock.userMenuAccess.deleteMany.mockResolvedValue({ count: 1 });
  prismaMock.userMenuAccess.createMany.mockResolvedValue({ count: 2 });
});

describe('canManageMenuAccess', () => {
  it('role 0 & 1 (string maupun number) boleh mengelola', () => {
    for (const r of ['0', '1', 0, 1]) expect(canManageMenuAccess(r)).toBe(true);
  });

  it('role admin 2-4 dan user 5 tidak boleh mengelola', () => {
    for (const r of ['2', '3', '4', '5', 2, 3, 4, 5]) expect(canManageMenuAccess(r)).toBe(false);
  });

  it('roleId kosong ditolak', () => {
    expect(canManageMenuAccess(null)).toBe(false);
    expect(canManageMenuAccess(undefined)).toBe(false);
    expect(canManageMenuAccess('')).toBe(false);
  });
});

describe('canReadMenuAccess', () => {
  it('semua role boleh membaca menu milik sendiri', () => {
    for (const r of ['0', '1', '2', '3', '4', '5', 3]) {
      expect(canReadMenuAccess({ id: 'u1', roleId: r }, 'u1')).toBe(true);
    }
  });

  it('menu user lain hanya untuk role 0/1', () => {
    expect(canReadMenuAccess({ id: 'u1', roleId: '0' }, 'u2')).toBe(true);
    expect(canReadMenuAccess({ id: 'u1', roleId: 1 }, 'u2')).toBe(true);
    for (const r of ['2', '3', '4', '5', 4]) {
      expect(canReadMenuAccess({ id: 'u1', roleId: r }, 'u2')).toBe(false);
    }
  });
});

describe('GET /api/admin/user-menu-access', () => {
  it('tanpa sesi → 401 dan DB tidak disentuh', async () => {
    asAnonymous();
    const res = await get('u-target');
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ success: false });
    expect(prismaMock.userMenuAccess.findMany).not.toHaveBeenCalled();
  });

  it('role 3 membaca menu user lain → 403 dengan pola { success: false, message }', async () => {
    asUser('u-kesehatan', '3');
    const res = await get('u-lain');
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe('string');
    expect(prismaMock.userMenuAccess.findMany).not.toHaveBeenCalled();
  });

  it('role 3 membaca menu milik sendiri → 200, bentuk response tetap', async () => {
    asUser('u-kesehatan', '3');
    const res = await get('u-kesehatan');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, menuIds: ['Kesehatan', 'Musik'] });
    expect(prismaMock.userMenuAccess.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-kesehatan' },
      select: { menuId: true },
    });
  });

  it('role 1 membaca menu user lain → 200', async () => {
    asUser('u-super', 1);
    const res = await get('u-lain');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, menuIds: ['Kesehatan', 'Musik'] });
  });

  it('userId kosong tetap 400 untuk user yang login', async () => {
    asUser('u-super', '1');
    const res = await GET(new Request(URL_BASE));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/user-menu-access', () => {
  it('tanpa sesi → 401 dan DB tidak disentuh', async () => {
    asAnonymous();
    const res = await post({ userId: 'u-target', menuIds: ['Musik'] });
    expect(res.status).toBe(401);
    expect(prismaMock.userMenuAccess.deleteMany).not.toHaveBeenCalled();
  });

  it('role 2 → 403 walau untuk dirinya sendiri, DB tidak disentuh', async () => {
    asUser('u-desa', '2');
    const res = await post({ userId: 'u-desa', menuIds: ['Musik'] });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ success: false });
    expect(prismaMock.userMenuAccess.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.userMenuAccess.createMany).not.toHaveBeenCalled();
  });

  it('role 1 → 200, menu lama diganti menu baru', async () => {
    asUser('u-super', '1');
    const res = await post({ userId: 'u-target', menuIds: ['Kesehatan', 'Musik'] });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(prismaMock.userMenuAccess.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u-target' } });
    expect(prismaMock.userMenuAccess.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'u-target', menuId: 'Kesehatan' },
        { userId: 'u-target', menuId: 'Musik' },
      ],
    });
  });
});
