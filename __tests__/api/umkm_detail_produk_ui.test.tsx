// @vitest-environment node
// Halaman detail produk UMKM publik (gaya Decathlon): galeri, kolom info + panel, deskripsi, status, dan rakitan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  DetailProduk,
  DetailProdukState,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.types';

const h = vi.hoisted(() => ({
  state: { status: 'loading' } as DetailProdukState,
  serupa: [] as unknown[],
}));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/use-detail-produk', () => ({
  useDetailProduk: () => ({ state: h.state, reload: () => undefined }),
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukSerupa', () => ({
  ProdukSerupa: (props: unknown) => {
    h.serupa.push(props);
    return <section data-testid="produk-serupa" />;
  },
}));

import { DetailProdukStatus } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/DetailProdukStatus';
import { DetailProdukView } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/DetailProdukView';
import { ProdukDeskripsi } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukDeskripsi';
import { ProdukGaleri } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukGaleri';
import { ProdukInfo } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukInfo';
import { DETAIL_PRODUK_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.text';
import g from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/galeri.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: bentuk hasil adapter.
const produk = (over: Partial<DetailProduk> = {}): DetailProduk => ({
  id: 'prd-1',
  nama: 'Keripik Pisang',
  harga: 15000,
  satuan: 'bungkus',
  isUnggulan: false,
  deskripsiHtml: '<p>Renyah dan gurih</p>',
  fotos: [{ src: '/api/img/a.webp', alt: 'Keripik Pisang' }],
  kategori: { id: 'k1', nama: 'Makanan' },
  penjual: { id: 'u1', nama: 'Warung Bu Made', pemilik: 'Made Sari', alamat: 'Br. Gede', kontak: '081234567890' },
  alamat: 'Br. Gede, Darmasaba',
  linkTokoOnline: [],
  stok: 7,
  ...over,
});

const tigaFoto = [1, 2, 3].map((n) => ({ src: `/api/img/${n}.webp`, alt: 'Keripik' }));

describe('ProdukGaleri', () => {
  it('3 foto: foto utama = foto pertama + strip 3 thumbnail berlabel, yang aktif aria-current', () => {
    const html = render(<ProdukGaleri fotos={tigaFoto} />);
    expect(html).toContain(g.strip);
    expect(count(html, `class="${g.thumb}"`)).toBe(3);
    expect(html).toContain('aria-label="Foto 1 dari 3"');
    expect(html).toContain('aria-label="Foto 3 dari 3"');
    expect(count(html, 'aria-current="true"')).toBe(1);
    expect(html).toMatch(/aria-label="Foto 1 dari 3" aria-current="true"/);
    const main = html.slice(html.indexOf(g.main), html.indexOf(g.stripFrame));
    expect(main).toContain('src="/api/img/1.webp"');
  });

  it('1 foto: hanya foto utama, strip tidak dirender', () => {
    const html = render(<ProdukGaleri fotos={[tigaFoto[0]]} />);
    expect(html).toContain('src="/api/img/1.webp"');
    expect(html).not.toContain(g.strip);
    expect(html).not.toContain('dari 1');
  });

  it('tanpa foto: ikon pengganti, tanpa <img>', () => {
    const html = render(<ProdukGaleri fotos={[]} />);
    expect(html).toContain(g.fallback);
    expect(html).not.toContain('<img');
  });
});

describe('ProdukInfo', () => {
  const info = (over: Partial<DetailProduk> = {}) => render(<ProdukInfo produk={produk(over)} onTercatat={() => undefined} />);

  it('merek (tautan toko) · kategori, h1 nama, rating ke #ulasan, harga + satuan', () => {
    const html = info();
    expect(html).toMatch(/<a href="\/ekonomi\/umkm\/u1"[^>]*>Warung Bu Made<\/a>/);
    expect(text(html)).toContain('Warung Bu Made · Makanan');
    expect(html).toMatch(/<h1[^>]*>Keripik Pisang<\/h1>/);
    expect(html).toMatch(/<a href="#ulasan"[^>]*>[\s\S]*?Belum ada ulasan/);
    expect(text(html)).toContain('Rp15.000 / bungkus');
  });

  it('label Unggulan hanya bila isUnggulan', () => {
    expect(text(info())).not.toContain(T.unggulan);
    expect(text(info({ isUnggulan: true }))).toContain(T.unggulan);
  });

  it('stok tidak pernah tampil', () => {
    const html = info({ stok: 0 });
    expect(html.toLowerCase()).not.toContain('stok');
    expect(html).not.toContain('Pesan Sekarang');
  });

  it('panel Cara memesan: 3 langkah bernomor + catatan', () => {
    const html = info();
    expect(html).toContain(T.caraMemesan);
    expect(html).toMatch(/<ol[^>]*>(?:\s*<li[^>]*>[^<]+<\/li>){3}\s*<\/ol>/);
    T.langkahPesan.forEach((langkah) => expect(html).toContain(langkah));
    expect(html).toContain(T.catatanPesan);
  });

  it('panel Penjual: inisial, nama, pemilik, alamat, tautan katalog per toko', () => {
    const html = info();
    expect(html).toMatch(/aria-hidden="true">WB<\/span>/);
    expect(text(html)).toContain('Pemilik: Made Sari');
    expect(html).toContain('Br. Gede, Darmasaba');
    expect(html).toMatch(/<a href="\/ekonomi\/umkm\?toko=u1"[^>]*>Lihat semua produk toko ini<\/a>/);
  });

  it('tanpa penjual: tanpa panel Penjual & merek; tombol WA disabled; tanpa alamat bila null', () => {
    const html = info({ penjual: null, kategori: null });
    expect(html).not.toContain(T.lihatProdukToko);
    expect(html).not.toContain('·');
    expect(html).toMatch(/<button[^>]*disabled=""/);
    expect(info({ alamat: null })).not.toContain('Br. Gede, Darmasaba');
  });
});

describe('ProdukDeskripsi', () => {
  it('merender HTML bersih; kosong → teks pengganti', () => {
    expect(render(<ProdukDeskripsi html="<p>Renyah</p>" />)).toContain('<p>Renyah</p>');
    const kosong = render(<ProdukDeskripsi html="" />);
    expect(kosong).toContain(T.deskripsi);
    expect(kosong).toContain(T.deskripsiKosong);
  });
});

describe('DetailProdukStatus', () => {
  it('loading → kerangka berlabel; notFound tanpa tombol; error dengan Coba lagi', () => {
    expect(render(<DetailProdukStatus status="loading" onRetry={() => undefined} />)).toContain(`aria-label="${T.memuat}"`);
    const nf = render(<DetailProdukStatus status="notFound" onRetry={() => undefined} />);
    expect(nf).toContain(T.notFoundTitle);
    expect(nf).not.toContain('<button');
    const err = render(<DetailProdukStatus status="error" onRetry={() => undefined} />);
    expect(err).toContain(T.errorTitle);
    expect(err).toMatch(/<button[^>]*>Coba lagi<\/button>/);
  });
});

describe('DetailProdukView', () => {
  beforeEach(() => {
    h.serupa = [];
  });

  it('siap: kembali → galeri → info → deskripsi → Ulasan → Produk serupa (dengan acuan kategori & toko)', () => {
    h.state = { status: 'ready', data: produk() };
    const html = render(<DetailProdukView id="prd-1" />);
    const order = ['href="/ekonomi/umkm"', g.galeri, '<h1', T.deskripsi, 'id="ulasan"', 'data-testid="produk-serupa"'];
    const pos = order.map((needle) => html.indexOf(needle));
    pos.forEach((p) => expect(p).toBeGreaterThan(-1));
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    expect(h.serupa).toEqual([{ current: { id: 'prd-1', kategoriNama: 'Makanan', umkmId: 'u1' } }]);
  });

  it.each(['loading', 'notFound', 'error'] as const)('%s: hanya tautan kembali + status, tanpa Ulasan', (status) => {
    h.state = { status };
    const html = render(<DetailProdukView id="prd-1" />);
    expect(html).toContain(T.backToList);
    expect(html).not.toContain('id="ulasan"');
    expect(h.serupa).toEqual([]);
  });
});
