// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import searchExtraPages from '@/con/search-extra-pages';
import searchMenu, {
  flattenMenu,
  MENU_PREVIEW_COUNT,
  previewMenuResults,
} from '@/app/(public)/_com/searchMenu';
import { visibleMenu } from '@/app/(public)/_com/navbar-menu.logic';
import type { MenuItem } from '../../types/menu-item';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';

const GLOBAL_SEARCH = path.resolve(__dirname, '../../src/app/(public)/_com/globalSearch.tsx');
const SHOW_MORE = path.resolve(__dirname, '../../src/app/(public)/_com/SearchShowMoreButton.tsx');

/** Semua submenu ber-href langsung dari config navbar (sumber kebenaran yang sama dengan navbar). */
const submenus = navbarListMenu.flatMap((menu) =>
  (menu.children ?? []).filter((c) => c.href).map((c) => ({ menu: menu.name, name: c.name, href: c.href })),
);
/** Submenu yang tampil di menu publik (item `hidden` dibuang) = yang boleh ditemukan pencarian. */
const visibleHrefs = new Set(flattenMenu(visibleMenu(navbarListMenu)).map((m) => m.href));
const visibleSubmenus = submenus.filter((s) => visibleHrefs.has(s.href));

const FIXTURE: MenuItem[] = [
  {
    id: '1',
    name: 'Keamanan',
    children: [
      { id: '1.1', name: 'Tips Keamanan', href: '/k/tips' },
      { id: '1.2', name: 'Keamanan Lingkungan', href: '/k/lingkungan' },
      { id: '1.3', name: 'CCTV', href: '/k/cctv' },
    ],
  },
  {
    id: '2',
    name: 'Lingkungan',
    children: [
      { id: '2.1', name: 'Gotong Royong', href: '/l/gotong' },
      { id: '2.2', name: 'Data Lingkungan Desa', href: '/l/data' },
    ],
  },
  {
    id: '3',
    name: 'Kosong',
    children: [{ id: '3.1', name: 'Tanpa Link', children: [{ id: '3.1.1', name: 'x', href: '/x' }] }],
  },
]; // test-only

describe('flattenMenu', () => {
  it('meratakan submenu jadi { label, parent, href } dan membuang submenu tanpa href', () => {
    const flat = flattenMenu(FIXTURE);
    expect(flat).toHaveLength(5);
    expect(flat[0]).toEqual({ id: '1.1', label: 'Tips Keamanan', parent: 'Keamanan', href: '/k/tips' });
    expect(flat.map((f) => f.label)).not.toContain('Tanpa Link');
  });

  it('config navbar nyata menghasilkan semua submenu ber-href', () => {
    expect(submenus.length).toBeGreaterThanOrEqual(68);
    expect(flattenMenu(navbarListMenu)).toHaveLength(submenus.length);
  });
});

describe('searchMenu pada config navbar nyata', () => {
  it('setiap submenu ber-href ditemukan saat namanya dicari (asli & huruf kecil)', () => {
    const missing: string[] = [];
    for (const s of visibleSubmenus) {
      for (const q of [s.name, s.name.toLowerCase()]) {
        const hrefs = searchMenu(q).map((r) => r.href);
        if (!hrefs.includes(s.href)) missing.push(`${s.menu} › ${s.name} (q="${q}")`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('hasil pertama pencarian nama submenu berawalan nama itu (submenu itu sendiri atau senama/berawalan sama)', () => {
    const wrongFirst = visibleSubmenus
      .filter((s) => !searchMenu(s.name)[0]?.label.toLowerCase().startsWith(s.name.toLowerCase()))
      .map((s) => s.name);
    expect(wrongFirst).toEqual([]);
    // "Profil PPID" (PPID) lebih dulu di config daripada "Profil" (Desa); keduanya berawalan "profil".
    expect(searchMenu('Profil').map((r) => r.href)).toEqual(
      expect.arrayContaining(['/ppid/profil-ppid', '/pemerintahan/profil']),
    );
  });

  it('nama menu utama "keamanan" mengembalikan ketujuh submenu Keamanan', () => {
    const keamanan = submenus.filter((s) => s.menu === 'Keamanan');
    expect(keamanan).toHaveLength(7);
    const hrefs = searchMenu('keamanan').map((r) => r.href);
    for (const s of keamanan) expect(hrefs).toContain(s.href);
  });

  it('substring "polsek" menemukan Polsek Terdekat', () => {
    expect(searchMenu('polsek')).toEqual([
      { id: expect.any(String), label: 'Polsek Terdekat', parent: 'Keamanan', href: '/keamanan/polsek-terdekat' },
    ]);
  });

  it('"Struktur PPID" menemukan halaman struktur PPID di urutan pertama', () => {
    expect(searchMenu('Struktur PPID')[0]?.href).toBe('/ppid/struktur-ppid');
  });

  it('query dengan spasi di tepi tetap cocok', () => {
    expect(searchMenu('  CCTV  ')[0]?.href).toBe('/keamanan/cctv');
  });

  it('tanpa batas default: query umum tidak memotong halaman yang cocok', () => {
    const labels = searchMenu('kesehatan').map((r) => `${r.parent} › ${r.label}`);
    expect(labels).toContain('Kesehatan › Kontak Darurat');
    expect(labels).toContain('Kesehatan › Program Kesehatan');
    expect(searchMenu('a').length).toBeGreaterThan(8);
    expect(searchMenu('a')).toEqual(searchMenu('a', undefined, Infinity));
  });

  it('setiap href di navbar-list-menu.ts cocok dengan page.tsx nyata', () => {
    const routes = publicRoutes();
    const broken = submenus.filter((s) => !matchesRealPage(s.href, routes)).map((s) => s.href);
    expect(broken).toEqual([]);
  });
});

describe('searchMenu: aturan pencocokan & urutan', () => {
  it('query kosong atau hanya spasi → []', () => {
    expect(searchMenu('', FIXTURE)).toEqual([]);
    expect(searchMenu('   ', FIXTURE)).toEqual([]);
    expect(searchMenu('')).toEqual([]);
  });

  it('tidak ada yang cocok → []', () => {
    expect(searchMenu('zzzqqq', FIXTURE)).toEqual([]);
  });

  it('urutan: awal nama submenu > tengah nama submenu > hanya nama menu utama', () => {
    // "Keamanan Lingkungan" (awal) > "Tips Keamanan" (tengah) > "CCTV" (hanya parent Keamanan)
    expect(searchMenu('keamanan', FIXTURE).map((r) => r.label)).toEqual([
      'Keamanan Lingkungan',
      'Tips Keamanan',
      'CCTV',
    ]);
    // "Keamanan Lingkungan" & "Data Lingkungan Desa" sama-sama tengah → urutan config;
    // "Gotong Royong" hanya cocok di nama menu utama → paling bawah.
    expect(searchMenu('LINGKUNGAN', FIXTURE).map((r) => r.label)).toEqual([
      'Keamanan Lingkungan',
      'Data Lingkungan Desa',
      'Gotong Royong',
    ]);
  });

  it('peringkat sama mengikuti urutan config', () => {
    // semua "an" di tengah nama submenu → urutan config, lalu yang hanya cocok di nama menu utama
    expect(searchMenu('an', FIXTURE).map((r) => r.label)).toEqual([
      'Tips Keamanan',
      'Keamanan Lingkungan',
      'Data Lingkungan Desa',
      'CCTV',
      'Gotong Royong',
    ]);
  });

  it('parameter limit memotong hasil', () => {
    expect(searchMenu('keamanan', FIXTURE, 2)).toHaveLength(2);
  });
});

describe('halaman tambahan di luar navbar (search-extra-pages.ts)', () => {
  const extras = flattenMenu(searchExtraPages);
  const navbar = flattenMenu(navbarListMenu);

  it('daftar halaman tambahan terisi dan semuanya ber-href', () => {
    expect(extras.length).toBeGreaterThanOrEqual(12);
    expect(extras).toHaveLength(searchExtraPages.flatMap((g) => g.children ?? []).length);
  });

  it('setiap href halaman tambahan cocok dengan page.tsx nyata (bukan placeholder [sub])', () => {
    const routes = publicRoutes();
    const broken = extras.filter((e) => !matchesRealPage(e.href, routes)).map((e) => e.href);
    expect(broken).toEqual([]);
  });

  it('bukan halaman create, detail, hasil form, atau daftar "semua"', () => {
    const forbidden = extras.filter((e) => /\/(create|detail|berhasil|gagal|semua[^/]*)(\/|$)|\[/.test(e.href));
    expect(forbidden).toEqual([]);
  });

  it('tidak ada href atau id duplikat antara navbar dan halaman tambahan', () => {
    const all = [...navbar, ...extras];
    const dup = (key: 'href' | 'id') => all.map((m) => m[key]).filter((v, i, arr) => arr.indexOf(v) !== i);
    expect(dup('href')).toEqual([]);
    expect(dup('id')).toEqual([]);
    const groupIds = [...navbarListMenu, ...searchExtraPages].map((g) => g.id);
    expect(new Set(groupIds).size).toBe(groupIds.length);
  });

  it.each([
    ['apbdes', 'APBDes', '/apbdes'],
    ['pengaduan', 'Pengaduan Masyarakat', '/inovasi/layanan-online-desa/pengaduan-masyarakat'],
    ['ajukan surat', 'Administrasi Online (Ajukan Surat)', '/inovasi/layanan-online-desa/administrasi-online'],
    ['struktur perangkat', 'Struktur Perangkat Desa', '/pemerintahan/profil/struktur-perangkat-desa'],
    ['anti korupsi', 'Desa Anti Korupsi', '/desa-anti-korupsi'],
    ['sdgs', 'SDGs Desa', '/sdgs-desa'],
  ])('default searchMenu("%s") → hasil pertama %s', (q, label, href) => {
    expect(searchMenu(q)[0]).toMatchObject({ label, href });
  });

  it('peringkat sama: submenu navbar tetap di atas halaman tambahan', () => {
    // keduanya berawalan "struktur": "Struktur PPID" (navbar) & "Struktur Perangkat Desa" (tambahan)
    const labels = searchMenu('struktur').map((r) => r.label);
    expect(labels.indexOf('Struktur PPID')).toBeGreaterThan(-1);
    expect(labels.indexOf('Struktur Perangkat Desa')).toBeGreaterThan(-1);
    expect(labels.indexOf('Struktur PPID')).toBeLessThan(labels.indexOf('Struktur Perangkat Desa'));
  });

  it('halaman tambahan tidak ikut bila menus dioper sendiri (hanya navbar)', () => {
    expect(searchMenu('apbdes', navbarListMenu)).toEqual([]);
  });
});

describe('previewMenuResults', () => {
  const make = (n: number) => Array.from({ length: n }, (_, i) => `h${i + 1}`); // test-only

  it('pratinjau default 5 hasil', () => {
    expect(MENU_PREVIEW_COUNT).toBe(5);
  });

  it('≤ 5 hasil → semua visible, hiddenCount 0', () => {
    expect(previewMenuResults(make(5), false)).toEqual({ visible: make(5), hiddenCount: 0 });
    expect(previewMenuResults(make(3), false)).toEqual({ visible: make(3), hiddenCount: 0 });
    expect(previewMenuResults([], false)).toEqual({ visible: [], hiddenCount: 0 });
  });

  it('11 hasil tertutup → visible 5 teratas berurutan, hiddenCount 6', () => {
    expect(previewMenuResults(make(11), false)).toEqual({ visible: ['h1', 'h2', 'h3', 'h4', 'h5'], hiddenCount: 6 });
  });

  it('expanded → semua visible berurutan, hiddenCount 0', () => {
    expect(previewMenuResults(make(11), true)).toEqual({ visible: make(11), hiddenCount: 0 });
  });

  it('previewCount bisa dioper dan input tidak dimutasi', () => {
    const input = make(4);
    expect(previewMenuResults(input, false, 2)).toEqual({ visible: ['h1', 'h2'], hiddenCount: 2 });
    expect(input).toEqual(make(4));
  });

  // "pemerintahan" (bukan "kesehatan"): 4 submenu Kesehatan default-hidden, sisa hasilnya < 5.
  it('hasil nyata "pemerintahan" tertutup → 5 tampil, sisanya tersembunyi', () => {
    const all = searchMenu('pemerintahan');
    expect(all.length).toBeGreaterThan(5);
    const { visible, hiddenCount } = previewMenuResults(all, false);
    expect(visible).toEqual(all.slice(0, 5));
    expect(hiddenCount).toBe(all.length - 5);
  });
});

describe('globalSearch.tsx memakai hasil menu', () => {
  const src = readFileSync(GLOBAL_SEARCH, 'utf8');

  it('menghitung hasil menu dari searchMenu(query) tanpa menunggu API', () => {
    // Menu efektif (default + override DB) dioper eksplisit dari useMenuVisibility.
    expect(src).toMatch(/searchMenu\(snap\.query, searchMenus\)/);
  });

  it('menampilkan bagian "Halaman" dan "Tidak ada hasil" hanya bila menu & API kosong', () => {
    expect(src).toContain('Halaman');
    expect(src).toMatch(/menuResults\.length === 0/);
  });

  it('memotong hasil lewat previewMenuResults dan merender tombol "halaman lainnya"', () => {
    expect(src).toMatch(/previewMenuResults\(menuResults, expanded\)/);
    expect(src).toMatch(/menuPreview\.visible\.map/);
    expect(src).toMatch(/menuPreview\.hiddenCount > 0/);
    expect(src).not.toMatch(/menuResults\.map/);
    const button = readFileSync(SHOW_MORE, 'utf8');
    expect(button).toContain('halaman lainnya');
    expect(button).toMatch(/UnstyledButton[\s\S]*type="button"/);
  });

  it('expanded di-reset saat query berubah dan saat clearSearch', () => {
    expect(src).toMatch(/setExpanded\(false\);[^\n]*\n\s*\}, \[snap\.query\]\)/);
    const clear = src.slice(src.indexOf('const clearSearch'));
    expect(clear.slice(0, clear.indexOf('};'))).toContain('setExpanded(false)');
  });
});
