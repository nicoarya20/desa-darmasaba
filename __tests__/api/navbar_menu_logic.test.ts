// @vitest-environment node
import { describe, expect, it } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import stateNav from '@/state/state-nav';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isAdminRole,
  isMenuActive,
  isPathActive,
} from '@/app/darmasaba/_com/navbar-menu.logic';
import type { MenuItem } from '../../types/menu-item';

const PPID: MenuItem = {
  id: '1',
  name: 'PPID',
  children: [
    { id: '1.1', name: 'Profil PPID', href: '/darmasaba/ppid/profil-ppid' },
    { id: '1.2', name: 'Struktur PPID', href: '/darmasaba/ppid/struktur-ppid' },
  ],
}; // test-only

describe('isPathActive', () => {
  it('cocok untuk path persis dan sub-path', () => {
    expect(isPathActive('/darmasaba/desa/profil', '/darmasaba/desa/profil')).toBe(true);
    expect(isPathActive('/darmasaba/desa/profil/sejarah', '/darmasaba/desa/profil')).toBe(true);
  });

  it('tidak cocok untuk prefix string yang bukan segmen path', () => {
    expect(isPathActive('/darmasaba/desa/profil-lain', '/darmasaba/desa/profil')).toBe(false);
  });

  it('false bila href kosong', () => {
    expect(isPathActive('/darmasaba', undefined)).toBe(false);
  });
});

describe('isMenuActive', () => {
  it('aktif bila path berada di salah satu submenu', () => {
    expect(isMenuActive(PPID, '/darmasaba/ppid/struktur-ppid')).toBe(true);
  });

  it('tidak aktif di halaman domain lain', () => {
    expect(isMenuActive(PPID, '/darmasaba/desa/profil')).toBe(false);
  });
});

describe('isAdminRole', () => {
  it('true untuk role admin 0–4', () => {
    expect([0, 1, 2, 3, 4].every(isAdminRole)).toBe(true);
  });

  it('false untuk tamu (belum login) dan role di luar daftar', () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(5)).toBe(false);
  });
});

describe('navbarListMenu (data yang dipakai flyout)', () => {
  it('id menu utama unik, karena flyout mencari menu terbuka berdasarkan id', () => {
    const ids = navbarListMenu.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('setiap submenu punya href internal /darmasaba', () => {
    const hrefs = navbarListMenu.flatMap((m) => (m.children ?? []).map((c) => c.href));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => href?.startsWith('/darmasaba/'))).toBe(true);
  });
});

describe('stateNav.clear', () => {
  it('menutup flyout menu dan pencarian', () => {
    stateNav.openMenuId = '2';
    stateNav.isSearch = true;
    stateNav.clear();
    expect(stateNav.openMenuId).toBeNull();
    expect(stateNav.isSearch).toBe(false);
  });
});

describe('navbar.module.css', () => {
  // Lightning CSS (Turbopack) menggabungkan `backdrop-filter` + `-webkit-backdrop-filter`
  // menjadi hanya versi -webkit- yang diabaikan Chrome → blur overlay hilang.
  it('tidak menulis -webkit-backdrop-filter manual (biar compiler yang menambah prefix)', () => {
    const css = readFileSync(
      path.resolve(__dirname, '../../src/app/darmasaba/_com/navbar.module.css'),
      'utf8',
    );
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(declarations).toContain('backdrop-filter: blur(');
    expect(declarations).not.toContain('-webkit-backdrop-filter');
  });
});
