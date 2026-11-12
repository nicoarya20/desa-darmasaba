// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/(public)/_com/searchMenu';
import { desaMenu, ekonomiMenu } from '@/app/admin/_com/nav/domains';

const ROOT = path.resolve(__dirname, '../..');

// Rename label menu (PM task 00202485): "Desa" → "Pemerintahan". Hanya label; id & path tetap.
describe('label menu "Pemerintahan" (sebelumnya "Desa")', () => {
  it('navbar publik: menu id "2" berlabel "Pemerintahan" dengan href /pemerintahan/* tetap', () => {
    const menu = navbarListMenu.find((m) => m.id === '2');
    expect(menu?.name).toBe('Pemerintahan');
    const hrefs = (menu?.children ?? []).map((c) => c.href);
    expect(hrefs).toContain('/pemerintahan/profil');
    expect(hrefs).toContain('/pemerintahan/berita/semua');
  });

  it('navbar publik & search tidak lagi punya menu utama berlabel "Desa"', () => {
    expect(navbarListMenu.map((m) => m.name)).not.toContain('Desa');
    expect(DEFAULT_SEARCH_MENUS.map((m) => m.name)).not.toContain('Desa');
  });

  it('search menu: halaman /pemerintahan/* tampil dengan parent "Pemerintahan"', () => {
    const flat = flattenMenu(DEFAULT_SEARCH_MENUS);
    const profil = flat.find((i) => i.href === '/pemerintahan/profil');
    const video = flat.find((i) => i.href === '/pemerintahan/galery/video');
    expect(profil?.parent).toBe('Pemerintahan');
    expect(video?.parent).toBe('Pemerintahan');
  });

  it('admin: desaMenu berlabel "Pemerintahan", id "Desa" tetap & path pindah ke /admin/pemerintahan/*', () => {
    expect(desaMenu.id).toBe('Desa');
    expect(desaMenu.name).toBe('Pemerintahan');
    expect(desaMenu.children?.[0]).toEqual({
      id: 'desa.profil',
      name: 'Profil',
      path: '/admin/pemerintahan/profil/profil-desa',
      basePath: '/admin/pemerintahan/profil',
    });
  });
});

// Pindah route admin (task RA): route lama grup "desa" → /admin/pemerintahan/*. id menu & API /api/desa tetap.
describe('route admin grup Pemerintahan', () => {
  const ADMIN_ROOT = path.join(ROOT, 'src/app/admin/(dashboard)');
  const paths = (desaMenu.children ?? []).map((c) => c.path);

  it('semua path menu diawali /admin/pemerintahan/ dan tidak ada yang masih di route lama "desa"', () => {
    // 10: menu Penghargaan (dulu Desa_7) dihapus — dikelola di Landing Page > Prestasi dan Penghargaan;
    // Struktur Perangkat Desa (desa.struktur-perangkat-desa) ditambahkan.
    expect(paths).toHaveLength(10);
    expect(paths).not.toContain('/admin/pemerintahan/penghargaan');
    for (const p of paths) expect(p, p).toMatch(/^\/admin\/pemerintahan\//);
    expect(paths.filter((p) => /^\/admin\/desa(\/|$)/.test(p))).toEqual([]);
  });

  it('setiap path menu punya page.tsx di folder pemerintahan, folder lama sudah tidak ada', () => {
    for (const p of paths) {
      const page = path.join(ADMIN_ROOT, p.replace(/^\/admin\//, ''), 'page.tsx');
      expect(existsSync(page), page).toBe(true);
    }
    expect(existsSync(path.join(ADMIN_ROOT, 'desa'))).toBe(false);
  });
});

// Rename submenu Ekonomi (PM task c00b8e35): "Program Kemiskinan" → "Program Pengentasan Kemiskinan".
describe('label submenu "Program Pengentasan Kemiskinan"', () => {
  const LABEL = 'Program Pengentasan Kemiskinan';
  const OLD_LABEL = /Program Kemiskinan/;
  const PUBLIC_HREF = '/ekonomi/program-kemiskinan';
  const ADMIN_DIR = path.join(ROOT, 'src/app/admin/(dashboard)/ekonomi/program-kemiskinan');

  it('navbar publik: submenu Ekonomi berlabel baru dengan href tetap', () => {
    const child = navbarListMenu.flatMap((m) => m.children ?? []).find((c) => c.href === PUBLIC_HREF);
    expect(child?.name).toBe(LABEL);
    expect(flattenMenu(DEFAULT_SEARCH_MENUS).find((i) => i.href === PUBLIC_HREF)?.label).toBe(LABEL);
  });

  it('admin: ekonomiMenu berlabel baru dengan path tetap', () => {
    expect(ekonomiMenu.children?.find((c) => c.id === 'ekonomi.program-kemiskinan')).toEqual({
      id: 'ekonomi.program-kemiskinan',
      name: LABEL,
      path: '/admin/ekonomi/program-kemiskinan',
      basePath: '/admin/ekonomi/program-kemiskinan',
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
      path.join(ROOT, 'src/app/(public)/(pages)/ekonomi/program-kemiskinan/page.tsx'),
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
