// @vitest-environment node
// Kontrak API visibilitas menu: PUT /api/menu-visibility/update hanya role "0"/"1"
// (tanpa sesi 401, role 2-5 403), menuKey wajib href submenu navbar; GET publik ringan.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const { requireAuthMock, revalidateTagMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  revalidateTagMock: vi.fn(),
  prismaMock: {
    $transaction: vi.fn(async (ops: unknown[]) => ops),
    menuVisibility: {
      upsert: vi.fn((args: unknown) => ({ op: 'upsert', args })),
      deleteMany: vi.fn((args: unknown) => ({ op: 'deleteMany', args })),
      findMany: vi.fn(async () => [{ menuKey: '/keamanan/cctv', isVisible: false }]),
    },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('next/cache', () => ({
  revalidateTag: (...a: unknown[]) => revalidateTagMock(...a),
  unstable_cache: <T,>(fn: T) => fn,
}));

import menuVisibilityUpdate, { validateMenuVisibilityItems } from '@/app/api/[[...slugs]]/_lib/menu_visibility/update';
import menuVisibilityFindMany from '@/app/api/[[...slugs]]/_lib/menu_visibility/findMany';
import { MENU_VISIBILITY_TAG } from '@/app/(public)/_com/menu-visibility.logic';

const CCTV = '/keamanan/cctv';
const PUSKESMAS = '/kesehatan/puskesmas';

type Item = { menuKey: string; isVisible: boolean | null };
function ctx(items: Item[]) {
  const set: { status?: number } = {};
  return { context: { body: { items }, set } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PUT /menu-visibility/update — guard role', () => {
  it('tanpa sesi → 401 dengan pesan dari requireAuth, DB tidak disentuh', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const { context, set } = ctx([{ menuKey: CCTV, isVisible: false }]);
    const res = await menuVisibilityUpdate(context);
    expect(set.status).toBe(401);
    expect(res).toEqual({ success: false, message: 'Unauthorized' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it.each(['2', '3', '4', '5'])('role %s → 403, DB tidak disentuh', async (roleId) => {
    asUser(roleId);
    const { context, set } = ctx([{ menuKey: CCTV, isVisible: false }]);
    const res = await menuVisibilityUpdate(context);
    expect(set.status).toBe(403);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each(['0', '1'])('role %s → diizinkan: upsert/delete, revalidate tag, kembalikan daftar override', async (roleId) => {
    asUser(roleId);
    const { context, set } = ctx([
      { menuKey: CCTV, isVisible: false },
      { menuKey: PUSKESMAS, isVisible: null },
    ]);
    const res = await menuVisibilityUpdate(context);
    expect(set.status).toBeUndefined();
    expect(res).toEqual({ success: true, data: [{ menuKey: CCTV, isVisible: false }] });
    expect(prismaMock.menuVisibility.upsert).toHaveBeenCalledWith({
      where: { menuKey: CCTV },
      create: { menuKey: CCTV, isVisible: false, updatedById: `u-${roleId}` },
      update: { isVisible: false, updatedById: `u-${roleId}` },
    });
    // null = kembali ke default → row dihapus, bukan disimpan
    expect(prismaMock.menuVisibility.deleteMany).toHaveBeenCalledWith({ where: { menuKey: PUSKESMAS } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(revalidateTagMock).toHaveBeenCalledWith(MENU_VISIBILITY_TAG, { expire: 0 });
  });
});

describe('PUT /menu-visibility/update — validasi menuKey', () => {
  it('menuKey tak dikenal → 400 dan tidak ada yang disimpan', async () => {
    asUser('1');
    const { context, set } = ctx([
      { menuKey: CCTV, isVisible: false },
      { menuKey: '/tidak-ada', isVisible: true },
    ]);
    const res = await menuVisibilityUpdate(context);
    expect(set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('/tidak-ada') });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('validateMenuVisibilityItems: kosong, id menu ("3.3"), ganda ditolak; href submenu diterima', () => {
    expect(validateMenuVisibilityItems([])).not.toBeNull();
    expect(validateMenuVisibilityItems([{ menuKey: '3.3', isVisible: true }])).toMatch(/tidak dikenal/);
    expect(
      validateMenuVisibilityItems([
        { menuKey: CCTV, isVisible: true },
        { menuKey: CCTV, isVisible: false },
      ]),
    ).toMatch(/ganda/);
    expect(validateMenuVisibilityItems([{ menuKey: PUSKESMAS, isVisible: true }])).toBeNull();
  });
});

describe('GET /menu-visibility/findMany (publik)', () => {
  it('hanya { menuKey, isVisible } — tanpa id/updatedById/timestamp', async () => {
    const res = await menuVisibilityFindMany();
    expect(res).toEqual({ success: true, data: [{ menuKey: CCTV, isVisible: false }] });
    expect(prismaMock.menuVisibility.findMany).toHaveBeenCalledWith({ select: { menuKey: true, isVisible: true } });
  });
});
