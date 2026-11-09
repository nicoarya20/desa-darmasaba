// @vitest-environment node
// Visibilitas menu publik: item `hidden` di navbar-list-menu.ts disaring di satu tempat (`visibleMenu`).
import { describe, it, expect } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import { visibleMenu } from '@/app/darmasaba/_com/navbar-menu.logic';
import searchMenu, { DEFAULT_SEARCH_MENUS, flattenMenu } from '@/app/darmasaba/_com/searchMenu';
import type { MenuItem } from '../../types/menu-item';

const HIDDEN_KESEHATAN = [
  { name: 'Data Kesehatan Warga', href: '/darmasaba/kesehatan/data-kesehatan-warga' },
  { name: 'Puskesmas', href: '/darmasaba/kesehatan/puskesmas' },
  { name: 'Penanganan Darurat', href: '/darmasaba/kesehatan/penanganan-darurat' },
  { name: 'Info Wabah/Penyakit', href: '/darmasaba/kesehatan/info-wabah-penyakit' },
];

const visible = visibleMenu(navbarListMenu);
const kesehatanOf = (menus: readonly MenuItem[]) => menus.find((m) => m.name === 'Kesehatan');

describe('visibleMenu pada config navbar nyata', () => {
  it('memuat menu link langsung "DAK" → /darmasaba/desa-anti-korupsi', () => {
    expect(visible.find((m) => m.name === 'DAK')).toMatchObject({ href: '/darmasaba/desa-anti-korupsi' });
  });

  it('Kesehatan hanya menampilkan Posyandu, Program Kesehatan, Kontak Darurat (urutan config)', () => {
    expect(kesehatanOf(visible)?.children?.map((c) => c.name)).toEqual([
      'Posyandu',
      'Program Kesehatan',
      'Kontak Darurat',
    ]);
  });

  it('4 submenu Kesehatan tersembunyi tetap ada di data sumber dengan href lama', () => {
    const source = kesehatanOf(navbarListMenu)?.children ?? [];
    for (const h of HIDDEN_KESEHATAN) {
      expect(source.find((c) => c.name === h.name)).toMatchObject({ href: h.href, hidden: true });
    }
  });

  it('menu lain tidak berubah: jumlah & urutan menu utama sama dengan sumber', () => {
    expect(visible.map((m) => m.id)).toEqual(navbarListMenu.map((m) => m.id));
  });
});

describe('item tersembunyi tidak muncul di pencarian menu', () => {
  const defaultHrefs = flattenMenu(DEFAULT_SEARCH_MENUS).map((m) => m.href);

  it.each(HIDDEN_KESEHATAN)('$name tidak ada di sumber default & hasil searchMenu', ({ name, href }) => {
    expect(defaultHrefs).not.toContain(href);
    expect(searchMenu(name).map((r) => r.href)).not.toContain(href);
  });

  it('submenu Kesehatan yang terlihat tetap bisa dicari', () => {
    expect(searchMenu('Posyandu')[0]?.href).toBe('/darmasaba/kesehatan/posyandu');
    expect(searchMenu('Program Kesehatan')[0]?.href).toBe('/darmasaba/kesehatan/program-kesehatan');
  });
});

describe('visibleMenu (fixture)', () => {
  const FIXTURE: MenuItem[] = [
    { id: '1', name: 'A', children: [{ id: '1.1', name: 'a1', href: '/a1' }, { id: '1.2', name: 'a2', href: '/a2', hidden: true }] },
    { id: '2', name: 'B', children: [{ id: '2.1', name: 'b1', href: '/b1', hidden: true }] },
    { id: '3', name: 'C', href: '/c' },
    { id: '4', name: 'D', href: '/d', hidden: true },
  ]; // test-only

  it('membuang item hidden, menu utama yang semua submenunya hidden, dan tidak memutasi sumber', () => {
    const result = visibleMenu(FIXTURE);
    expect(result.map((m) => m.id)).toEqual(['1', '3']);
    expect(result[0].children?.map((c) => c.id)).toEqual(['1.1']);
    expect(FIXTURE[0].children).toHaveLength(2);
  });
});
