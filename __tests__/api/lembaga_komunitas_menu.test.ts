// @vitest-environment node
// Lembaga & Komunitas: pendaftaran menu. Admin: submenu di section Desa (Pemerintahan) dengan ID permanen dan tiap path
// punya page.tsx. Publik: submenu Pemerintahan, ID navbar unik, ikut pencarian global, Peta Informasi, dan sitemap, serta
// hilang dari sitemap bila disembunyikan admin. Tidak tertukar dengan menu "Lembaga" pendidikan (sekolah PAUD).
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/(public)/_com/searchMenu';
import { sitemapPaths } from '@/app/(public)/_com/sitemap.logic';
import { devBar, navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import navbarListMenu from '@/con/navbar-list-menu';
import { LEMBAGA_KOMUNITAS_ADMIN_PATH, LEMBAGA_KOMUNITAS_PUBLIC_PATH } from '@/lib/lembaga-komunitas';

const ROOT = path.resolve(__dirname, '../..');
const ids = (menus: readonly { id: string }[]) => menus.map((m) => m.id);

describe('menu admin', () => {
  it('submenu ikut section Desa: ada di navBar, devBar, dan role 1; tidak di role admin kesehatan/pendidikan', () => {
    expect(desaMenu.children?.map((c) => c.id)).toContain('desa.lembaga-komunitas');
    expect(ids(navBar)).toContain('Desa');
    expect(ids(devBar)).toContain('Desa');
    expect(ids(role1)).toContain('Desa');
    expect(ids(role2)).not.toContain('Desa');
    expect(ids(role3)).not.toContain('Desa');
    for (const bar of [navBar, devBar, role1, role2, role3]) expect(ids(bar)).not.toContain('Lembaga & Komunitas');
  });

  it('ID permanen "desa.lembaga-komunitas", label, path & basePath = konstanta lib; punya page.tsx daftar, create, dan edit', () => {
    expect(desaMenu.children?.find((c) => c.id === 'desa.lembaga-komunitas')).toEqual({
      id: 'desa.lembaga-komunitas',
      name: 'Lembaga & Komunitas',
      path: LEMBAGA_KOMUNITAS_ADMIN_PATH,
      basePath: LEMBAGA_KOMUNITAS_ADMIN_PATH,
    });
    const base = path.join(ROOT, 'src/app/admin/(dashboard)/pemerintahan/lembaga-komunitas');
    for (const page of ['page.tsx', 'create/page.tsx', '[id]/edit/page.tsx']) {
      expect(existsSync(path.join(base, page)), page).toBe(true);
    }
  });
});

describe('menu publik', () => {
  const pemerintahan = navbarListMenu.find((m) => m.name === 'Pemerintahan');
  const item = pemerintahan?.children?.find((c) => c.href === LEMBAGA_KOMUNITAS_PUBLIC_PATH);

  it('submenu Pemerintahan, tampil secara default, bukan menu top-level; halaman publik ada', () => {
    expect(LEMBAGA_KOMUNITAS_PUBLIC_PATH).toBe('/pemerintahan/lembaga-komunitas');
    expect(item?.name).toBe('Lembaga & Komunitas');
    expect(item).not.toHaveProperty('hidden');
    expect(navbarListMenu.some((m) => m.name === 'Lembaga & Komunitas')).toBe(false);
    expect(existsSync(path.join(ROOT, 'src/app/(public)/(pages)/pemerintahan/lembaga-komunitas/page.tsx'))).toBe(true);
  });

  it('ID navbar unik di seluruh menu (ID baru tidak bentrok dengan yang sudah dipakai)', () => {
    const semua = navbarListMenu.flatMap((m) => [m.id, ...(m.children ?? []).map((c) => c.id)]);
    expect(item?.id).toBe('2.14');
    expect(new Set(semua).size).toBe(semua.length);
  });

  it('pencarian global: ditemukan dengan induk "Pemerintahan"', () => {
    const hasil = flattenMenu(DEFAULT_SEARCH_MENUS).find((i) => i.href === LEMBAGA_KOMUNITAS_PUBLIC_PATH);
    expect(hasil?.label).toBe('Lembaga & Komunitas');
    expect(hasil?.parent).toBe('Pemerintahan');
  });

  it('sitemap memuat halamannya; disembunyikan lewat override → tidak ada', () => {
    expect(sitemapPaths({})).toContain(LEMBAGA_KOMUNITAS_PUBLIC_PATH);
    expect(sitemapPaths({ [LEMBAGA_KOMUNITAS_PUBLIC_PATH]: false })).not.toContain(LEMBAGA_KOMUNITAS_PUBLIC_PATH);
  });

  it('tidak tertukar dengan menu pendidikan "Lembaga" (sekolah PAUD): jalur publik dan admin berbeda', () => {
    const semuaHref = navbarListMenu.flatMap((m) => (m.children ?? []).map((c) => c.href));
    expect(semuaHref.filter((href) => href === LEMBAGA_KOMUNITAS_PUBLIC_PATH)).toHaveLength(1);
    expect(LEMBAGA_KOMUNITAS_ADMIN_PATH).not.toMatch(/pendidikan/);
  });
});
