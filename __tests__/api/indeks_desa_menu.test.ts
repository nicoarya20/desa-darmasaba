// @vitest-environment node
// Indeks Desa (IDM): pendaftaran menu. Admin: submenu di section Desa (Pemerintahan) dan tiap path punya page.tsx.
// Publik: submenu ikut pencarian global, Peta Informasi, dan sitemap, serta hilang dari sitemap bila disembunyikan admin.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/(public)/_com/searchMenu';
import { sitemapPaths } from '@/app/(public)/_com/sitemap.logic';
import { devBar, navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import { INDEKS_DESA_ADMIN_PATH, INDEKS_DESA_PUBLIC_PATH } from '@/lib/indeks-desa';

const ROOT = path.resolve(__dirname, '../..');
const ids = (menus: readonly { id: string }[]) => menus.map((m) => m.id);

describe('menu admin', () => {
  it('submenu ikut section Desa: ada di navBar, devBar, dan role 1; tidak di role admin kesehatan/pendidikan', () => {
    expect(desaMenu.children?.map((c) => c.id)).toContain('desa.indeks-desa');
    expect(ids(navBar)).toContain('Desa');
    expect(ids(devBar)).toContain('Desa');
    expect(ids(role1)).toContain('Desa');
    expect(ids(role2)).not.toContain('Desa');
    expect(ids(role3)).not.toContain('Desa');
    // Bukan section mandiri lagi: tidak ada section bernama "Indeks Desa" di sidebar mana pun.
    for (const bar of [navBar, devBar, role1, role2, role3]) expect(ids(bar)).not.toContain('Indeks Desa');
  });

  it('path menu = konstanta lib dan punya page.tsx daftar, create, dan edit', () => {
    expect(desaMenu.children?.find((c) => c.id === 'desa.indeks-desa')?.path).toBe(INDEKS_DESA_ADMIN_PATH);
    const base = path.join(ROOT, 'src/app/admin/(dashboard)/pemerintahan/indeks-desa');
    for (const page of ['page.tsx', 'create/page.tsx', '[id]/edit/page.tsx']) {
      expect(existsSync(path.join(base, page)), page).toBe(true);
    }
  });
});

describe('menu publik', () => {
  it('halaman publik ada di src/app/(public)/(pages)/pemerintahan/indeks-desa', () => {
    expect(INDEKS_DESA_PUBLIC_PATH).toBe('/pemerintahan/indeks-desa');
    expect(existsSync(path.join(ROOT, 'src/app/(public)/(pages)/pemerintahan/indeks-desa/page.tsx'))).toBe(true);
  });

  it('pencarian global: "Indeks Desa" ditemukan dengan induk "Pemerintahan"', () => {
    const item = flattenMenu(DEFAULT_SEARCH_MENUS).find((i) => i.href === INDEKS_DESA_PUBLIC_PATH);
    expect(item?.label).toBe('Indeks Desa');
    expect(item?.parent).toBe('Pemerintahan');
  });

  it('sitemap memuat halaman IDM; disembunyikan lewat override → tidak ada', () => {
    expect(sitemapPaths({})).toContain(INDEKS_DESA_PUBLIC_PATH);
    expect(sitemapPaths({ [INDEKS_DESA_PUBLIC_PATH]: false })).not.toContain(INDEKS_DESA_PUBLIC_PATH);
  });
});
