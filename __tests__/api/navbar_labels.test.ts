// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/darmasaba/_com/searchMenu';
import { desaMenu, ekonomiMenu } from '@/app/admin/_com/nav/domains';

const ROOT = path.resolve(__dirname, '../..');

// Rename label menu (PM task 00202485): "Desa" → "Pemerintahan". Hanya label; id & path tetap.
describe('label menu "Pemerintahan" (sebelumnya "Desa")', () => {
  it('navbar publik: menu id "2" berlabel "Pemerintahan" dengan href /darmasaba/pemerintahan/* tetap', () => {
    const menu = navbarListMenu.find((m) => m.id === '2');
    expect(menu?.name).toBe('Pemerintahan');
    const hrefs = (menu?.children ?? []).map((c) => c.href);
    expect(hrefs).toContain('/darmasaba/pemerintahan/profil');
    expect(hrefs).toContain('/darmasaba/pemerintahan/berita/semua');
  });

  it('navbar publik & search tidak lagi punya menu utama berlabel "Desa"', () => {
    expect(navbarListMenu.map((m) => m.name)).not.toContain('Desa');
    expect(DEFAULT_SEARCH_MENUS.map((m) => m.name)).not.toContain('Desa');
  });

  it('search menu: halaman /darmasaba/pemerintahan/* tampil dengan parent "Pemerintahan"', () => {
    const flat = flattenMenu(DEFAULT_SEARCH_MENUS);
    const profil = flat.find((i) => i.href === '/darmasaba/pemerintahan/profil');
    const video = flat.find((i) => i.href === '/darmasaba/pemerintahan/galery/video');
    expect(profil?.parent).toBe('Pemerintahan');
    expect(video?.parent).toBe('Pemerintahan');
  });

  it('admin: desaMenu berlabel "Pemerintahan", id "Desa" & path /admin/desa/* tetap', () => {
    expect(desaMenu.id).toBe('Desa');
    expect(desaMenu.name).toBe('Pemerintahan');
    expect(desaMenu.children?.[0]).toEqual({
      id: 'Desa_1',
      name: 'Profil',
      path: '/admin/desa/profil/profil-desa',
    });
  });
});

// Rename submenu Ekonomi (PM task c00b8e35): "Program Kemiskinan" → "Program Pengentasan Kemiskinan".
describe('label submenu "Program Pengentasan Kemiskinan"', () => {
  const LABEL = 'Program Pengentasan Kemiskinan';
  const OLD_LABEL = /Program Kemiskinan/;
  const PUBLIC_HREF = '/darmasaba/ekonomi/program-kemiskinan';
  const ADMIN_DIR = path.join(ROOT, 'src/app/admin/(dashboard)/ekonomi/program-kemiskinan');

  it('navbar publik: submenu Ekonomi berlabel baru dengan href tetap', () => {
    const child = navbarListMenu.flatMap((m) => m.children ?? []).find((c) => c.href === PUBLIC_HREF);
    expect(child?.name).toBe(LABEL);
    expect(flattenMenu(DEFAULT_SEARCH_MENUS).find((i) => i.href === PUBLIC_HREF)?.label).toBe(LABEL);
  });

  it('admin: ekonomiMenu berlabel baru dengan path tetap', () => {
    expect(ekonomiMenu.children?.find((c) => c.id === 'Ekonomi_8')).toEqual({
      id: 'Ekonomi_8',
      name: LABEL,
      path: '/admin/ekonomi/program-kemiskinan',
    });
  });

  it('label lama tidak ada lagi di config menu', () => {
    const names = [
      ...flattenMenu(DEFAULT_SEARCH_MENUS).map((i) => i.label),
      ...(ekonomiMenu.children ?? []).map((c) => c.name),
    ];
    expect(names.filter((n) => OLD_LABEL.test(n))).toEqual([]);
  });

  it('judul halaman publik & admin memakai label baru', () => {
    const files = [
      path.join(ROOT, 'src/app/darmasaba/(pages)/ekonomi/program-kemiskinan/page.tsx'),
      path.join(ADMIN_DIR, 'page.tsx'),
      path.join(ADMIN_DIR, 'create/page.tsx'),
      path.join(ADMIN_DIR, '[id]/page.tsx'),
      path.join(ADMIN_DIR, '[id]/edit/page.tsx'),
    ];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src, file).toContain(LABEL);
      expect(src, file).not.toMatch(OLD_LABEL);
    }
  });
});
