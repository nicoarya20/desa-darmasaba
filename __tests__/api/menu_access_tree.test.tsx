// @vitest-environment node
// Checkbox pohon halaman Menu Access: state induk/anak, toggle, dan kompresi simpan.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { NavItem } from '@/app/admin/_com/nav/domains';
import {
  menuIdsFromSelection,
  sectionState,
  selectionFromMenuIds,
  toggleLeaf,
  toggleSection,
} from '@/app/admin/(dashboard)/pengaturan/menu-access/_lib/menu-tree.logic';
import { MenuAccessTree } from '@/app/admin/(dashboard)/pengaturan/menu-access/_com/MenuAccessTree';

const child = (id: string, name: string) => ({ id, name, path: `/admin/${id}`, basePath: `/admin/${id}` });
const LANDING: NavItem = {
  id: 'Landing Page',
  name: 'Landing Page',
  path: '',
  children: [child('landing-page.apbdes', 'APBDes'), child('landing-page.sdgs', 'SDGs')],
}; // test-only
const MUSIK: NavItem = { id: 'Musik', name: 'Musik', path: '/admin/musik' }; // test-only
const TREE = [LANDING, MUSIK];

describe('selectionFromMenuIds', () => {
  it('ID section lama (kapitalisasi beda) → semua anak tercentang', () => {
    expect([...selectionFromMenuIds(TREE, [' landing page'])]).toEqual(['landing-page.apbdes', 'landing-page.sdgs']);
  });

  it('ID submenu dan section tanpa anak dipetakan, ID asing diabaikan', () => {
    const sel = selectionFromMenuIds(TREE, ['landing-page.sdgs', 'Musik', 'User & Role']);
    expect([...sel].sort()).toEqual(['Musik', 'landing-page.sdgs']);
  });
});

describe('sectionState', () => {
  it('unchecked / indeterminate / checked', () => {
    expect(sectionState(LANDING, new Set())).toBe('unchecked');
    expect(sectionState(LANDING, new Set(['landing-page.sdgs']))).toBe('indeterminate');
    expect(sectionState(LANDING, new Set(['landing-page.sdgs', 'landing-page.apbdes']))).toBe('checked');
    expect(sectionState(MUSIK, new Set(['Musik']))).toBe('checked');
  });
});

describe('toggleSection / toggleLeaf', () => {
  it('centang induk dari kosong/sebagian → semua anak; dari penuh → lepas semua', () => {
    const all = toggleSection(LANDING, new Set(['landing-page.sdgs']));
    expect(sectionState(LANDING, all)).toBe('checked');
    expect(sectionState(LANDING, toggleSection(LANDING, all))).toBe('unchecked');
  });

  it('toggle induk tidak menyentuh section lain dan tidak memutasi input', () => {
    const input = new Set(['Musik']);
    const next = toggleSection(LANDING, input);
    expect(next.has('Musik')).toBe(true);
    expect([...input]).toEqual(['Musik']);
  });

  it('toggle anak menambah lalu menghapus', () => {
    const on = toggleLeaf('landing-page.apbdes', new Set());
    expect(on.has('landing-page.apbdes')).toBe(true);
    expect(toggleLeaf('landing-page.apbdes', on).has('landing-page.apbdes')).toBe(false);
  });
});

describe('menuIdsFromSelection (kompresi simpan)', () => {
  it('semua anak tercentang → ID section saja', () => {
    expect(menuIdsFromSelection(TREE, new Set(['landing-page.apbdes', 'landing-page.sdgs', 'Musik']))).toEqual([
      'Landing Page',
      'Musik',
    ]);
  });

  it('sebagian → ID submenu; kosong → []', () => {
    expect(menuIdsFromSelection(TREE, new Set(['landing-page.sdgs']))).toEqual(['landing-page.sdgs']);
    expect(menuIdsFromSelection(TREE, new Set())).toEqual([]);
  });

  it('round-trip data lama: muat lalu simpan tetap ID section kanonik', () => {
    expect(menuIdsFromSelection(TREE, selectionFromMenuIds(TREE, ['landing page']))).toEqual(['Landing Page']);
  });
});

describe('MenuAccessTree (render)', () => {
  it('menampilkan induk + anak dan menandai induk indeterminate bila sebagian', () => {
    const html = renderToStaticMarkup(
      <MantineProvider>
        <MenuAccessTree tree={TREE} selected={new Set(['landing-page.sdgs'])} onChange={() => undefined} />
      </MantineProvider>,
    );
    for (const label of ['Landing Page', 'APBDes', 'SDGs', 'Musik']) expect(html).toContain(label);
    // Mantine merender ikon garis (viewBox 32x6) untuk checkbox indeterminate.
    expect((html.match(/viewBox="0 0 32 6"/g) ?? []).length).toBe(1);
    expect((html.match(/checked=""/g) ?? []).length).toBe(1);
  });
});
