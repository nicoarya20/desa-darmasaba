// @vitest-environment node
// Menu Access per submenu: getNavbar (filter section/submenu + section khusus role 0/1),
// isPathAllowed per segmen via basePath, dan guard UI adminGuardRedirect.
import { describe, expect, it } from 'vitest';
import { getNavbar } from '@/app/admin/(dashboard)/user&role/_com/dynamicNavbar';
import { landingPageMenu } from '@/app/admin/_com/nav/domains';
import {
  filterNavByMenuIds,
  firstAllowedPath,
  isPathAllowed,
  isUnderPath,
} from '@/app/admin/_com/nav/menu-access.logic';
import { adminGuardRedirect } from '@/app/admin/_com/nav/menu-access.guard';
import type { NavItem } from '@/app/admin/_com/nav/domains';

const ids = (nav: NavItem[]) => nav.map((s) => s.id);
const childIds = (nav: NavItem[], sectionId: string) =>
  (nav.find((s) => s.id === sectionId)?.children ?? []).map((c) => c.id);

describe('getNavbar dengan menuIds', () => {
  it('ID section lama "Landing Page" → semua submenu Landing Page', () => {
    const nav = getNavbar({ roleId: 2, menuIds: ['Landing Page'] });
    expect(ids(nav)).toEqual(['Landing Page']);
    expect(childIds(nav, 'Landing Page')).toEqual(landingPageMenu.children?.map((c) => c.id));
  });

  it('ID section lama dengan kapitalisasi/spasi beda tetap cocok', () => {
    expect(ids(getNavbar({ roleId: 2, menuIds: ['  landing page ', 'KESEHATAN'] }))).toEqual([
      'Landing Page',
      'Kesehatan',
    ]);
  });

  it('campuran section + submenu: section utuh dan section tersaring', () => {
    const nav = getNavbar({ roleId: 3, menuIds: ['Kesehatan', 'landing-page.apbdes', 'ppid.dasar-hukum'] });
    expect(ids(nav)).toEqual(['Landing Page', 'PPID', 'Kesehatan']);
    expect(childIds(nav, 'Landing Page')).toEqual(['landing-page.apbdes']);
    expect(childIds(nav, 'PPID')).toEqual(['ppid.dasar-hukum']);
    expect(childIds(nav, 'Kesehatan')).toHaveLength(7);
  });

  it('submenu saja → section tampil dengan anak tersaring, urutan asli', () => {
    const nav = getNavbar({ roleId: 4, menuIds: ['desa.struktur-perangkat-desa', 'desa.profil'] });
    expect(ids(nav)).toEqual(['Desa']);
    expect(childIds(nav, 'Desa')).toEqual(['desa.profil', 'desa.struktur-perangkat-desa']);
    expect(nav[0].name).toBe('Pemerintahan');
  });

  it('ID tak dikenal diabaikan', () => {
    expect(getNavbar({ roleId: 2, menuIds: ['tidak-ada.menu'] })).toEqual([]);
  });

  it.each([2, 3, 4])('role %i: "User & Role"/"Pengaturan" dibuang walau tersimpan di DB', (roleId) => {
    const nav = getNavbar({ roleId, menuIds: ['User & Role', 'Pengaturan', 'user-role.user', 'Kesehatan'] });
    expect(ids(nav)).toEqual(['Kesehatan']);
  });

  it.each([2, 3, 4])('role %i tanpa menuIds (fallback role) tidak punya User & Role', (roleId) => {
    expect(ids(getNavbar({ roleId }))).not.toContain('User & Role');
  });

  it.each([0, 1])('role %i tetap punya User & Role + Pengaturan di akhir (fallback & menuIds)', (roleId) => {
    expect(ids(getNavbar({ roleId })).slice(-2)).toEqual(['User & Role', 'Pengaturan']);
    expect(ids(getNavbar({ roleId, menuIds: ['Kesehatan'] }))).toEqual(['Kesehatan', 'User & Role', 'Pengaturan']);
  });

  it('role 1 fallback: urutan sidebar sama dengan sebelumnya', () => {
    expect(ids(getNavbar({ roleId: 1 }))).toEqual([
      'Landing Page', 'PPID', 'Desa', 'Kesehatan', 'Keamanan', 'Ekonomi', 'Inovasi',
      'Lingkungan', 'Pendidikan', 'Kependudukan', 'Musik', 'User & Role', 'Pengaturan',
    ]);
  });
});

describe('isUnderPath / isPathAllowed', () => {
  it('prefix dicocokkan per segmen, bukan per karakter', () => {
    expect(isUnderPath('/admin/x/a', '/admin/x/a')).toBe(true);
    expect(isUnderPath('/admin/x/a/create', '/admin/x/a')).toBe(true);
    expect(isUnderPath('/admin/x/ab', '/admin/x/a')).toBe(false);
    expect(isUnderPath('/admin/x/a?tab=1', '/admin/x/a')).toBe(true);
    expect(isUnderPath('/admin', '')).toBe(false);
  });

  const nav = filterNavByMenuIds(
    getNavbar({ roleId: 1 }),
    ['landing-page.desa-anti-korupsi', 'Musik'],
  );

  it('halaman create/edit/kategori di bawah basePath diizinkan', () => {
    expect(isPathAllowed('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi', nav)).toBe(true);
    expect(isPathAllowed('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create', nav)).toBe(true);
    expect(isPathAllowed('/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/abc/edit', nav)).toBe(true);
    expect(isPathAllowed('/admin/musik/xyz/edit', nav)).toBe(true);
  });

  it('halaman submenu lain diblokir', () => {
    expect(isPathAllowed('/admin/landing-page/apbdes', nav)).toBe(false);
    expect(isPathAllowed('/admin/landing-page/apbdes/create', nav)).toBe(false);
    expect(isPathAllowed('/admin/kesehatan/puskesmas', nav)).toBe(false);
  });

  it('firstAllowedPath = path submenu pertama; null bila nav kosong', () => {
    expect(firstAllowedPath(nav)).toBe('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    expect(firstAllowedPath([])).toBeNull();
  });
});

describe('adminGuardRedirect (guard UI layout admin)', () => {
  const navFor = (roleId: number, menuIds?: string[]) => getNavbar({ roleId, menuIds });

  it('path diizinkan → tidak redirect', () => {
    const nav = navFor(3, ['kesehatan.puskesmas']);
    expect(adminGuardRedirect({ pathname: '/admin/kesehatan/puskesmas/123/edit', roleId: 3, nav })).toBeNull();
  });

  it('path menu lain → redirect ke menu pertama yang diizinkan', () => {
    const nav = navFor(3, ['kesehatan.puskesmas']);
    expect(adminGuardRedirect({ pathname: '/admin/kesehatan/posyandu/list-posyandu', roleId: 3, nav })).toBe(
      '/admin/kesehatan/puskesmas',
    );
    expect(adminGuardRedirect({ pathname: '/admin/pengaturan/menu-access', roleId: 3, nav })).toBe(
      '/admin/kesehatan/puskesmas',
    );
  });

  it('path di luar nav (root, auth, halaman tanpa menu) tidak diblokir', () => {
    const nav = navFor(3, ['kesehatan.puskesmas']);
    for (const pathname of ['/admin', '/admin/auth/login-admin', '/admin/landing-page/indeks-kepuasan-masyarakat/responden']) {
      expect(adminGuardRedirect({ pathname, roleId: 3, nav }), pathname).toBeNull();
    }
  });

  it('role 0 (developer) tidak dibatasi', () => {
    const nav = navFor(0, ['Musik']);
    expect(adminGuardRedirect({ pathname: '/admin/kesehatan/puskesmas', roleId: 0, nav })).toBeNull();
  });

  it('role 1 tetap bisa membuka User & Role & Pengaturan walau Menu Access-nya terbatas', () => {
    const nav = navFor(1, ['Musik']);
    expect(adminGuardRedirect({ pathname: '/admin/user&role/user', roleId: 1, nav })).toBeNull();
    expect(adminGuardRedirect({ pathname: '/admin/pengaturan/visibilitas-menu', roleId: 1, nav })).toBeNull();
  });

  it('fallback role-based (menuIds kosong) tetap: role 3 hanya Kesehatan + Musik', () => {
    const nav = navFor(3, []);
    expect(adminGuardRedirect({ pathname: '/admin/kesehatan/puskesmas', roleId: 3, nav })).toBeNull();
    expect(adminGuardRedirect({ pathname: '/admin/ppid/dasar-hukum', roleId: 3, nav })).toBe(
      '/admin/kesehatan/posyandu/list-posyandu',
    );
  });

  it('nav kosong → keluar ke /profile (tanpa loop di /admin)', () => {
    expect(adminGuardRedirect({ pathname: '/admin/musik', roleId: 2, nav: [] })).toBe('/profile');
  });
});
