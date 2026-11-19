// @vitest-environment node
// Indeks Desa (IDM): pendaftaran menu. Admin: section ada di sidebar role 0/1/ADMIN DESA dan tiap path punya page.tsx.
// Publik: submenu ikut pencarian global, Peta Informasi, dan sitemap, serta hilang dari sitemap bila disembunyikan admin.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/(public)/_com/searchMenu';
import { sitemapPaths } from '@/app/(public)/_com/sitemap.logic';
import { devBar, navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';
import { indeksDesaMenu } from '@/app/admin/_com/nav/domains';
import { INDEKS_DESA_ADMIN_PATH, INDEKS_DESA_PUBLIC_PATH } from '@/lib/indeks-desa';

const ROOT = path.resolve(__dirname, '../..');
const ids = (menus: readonly { id: string }[]) => menus.map((m) => m.id);

describe('menu admin', () => {
  it('section ada di navBar, devBar, dan role 1; tidak di role admin kesehatan/pendidikan', () => {
    expect(ids(navBar)).toContain('Indeks Desa');
    expect(ids(devBar)).toContain('Indeks Desa');
    expect(ids(role1)).toContain('Indeks Desa');
    expect(ids(role2)).not.toContain('Indeks Desa');
    expect(ids(role3)).not.toContain('Indeks Desa');
  });

  it('path menu = konstanta lib dan punya page.tsx daftar, create, dan edit', () => {
    expect(indeksDesaMenu.children?.[0].path).toBe(INDEKS_DESA_ADMIN_PATH);
    const base = path.join(ROOT, 'src/app/admin/(dashboard)/indeks-desa/idm');
    for (const page of ['page.tsx', 'create/page.tsx', '[id]/edit/page.tsx']) {
      expect(existsSync(path.join(base, page)), page).toBe(true);
    }
  });
});

describe('menu publik', () => {
  it('halaman publik ada di src/app/(public)/(pages)/indeks-desa/idm', () => {
    expect(INDEKS_DESA_PUBLIC_PATH).toBe('/indeks-desa/idm');
    expect(existsSync(path.join(ROOT, 'src/app/(public)/(pages)/indeks-desa/idm/page.tsx'))).toBe(true);
  });

  it('pencarian global: "Indeks Desa Membangun" ditemukan dengan induk "Indeks Desa"', () => {
    const item = flattenMenu(DEFAULT_SEARCH_MENUS).find((i) => i.href === INDEKS_DESA_PUBLIC_PATH);
    expect(item?.label).toBe('Indeks Desa Membangun (IDM)');
    expect(item?.parent).toBe('Indeks Desa');
  });

  it('sitemap memuat halaman IDM; disembunyikan lewat override → tidak ada', () => {
    expect(sitemapPaths({})).toContain(INDEKS_DESA_PUBLIC_PATH);
    expect(sitemapPaths({ [INDEKS_DESA_PUBLIC_PATH]: false })).not.toContain(INDEKS_DESA_PUBLIC_PATH);
  });
});
