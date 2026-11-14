// @vitest-environment node
// Selama tab admin Penjualan disembunyikan, halaman produk UMKM publik tidak mencatat pesanan:
// tombol "Pesan Sekarang" diganti "Hubungi Penjual (WhatsApp)" — saklar UMKM_PESANAN_TERCATAT
// (src/lib/umkm-pesanan.ts), docs/debt/2026-11-12-umkm-tab-disembunyikan.md
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  detail: { state: { status: 'loading' } as { status: string; data?: unknown } },
  pesananModalRendered: { count: 0 },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useParams: () => ({ id: 'prd-1' }),
}));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/use-detail-produk', () => ({
  useDetailProduk: () => ({ state: h.detail.state, reload: () => undefined }),
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/PesananModal', () => ({
  PesananModal: () => {
    h.pesananModalRendered.count += 1;
    return null;
  },
}));

import DetailProdukPasarUser from '@/app/(public)/(pages)/ekonomi/umkm/produk/[id]/page';
import { HUBUNGI_PENJUAL_LABEL } from '@/app/(public)/(pages)/ekonomi/umkm/_com/HubungiPenjualButton';
import {
  WA_PENJUAL_TIDAK_VALID,
  buildHubungiPenjualMessage,
} from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';
import { HIDDEN_UMKM_TABS } from '@/app/admin/(dashboard)/ekonomi/umkm/_lib/umkm-tabs.logic';
import { UMKM_PESANAN_TERCATAT } from '@/lib/umkm-pesanan';

const render = () =>
  renderToStaticMarkup(
    <MantineProvider env="test">
      <DetailProdukPasarUser />
    </MantineProvider>,
  ).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk hasil adapter detail-produk (DetailProduk).
const produk = (kontak: string | null) => ({
  id: 'prd-1',
  nama: 'Keripik Pisang',
  harga: 15000,
  stok: 0,
  satuan: 'bungkus',
  isUnggulan: false,
  deskripsiHtml: '<p>Renyah</p>',
  fotos: [],
  kategori: null,
  alamat: null,
  linkTokoOnline: [{ id: 'l1', platform: 'SHOPEE', url: 'https://shopee.co.id/keripik' }],
  penjual: { id: 'u1', nama: 'Warung Bu Made', pemilik: null, alamat: null, kontak },
});
const siap = (kontak: string | null) => {
  h.detail.state = { status: 'ready', data: produk(kontak) };
};

const decodeHref = (html: string) => {
  const m = html.match(/href="(https:\/\/wa\.me\/[^"]+)"/);
  return m ? m[1].replace(/&amp;/g, '&') : null;
};

describe('saklar pesanan website ↔ tab admin Penjualan', () => {
  it('pesanan website mati tepat ketika tab Penjualan disembunyikan (nyalakan keduanya bersamaan)', () => {
    expect(UMKM_PESANAN_TERCATAT).toBe(!HIDDEN_UMKM_TABS.includes('penjualan'));
  });

  it('keadaan saat ini: tab Penjualan tersembunyi, pesanan website nonaktif', () => {
    expect(HIDDEN_UMKM_TABS).toContain('penjualan');
    expect(UMKM_PESANAN_TERCATAT).toBe(false);
  });
});

describe('SSR halaman produk UMKM saat pesanan website nonaktif', () => {
  beforeEach(() => {
    h.pesananModalRendered.count = 0;
  });

  it('merender tautan WhatsApp penjual (nomor ternormalisasi + nama produk), tanpa "Pesan Sekarang"', () => {
    siap('0812-3456-7890');

    const html = render();
    const href = decodeHref(html);

    expect(html).toContain(HUBUNGI_PENJUAL_LABEL);
    expect(html).not.toContain('Pesan Sekarang');
    expect(href).not.toBeNull();
    const url = new URL(href as string);
    expect(url.pathname).toBe('/6281234567890');
    expect(url.searchParams.get('text')).toBe(
      buildHubungiPenjualMessage({ umkmNama: 'Warung Bu Made', produkNama: 'Keripik Pisang' }),
    );
    expect(url.searchParams.get('text')).toContain('Keripik Pisang');
    expect(html).toMatch(/target="_blank"/);
    expect(html).toMatch(/rel="noopener noreferrer"/);
    // Stok 0 tidak memblokir: warga tetap bisa bertanya ke penjual.
    expect(html).not.toContain(WA_PENJUAL_TIDAK_VALID);
  });

  it('modal pesanan tidak dirender; tombol toko online tetap ada', () => {
    siap('081234567890');

    const html = render();

    expect(h.pesananModalRendered.count).toBe(0);
    expect(html).toContain('Beli juga di:');
    expect(html).toContain('href="https://shopee.co.id/keripik"');
  });

  it.each([null, '', '0361 123456'])('nomor penjual %j → tombol disabled + penjelasan', (kontak) => {
    siap(kontak);

    const html = render();

    expect(html).toContain(HUBUNGI_PENJUAL_LABEL);
    expect(html).not.toContain('wa.me');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Hubungi Penjual \(WhatsApp\)/);
    expect(html).toContain(`${WA_PENJUAL_TIDAK_VALID}.`);
  });
});
