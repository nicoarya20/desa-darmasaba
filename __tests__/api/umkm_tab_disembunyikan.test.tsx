// @vitest-environment node
// Admin UMKM menampilkan tab Data UMKM, Produk, dan Kategori Produk; Dashboard dan Penjualan
// masih disembunyikan (bukan dihapus) — docs/debt/2026-11-12-umkm-tab-disembunyikan.md
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/ekonomi/umkm/data-umkm',
  useRouter: () => ({ push: vi.fn() }),
}));

import LayoutTabs from '@/app/admin/(dashboard)/ekonomi/umkm/_lib/layoutTabs';
import {
  HIDDEN_UMKM_TABS,
  UMKM_TABS,
  shouldShowUmkmTabBar,
  visibleUmkmTabs,
} from '@/app/admin/(dashboard)/ekonomi/umkm/_lib/umkm-tabs.logic';
import { ekonomiMenu } from '@/app/admin/_com/nav/domains';
import navbarListMenu from '@/con/navbar-list-menu';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(
    /<style[\s\S]*?<\/style>/g,
    '',
  );

describe('tab admin UMKM yang disembunyikan', () => {
  it('daftar tersembunyi tinggal Dashboard dan Penjualan', () => {
    expect([...HIDDEN_UMKM_TABS].sort()).toEqual(['dashboard', 'penjualan'].sort());
  });

  it('tab yang tampil: Data UMKM, Produk, Kategori Produk — sehingga bar tab dirender', () => {
    const tabs = visibleUmkmTabs();
    expect(tabs.map((t) => t.value)).toEqual(['data-umkm', 'produk', 'kategori-produk']);
    expect(tabs.map((t) => t.href)).toEqual([
      '/admin/ekonomi/umkm/data-umkm',
      '/admin/ekonomi/umkm/produk',
      '/admin/ekonomi/umkm/kategori-produk',
    ]);
    expect(shouldShowUmkmTabBar(tabs)).toBe(true);
  });

  it('satu tab saja tidak memerlukan bar tab', () => {
    const tabs = visibleUmkmTabs(UMKM_TABS, ['dashboard', 'produk', 'penjualan', 'kategori-produk']);
    expect(tabs.map((t) => t.value)).toEqual(['data-umkm']);
    expect(shouldShowUmkmTabBar(tabs)).toBe(false);
  });

  it('tab disembunyikan, bukan dihapus: konfigurasi kelima tab tetap ada', () => {
    expect(UMKM_TABS.map((t) => t.value)).toEqual([
      'dashboard',
      'data-umkm',
      'produk',
      'penjualan',
      'kategori-produk',
    ]);
  });

  it('daftar tersembunyi kosong memunculkan kembali semua tab beserta bar tab', () => {
    const tabs = visibleUmkmTabs(UMKM_TABS, []);
    expect(tabs).toHaveLength(UMKM_TABS.length);
    expect(shouldShowUmkmTabBar(tabs)).toBe(true);
  });

  it('SSR LayoutTabs: judul, bar tab dengan 3 tab tampil, tanpa label tab tersembunyi', () => {
    const html = render(
      <LayoutTabs>
        <p>Isi Data UMKM</p>
      </LayoutTabs>,
    );
    expect(html).toContain('Manajemen UMKM');
    expect(html).toContain('<p>Isi Data UMKM</p>');
    expect(html).toContain('role="tablist"');
    // Bar tab desktop + mobile masing-masing merender 3 tab.
    expect(html.match(/role="tab"/g)).toHaveLength(6);
    for (const label of ['Data UMKM', 'Produk', 'Kategori Produk']) {
      expect(html).toContain(label);
    }
    for (const label of ['Dashboard', 'Penjualan']) {
      expect(html).not.toContain(label);
    }
  });

  it('menu sidebar UMKM membuka Data UMKM; ID & basePath tetap', () => {
    const umkm = ekonomiMenu.children?.find((c) => c.id === 'ekonomi.umkm');
    expect(umkm?.path).toBe('/admin/ekonomi/umkm/data-umkm');
    expect(umkm?.basePath).toBe('/admin/ekonomi/umkm');
  });

  it('label menu UMKM menjadi "UMKM & Pasar Desa" di sidebar admin dan navbar publik', () => {
    const sidebar = ekonomiMenu.children?.find((c) => c.id === 'ekonomi.umkm');
    expect(sidebar?.name).toBe('UMKM & Pasar Desa');
    const navbar = navbarListMenu.flatMap((m) => m.children ?? []).find((c) => c.href === '/ekonomi/umkm');
    expect(navbar?.name).toBe('UMKM & Pasar Desa');
  });
});
