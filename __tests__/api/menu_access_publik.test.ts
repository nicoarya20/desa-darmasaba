// @vitest-environment node
// Menu admin "Publik": terbuka untuk semua admin, DITAMBAHKAN ke akses per user/role
// (tidak pernah mengurangi), plus guard API /api/admin/public-menu-access.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    publicMenuAccess: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { getNavbar } from '@/app/admin/(dashboard)/user&role/_com/dynamicNavbar';
import { navBar } from '@/app/admin/_com/list_PageAdmin';
import { adminGuardRedirect } from '@/app/admin/_com/nav/menu-access.guard';
import { filterNavByMenuIds, unionNavs } from '@/app/admin/_com/nav/menu-access.logic';
import type { NavItem } from '@/app/admin/_com/nav/domains';
import { GET, POST } from '@/app/api/admin/public-menu-access/route';

const ids = (nav: NavItem[]) => nav.map((s) => s.id);
const childIds = (nav: NavItem[], sectionId: string) =>
  (nav.find((s) => s.id === sectionId)?.children ?? []).map((c) => c.id);

describe('unionNavs', () => {
  it('gabungan anak dari dua bagian, urutan mengikuti navBar', () => {
    const a = filterNavByMenuIds(navBar, ['landing-page.sdgs', 'Kesehatan']);
    const b = filterNavByMenuIds(navBar, ['landing-page.profil', 'ppid.dasar-hukum']);
    const nav = unionNavs(navBar, [a, b]);
    expect(ids(nav)).toEqual(['Landing Page', 'PPID', 'Kesehatan']);
    expect(childIds(nav, 'Landing Page')).toEqual(['landing-page.profil', 'landing-page.sdgs']);
  });

  it('section utuh di salah satu bagian → section utuh', () => {
    const nav = unionNavs(navBar, [filterNavByMenuIds(navBar, ['Landing Page']), filterNavByMenuIds(navBar, ['landing-page.sdgs'])]);
    expect(childIds(nav, 'Landing Page')).toHaveLength(navBar[0].children?.length ?? -1);
  });

  it('section tanpa anak (Musik) ikut bila ada di salah satu bagian', () => {
    expect(ids(unionNavs(navBar, [[], filterNavByMenuIds(navBar, ['Musik'])]))).toEqual(['Musik']);
  });
});

describe('getNavbar dengan menu Publik', () => {
  it('menu Publik ditambahkan ke Menu Access per user', () => {
    const nav = getNavbar({ roleId: 3, menuIds: ['Kesehatan'], publicMenuIds: ['landing-page.apbdes'] });
    expect(ids(nav)).toEqual(['Landing Page', 'Kesehatan']);
    expect(childIds(nav, 'Landing Page')).toEqual(['landing-page.apbdes']);
  });

  it('menu Publik ditambahkan ke menu bawaan role bila Menu Access user kosong', () => {
    const nav = getNavbar({ roleId: 3, menuIds: [], publicMenuIds: ['landing-page.apbdes'] });
    expect(ids(nav)).toEqual(['Landing Page', 'Kesehatan', 'Musik']);
  });

  it('tanpa menu Publik perilaku sama seperti sebelumnya', () => {
    expect(getNavbar({ roleId: 3, publicMenuIds: [] })).toEqual(getNavbar({ roleId: 3 }));
    expect(getNavbar({ roleId: 3, publicMenuIds: null })).toEqual(getNavbar({ roleId: 3 }));
  });

  it('User & Role / Pengaturan tidak bisa dibuka lewat menu Publik untuk role 2–4', () => {
    const nav = getNavbar({ roleId: 4, publicMenuIds: ['User & Role', 'Pengaturan', 'pengaturan.menu-access'] });
    expect(ids(nav)).not.toContain('User & Role');
    expect(ids(nav)).not.toContain('Pengaturan');
  });

  it('role 1 melihat Menu Access di bawah Pengaturan', () => {
    const nav = getNavbar({ roleId: 1 });
    expect(childIds(nav, 'Pengaturan')).toEqual(['pengaturan.visibilitas-menu', 'pengaturan.menu-access']);
    expect(childIds(nav, 'User & Role')).toEqual(['user-role.user', 'user-role.role']);
  });

  it('guard: halaman menu Publik boleh dibuka admin yang Menu Access-nya terbatas', () => {
    const nav = getNavbar({ roleId: 3, menuIds: ['Kesehatan'], publicMenuIds: ['landing-page.apbdes'] });
    expect(adminGuardRedirect({ pathname: '/admin/landing-page/apbdes/create', roleId: 3, nav })).toBeNull();
    expect(adminGuardRedirect({ pathname: '/admin/landing-page/SDGs', roleId: 3, nav })).not.toBeNull();
  });
});

const asUser = (roleId: string | number) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: 'u1', roleId, isActive: true } });

const asAnonymous = () =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
  });

const post = (body: unknown) =>
  POST(new Request('http://localhost/api/admin/public-menu-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));

describe('/api/admin/public-menu-access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.publicMenuAccess.findMany.mockResolvedValue([{ menuId: 'landing-page.apbdes' }]);
    prismaMock.$transaction.mockResolvedValue([]);
  });

  it('GET tanpa sesi → 401', async () => {
    asAnonymous();
    expect((await GET()).status).toBe(401);
  });

  it('GET oleh warga (role 5) → 403', async () => {
    asUser('5');
    expect((await GET()).status).toBe(403);
  });

  it('GET oleh admin role 3 → 200 dengan menuIds', async () => {
    asUser('3');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, menuIds: ['landing-page.apbdes'] });
  });

  it('POST oleh role 2 → 403 dan tidak menyentuh DB', async () => {
    asUser(2);
    expect((await post({ menuIds: ['Kesehatan'] })).status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('POST body tidak valid → 400', async () => {
    asUser('1');
    expect((await post({ menuIds: 'Kesehatan' })).status).toBe(400);
    expect((await post({ menuIds: [1, 2] })).status).toBe(400);
    expect((await post('bukan-json')).status).toBe(400);
  });

  it('POST role 1 → ganti seluruh daftar dalam satu transaksi, tanpa duplikat/kosong', async () => {
    asUser('1');
    const res = await post({ menuIds: ['Kesehatan', ' Kesehatan ', '', 'landing-page.apbdes'] });
    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.publicMenuAccess.deleteMany).toHaveBeenCalledWith({});
    expect(prismaMock.publicMenuAccess.createMany).toHaveBeenCalledWith({
      data: [{ menuId: 'Kesehatan' }, { menuId: 'landing-page.apbdes' }],
    });
  });
});
