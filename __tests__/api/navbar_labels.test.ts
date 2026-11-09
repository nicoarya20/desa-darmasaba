// @vitest-environment node
import { describe, expect, it } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/darmasaba/_com/searchMenu';
import { desaMenu } from '@/app/admin/_com/nav/domains';

// Rename label menu (PM task 00202485): "Desa" → "Pemerintahan". Hanya label; id & path tetap.
describe('label menu "Pemerintahan" (sebelumnya "Desa")', () => {
  it('navbar publik: menu id "2" berlabel "Pemerintahan" dengan href /darmasaba/desa/* tetap', () => {
    const menu = navbarListMenu.find((m) => m.id === '2');
    expect(menu?.name).toBe('Pemerintahan');
    const hrefs = (menu?.children ?? []).map((c) => c.href);
    expect(hrefs).toContain('/darmasaba/desa/profil');
    expect(hrefs).toContain('/darmasaba/desa/berita/semua');
  });

  it('navbar publik & search tidak lagi punya menu utama berlabel "Desa"', () => {
    expect(navbarListMenu.map((m) => m.name)).not.toContain('Desa');
    expect(DEFAULT_SEARCH_MENUS.map((m) => m.name)).not.toContain('Desa');
  });

  it('search menu: halaman /darmasaba/desa/* tampil dengan parent "Pemerintahan"', () => {
    const flat = flattenMenu(DEFAULT_SEARCH_MENUS);
    const profil = flat.find((i) => i.href === '/darmasaba/desa/profil');
    const video = flat.find((i) => i.href === '/darmasaba/desa/galery/video');
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
