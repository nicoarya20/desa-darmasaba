// @vitest-environment node
// Harga disembunyikan admin (`harga` null): kartu, detail produk, daftar produk toko, dan panel saring tidak
// menampilkan harga/filter harga. jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { HargaPublikSwitch, HARGA_PUBLIK_LABEL } from '@/app/admin/(dashboard)/ekonomi/umkm/produk/_com/HargaPublikSwitch';
import { ProdukInfo } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukInfo';
import type { DetailProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.types';
import inf from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/info.module.css';
import { TokoProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/TokoProduk';
import { KatalogBody } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogBody';
import { produkFacets } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { KATALOG_FILTER_TEXT as F } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.text';
import { emptyParams } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-params.logic';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import { ProdukCard } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/ProdukCard';
import pc from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/produk-card.module.css';
import { SaringPanel } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/SaringPanel';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const noop = () => {};

// test-only: hasil source saat admin menyembunyikan harga.
const produk = (id: string, harga: number | null = null): KatalogProduk => ({
  id,
  nama: `Produk ${id}`,
  harga,
  satuan: 'ekor',
  stok: 2,
  isUnggulan: false,
  createdAt: `2026-11-0${id.length}T00:00:00.000Z`,
  imageUrl: null,
  umkm: { id: 'u1', nama: 'Warung Sari' },
  kategori: { id: 'k1', nama: 'Makanan' },
});

// test-only
const detail = (over: Partial<DetailProduk> = {}): DetailProduk => ({
  id: 'prd-1',
  nama: 'Keripik Pisang',
  harga: null,
  satuan: 'bungkus',
  isUnggulan: false,
  deskripsiHtml: '',
  fotos: [],
  kategori: { id: 'k1', nama: 'Makanan' },
  penjual: { id: 'u1', nama: 'Warung Bu Made', pemilik: null, alamat: null, kontak: '081234567890' },
  alamat: null,
  linkTokoOnline: [],
  stok: 7,
  ...over,
});

describe('harga disembunyikan di halaman publik', () => {
  it('ProdukCard: tanpa baris harga, nama & toko tetap tampil', () => {
    const html = render(<ProdukCard produk={produk('a')} />);
    expect(html).not.toContain(pc.price);
    expect(text(html)).not.toMatch(/Rp|\/ ekor/);
    expect(text(html)).toContain('Produk a Warung Sari');
  });

  it('ProdukCard: harga tampil bila tidak disembunyikan', () => {
    expect(text(render(<ProdukCard produk={produk('a', 80000)} />))).toContain('Rp80.000 / ekor');
  });

  it('ProdukInfo: tanpa baris harga, tombol WhatsApp penjual tetap ada', () => {
    const html = render(<ProdukInfo produk={detail()} onTercatat={noop} />);
    expect(html).not.toContain(inf.price);
    expect(text(html)).not.toMatch(/Rp/);
    expect(text(html)).toContain('Hubungi Penjual (WhatsApp)');
    expect(text(render(<ProdukInfo produk={detail({ harga: 15000 })} onTercatat={noop} />))).toContain('Rp15.000 / bungkus');
  });

  it('daftar produk toko: tanpa harga, Urutkan bawaan "Terbaru"', () => {
    const html = render(<TokoProduk produk={[produk('a'), produk('bb')]} />);
    expect(text(html)).not.toMatch(/Rp/);
    expect(html).toContain('value="Terbaru"');
  });

  it('panel saring: grup Harga tidak dirender', () => {
    const list = [produk('a'), produk('bb')];
    const html = render(<SaringPanel params={emptyParams('produk')} facets={produkFacets(list)} update={noop} />);
    const heads = [...html.matchAll(/aria-expanded="(?:true|false)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]));
    expect(heads).toEqual([F.group.kategori, F.group.toko, F.group.unggulan]);
    expect(html).not.toContain(F.hargaMin);
  });

  it('katalog: URL ber-urut harga → Urutkan kembali "Terbaru", kartu tanpa harga', () => {
    const data = { produk: [produk('a'), produk('bb')], toko: [] };
    const params = { ...emptyParams('produk'), urut: 'harga-asc' as const, min: 1000 };
    const html = render(<KatalogBody state={{ status: 'ready', data }} params={params} update={noop} onRetry={noop} />);
    expect(html).toContain('value="Terbaru"');
    expect(text(html)).not.toMatch(/Rp/);
    expect(text(html)).toContain('Menampilkan 2 produk');
  });
});

describe('HargaPublikSwitch (admin)', () => {
  it('menampilkan label saklar, nonaktif selama pengaturan belum dimuat', () => {
    const html = render(<HargaPublikSwitch />);
    expect(text(html)).toContain(HARGA_PUBLIK_LABEL);
    const input = html.match(/<input[^>]*role="switch"[^>]*>/)?.[0] ?? '';
    expect(input).toContain('disabled=""');
    expect(input).toContain('data-checked="false"');
  });
});
