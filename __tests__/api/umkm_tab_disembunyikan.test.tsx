// @vitest-environment node
// Admin UMKM sementara hanya menampilkan tab Data UMKM; Dashboard, Produk, Penjualan,
// dan Kategori Produk disembunyikan (bukan dihapus) — docs/debt/2026-11-12-umkm-tab-disembunyikan.md
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

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(
    /<style[\s\S]*?<\/style>/g,
    '',
  );

describe('tab admin UMKM yang disembunyikan', () => {
  it('daftar tersembunyi berisi tepat 4 tab yang diminta desa', () => {
    expect([...HIDDEN_UMKM_TABS].sort()).toEqual(
      ['dashboard', 'produk', 'penjualan', 'kategori-produk'].sort(),
    );
  });

  it('tab yang tampil hanya Data UMKM, sehingga bar tab tidak perlu', () => {
    const tabs = visibleUmkmTabs();
    expect(tabs.map((t) => t.value)).toEqual(['data-umkm']);
    expect(tabs[0].href).toBe('/admin/ekonomi/umkm/data-umkm');
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

  it('SSR LayoutTabs: judul + konten tampil, tanpa tablist dan tanpa label tab tersembunyi', () => {
    const html = render(
      <LayoutTabs>
        <p>Isi Data UMKM</p>
      </LayoutTabs>,
    );
    expect(html).toContain('Manajemen UMKM');
    expect(html).toContain('<p>Isi Data UMKM</p>');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="tab"');
    for (const label of ['Dashboard', 'Produk', 'Penjualan', 'Kategori Produk']) {
      expect(html).not.toContain(label);
    }
  });

  it('menu sidebar UMKM membuka Data UMKM; ID & basePath tetap', () => {
    const umkm = ekonomiMenu.children?.find((c) => c.id === 'ekonomi.umkm');
    expect(umkm?.path).toBe('/admin/ekonomi/umkm/data-umkm');
    expect(umkm?.basePath).toBe('/admin/ekonomi/umkm');
  });
});
