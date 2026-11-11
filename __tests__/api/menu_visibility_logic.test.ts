// @vitest-environment node
// Visibilitas efektif submenu publik = default `hidden` di navbar-list-menu.ts + override DB
// (key = href submenu). Juga pencocokan path 404 per segmen dan filter hasil pencarian.
import { describe, expect, it } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import {
  applyMenuOverrides,
  effectiveMenuVisibility,
  hiddenMenuHrefs,
  isKnownMenuKey,
  isPathHidden,
  menuVisibilityGroups,
  toOverrides,
} from '@/app/(public)/_com/menu-visibility.logic';
import { flattenMenu } from '@/app/(public)/_com/searchMenu';
import { petaInformasiGroups } from '@/app/(public)/(tambahan)/peta-informasi/_lib/petaInformasi';
import { isSearchResultHidden } from '@/app/(public)/_com/searchUrl';
import type { MenuItem } from '../../types/menu-item';

const PUSKESMAS = '/kesehatan/puskesmas';
const DATA_KESEHATAN = '/kesehatan/data-kesehatan-warga';
const POSYANDU = '/kesehatan/posyandu';
const CCTV = '/keamanan/cctv';
const DAK = '/desa-anti-korupsi';
const DEFAULT_HIDDEN = [
  DATA_KESEHATAN,
  PUSKESMAS,
  '/kesehatan/penanganan-darurat',
  '/kesehatan/info-wabah-penyakit',
];

const navbarHrefs = (menus: readonly MenuItem[]) => flattenMenu(menus).map((m) => m.href);

describe('merge default config + override → menu efektif', () => {
  it('tanpa override = perilaku lama: hanya 4 submenu Kesehatan default-hidden yang hilang', () => {
    const { navbarMenu, hiddenHrefs } = effectiveMenuVisibility({});
    expect(hiddenHrefs).toEqual(DEFAULT_HIDDEN);
    const hrefs = navbarHrefs(navbarMenu);
    for (const href of DEFAULT_HIDDEN) expect(hrefs).not.toContain(href);
    expect(hrefs).toContain(POSYANDU);
    expect(hrefs).toHaveLength(navbarHrefs(navbarListMenu).length - DEFAULT_HIDDEN.length);
  });

  it('override true menampilkan kembali item default-hidden', () => {
    const { navbarMenu, hiddenHrefs } = effectiveMenuVisibility({ [PUSKESMAS]: true });
    expect(navbarHrefs(navbarMenu)).toContain(PUSKESMAS);
    expect(hiddenHrefs).not.toContain(PUSKESMAS);
    expect(hiddenHrefs).toHaveLength(3);
  });

  it('override false menyembunyikan item yang default tampil, termasuk di sumber pencarian', () => {
    const { navbarMenu, searchMenus, hiddenHrefs } = effectiveMenuVisibility({ [CCTV]: false });
    expect(navbarHrefs(navbarMenu)).not.toContain(CCTV);
    expect(navbarHrefs(searchMenus)).not.toContain(CCTV);
    expect(hiddenHrefs).toContain(CCTV);
  });

  it('menu utama yang semua submenunya tersembunyi ikut hilang (DAK, 1 submenu)', () => {
    const { navbarMenu } = effectiveMenuVisibility({ [DAK]: false });
    expect(navbarMenu.map((m) => m.name)).not.toContain('DAK');
    expect(effectiveMenuVisibility({}).navbarMenu.map((m) => m.name)).toContain('DAK');
  });

  it('halaman tambahan pencarian di bawah href tersembunyi ikut dibuang & kembali saat ditampilkan', () => {
    const grafik = `${DATA_KESEHATAN}/grafik-penyakit`;
    expect(navbarHrefs(effectiveMenuVisibility({}).searchMenus)).not.toContain(grafik);
    expect(navbarHrefs(effectiveMenuVisibility({ [DATA_KESEHATAN]: true }).searchMenus)).toContain(grafik);
  });

  it('Peta Informasi memakai menu efektif yang dioper', () => {
    const { searchMenus } = effectiveMenuVisibility({ [CCTV]: false, [PUSKESMAS]: true });
    const hrefs = petaInformasiGroups('', searchMenus).flatMap((g) => g.pages.map((p) => p.href));
    expect(hrefs).not.toContain(CCTV);
    expect(hrefs).toContain(PUSKESMAS);
  });

  it('applyMenuOverrides tidak memutasi config & tidak mengubah label/urutan/href', () => {
    const before = JSON.stringify(navbarListMenu);
    const applied = applyMenuOverrides(navbarListMenu, { [CCTV]: false });
    expect(JSON.stringify(navbarListMenu)).toBe(before);
    expect(navbarHrefs(applied)).toEqual(navbarHrefs(navbarListMenu));
    expect(applied.map((m) => m.name)).toEqual(navbarListMenu.map((m) => m.name));
  });

  it('toOverrides mengabaikan baris DB dengan menuKey yang sudah tidak ada di config', () => {
    expect(toOverrides([
      { menuKey: CCTV, isVisible: false },
      { menuKey: '/menu-lama', isVisible: true },
    ])).toEqual({ [CCTV]: false });
  });

  it('hiddenMenuHrefs pada fixture: hanya submenu, sesuai override', () => {
    const fixture: MenuItem[] = [
      { id: '1', name: 'A', children: [{ id: '1.1', name: 'B', href: '/a/b' }, { id: '1.2', name: 'C', href: '/a/c', hidden: true }] },
    ];
    expect(hiddenMenuHrefs({}, fixture)).toEqual(['/a/c']);
    expect(hiddenMenuHrefs({ '/a/b': false, '/a/c': true }, fixture)).toEqual(['/a/b']);
  });
});

describe('pencocokan path 404 per segmen', () => {
  it('hide /a/b → /a/b dan /a/b/1 tersembunyi, /a/bc dan /a tidak', () => {
    expect(isPathHidden('/a/b', ['/a/b'])).toBe(true);
    expect(isPathHidden('/a/b/1', ['/a/b'])).toBe(true);
    expect(isPathHidden('/a/b/1/2', ['/a/b'])).toBe(true);
    expect(isPathHidden('/a/bc', ['/a/b'])).toBe(false);
    expect(isPathHidden('/a', ['/a/b'])).toBe(false);
    expect(isPathHidden('/a/b', [])).toBe(false);
  });

  it('contoh nyata: puskesmas & detailnya 404 secara default, posyandu tidak', () => {
    const { hiddenHrefs } = effectiveMenuVisibility({});
    expect(isPathHidden(PUSKESMAS, hiddenHrefs)).toBe(true);
    expect(isPathHidden(`${PUSKESMAS}/123`, hiddenHrefs)).toBe(true);
    expect(isPathHidden(POSYANDU, hiddenHrefs)).toBe(false);
    expect(isPathHidden('/', hiddenHrefs)).toBe(false);
  });
});

describe('validasi menuKey', () => {
  it('hanya href submenu navbar yang dikenal', () => {
    expect(isKnownMenuKey(CCTV)).toBe(true);
    expect(isKnownMenuKey(PUSKESMAS)).toBe(true);
    expect(isKnownMenuKey('/tidak-ada')).toBe(false);
    expect(isKnownMenuKey('/')).toBe(false);
    expect(isKnownMenuKey('3.3')).toBe(false);
    expect(isKnownMenuKey('/peta-informasi')).toBe(false); // halaman tambahan, bukan submenu navbar
  });
});

describe('hasil konten globalSearch', () => {
  it('hasil yang URL-nya di bawah href tersembunyi difilter, lainnya tetap', () => {
    const { hiddenHrefs } = effectiveMenuVisibility({});
    expect(isSearchResultHidden({ type: 'jadwalKegiatan', id: '1' }, hiddenHrefs)).toBe(true);
    expect(isSearchResultHidden({ type: 'puskesmas', id: '1' }, hiddenHrefs)).toBe(true);
    expect(isSearchResultHidden({ type: 'apbdes', id: '1' }, hiddenHrefs)).toBe(false);
    expect(isSearchResultHidden({ type: 'puskesmas', id: '1' }, effectiveMenuVisibility({ [PUSKESMAS]: true }).hiddenHrefs)).toBe(false);
  });
});

describe('grup halaman pengaturan admin', () => {
  it('urutan config, tandai default & override', () => {
    const groups = menuVisibilityGroups({ [PUSKESMAS]: true, [CCTV]: false });
    expect(groups.map((g) => g.name)).toEqual(navbarListMenu.map((m) => m.name));
    const items = groups.flatMap((g) => g.items);
    expect(items.find((i) => i.menuKey === PUSKESMAS)).toMatchObject({ defaultVisible: false, isVisible: true, overridden: true });
    expect(items.find((i) => i.menuKey === CCTV)).toMatchObject({ defaultVisible: true, isVisible: false, overridden: true });
    expect(items.find((i) => i.menuKey === POSYANDU)).toMatchObject({ defaultVisible: true, isVisible: true, overridden: false });
  });
});
