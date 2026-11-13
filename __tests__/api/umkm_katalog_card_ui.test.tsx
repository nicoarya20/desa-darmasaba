// @vitest-environment node
// Kartu produk & toko katalog UMKM (gaya Decathlon), grid + kerangka memuat, panel kosong.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { KatalogEmpty } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogEmpty';
import { KatalogGrid } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogGrid';
import { ProdukCard } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/ProdukCard';
import { TokoCard } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/TokoCard';
import { KATALOG_CARD_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-card.text';
import type { KatalogProduk, KatalogToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import g from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-grid.module.css';
import m from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-media.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: bentuk hasil adapter Sesi A.
const produk = (over: Partial<KatalogProduk> = {}): KatalogProduk => ({
  id: 'p1',
  nama: 'Ayam Kampung Organik',
  harga: 80000,
  satuan: 'ekor',
  stok: 4,
  isUnggulan: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  imageUrl: '/api/img/p1.webp',
  umkm: { id: 'u1', nama: 'Peternakan Sari' },
  kategori: { id: 'k1', nama: 'Peternakan' },
  ...over,
});

// test-only
const toko = (over: Partial<KatalogToko> = {}): KatalogToko => ({
  id: 'u1',
  nama: 'Peternakan Sari',
  pemilik: 'Made Sari',
  alamat: 'Br. Tengah',
  imageUrl: '/api/img/u1.webp',
  kategori: { id: 'ku1', nama: 'Peternakan' },
  createdAt: '2026-10-01T00:00:00.000Z',
  ...over,
});

describe('ProdukCard', () => {
  it('seluruh kartu satu tautan ke detail produk berisi harga, nama, toko, dan rating kosong', () => {
    const html = render(<ProdukCard produk={produk()} />);
    expect(count(html, '<a ')).toBe(1);
    expect(html).toContain('href="/ekonomi/umkm/produk/p1"');
    expect(html).toMatch(/<h3 [^>]*>Ayam Kampung Organik<\/h3>/);
    expect(html).not.toContain('<h2');
    expect(text(html)).toBe(`Rp80.000 / ekor Ayam Kampung Organik Peternakan Sari ${T.ratingKosong}`);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Ayam Kampung Organik"');
    expect(html).not.toContain('/no-image.jpg');
  });

  it('rating selalu kosong walau data membawa nilai rating (seed palsu tidak dibaca)', () => {
    const withRating = { ...produk(), rating: 4.8 } as KatalogProduk;
    const out = text(render(<ProdukCard produk={withRating} />));
    expect(out).toContain(T.ratingKosong);
    expect(out).not.toContain('4.8');
    expect(out).not.toContain('4,8');
  });

  it('tanpa label bila tersedia dan bukan unggulan', () => {
    const html = render(<ProdukCard produk={produk()} />);
    expect(html).not.toContain('data-variant=');
    expect(html).not.toContain('data-dimmed');
  });

  it('unggulan → label "Unggulan"', () => {
    const html = render(<ProdukCard produk={produk({ isUnggulan: true })} />);
    expect(html).toContain('data-variant="unggulan"');
    expect(text(html)).toContain(T.unggulan);
  });

  it('stok habis → label "Habis" saja (mengalahkan unggulan) dan foto diredupkan', () => {
    const html = render(<ProdukCard produk={produk({ stok: 0, isUnggulan: true })} />);
    expect(html).toContain('data-variant="habis"');
    expect(html).not.toContain('data-variant="unggulan"');
    expect(html).toContain('data-dimmed="true"');
    expect(count(text(html), T.habis)).toBe(1);
  });

  it('tanpa foto → ikon pengganti, tanpa <img>; tanpa satuan & toko → baris itu tidak muncul', () => {
    const html = render(<ProdukCard produk={produk({ imageUrl: null, satuan: null, umkm: null })} />);
    expect(html).not.toContain('<img');
    expect(html).toContain(m.fallback);
    expect(text(html)).toBe(`Rp80.000 Ayam Kampung Organik ${T.ratingKosong}`);
  });
});

describe('TokoCard', () => {
  it('seluruh kartu satu tautan ke detail UMKM berisi kategori, nama, pemilik, alamat, jumlah produk', () => {
    const html = render(<TokoCard toko={toko()} jumlahProduk={3} />);
    expect(count(html, '<a ')).toBe(1);
    expect(html).toContain('href="/ekonomi/umkm/u1"');
    expect(html).toMatch(/<h3 [^>]*>Peternakan Sari<\/h3>/);
    expect(text(html)).toBe(`Peternakan Peternakan Sari Made Sari Br. Tengah ${T.jumlahProduk(3)}`);
  });

  it('tanpa jumlahProduk → baris jumlah tidak muncul; jumlah 0 tetap ditulis', () => {
    expect(text(render(<TokoCard toko={toko()} />))).not.toContain('produk');
    expect(text(render(<TokoCard toko={toko()} jumlahProduk={0} />))).toContain(T.jumlahProduk(0));
  });

  it('alamat kosong → nama desa; tanpa foto & kategori → ikon pengganti tanpa baris kategori', () => {
    const html = render(<TokoCard toko={toko({ alamat: null, imageUrl: null, kategori: null })} />);
    expect(text(html)).toBe(`Peternakan Sari Made Sari ${T.alamatKosong}`);
    expect(html).not.toContain('<img');
    expect(html).toContain(m.fallback);
  });
});

describe('KatalogGrid', () => {
  it('memuat → kerangka sejumlah skeletonCount dengan aria-busy, bukan kartu', () => {
    const html = render(
      <KatalogGrid variant="produk" loading skeletonCount={4}>
        <ProdukCard produk={produk()} />
      </KatalogGrid>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(count(html, `class="${g.skeleton}"`)).toBe(4);
    expect(count(html, `class="${g.skeletonLine}"`)).toBe(12);
    expect(html).not.toContain('<a ');
  });

  it('kerangka bawaan 8 kartu; varian toko punya 4 baris teks per kartu', () => {
    const html = render(<KatalogGrid variant="toko" loading />);
    expect(count(html, `class="${g.skeleton}"`)).toBe(8);
    expect(count(html, `class="${g.skeletonLine}"`)).toBe(32);
  });

  it('ada kartu → daftar <ul> dengan satu <li> per kartu', () => {
    const html = render(
      <KatalogGrid variant="produk" empty={<p>kosong</p>}>
        {[produk({ id: 'a' }), produk({ id: 'b' })].map((p) => (
          <ProdukCard key={p.id} produk={p} />
        ))}
      </KatalogGrid>,
    );
    expect(html.startsWith('<ul')).toBe(true);
    expect(count(html, '<li ')).toBe(2);
    expect(html).not.toContain('kosong');
    expect(html).not.toContain('aria-busy');
  });

  it('tanpa kartu (termasuk anak null/false) → slot kosong', () => {
    const empty = <KatalogEmpty title="Belum ada produk UMKM" />;
    expect(text(render(<KatalogGrid variant="produk" empty={empty} />))).toBe('Belum ada produk UMKM');
    const html = render(
      <KatalogGrid variant="produk" empty={empty}>
        {[null, false]}
      </KatalogGrid>,
    );
    expect(html).not.toContain('<ul');
    expect(text(html)).toBe('Belum ada produk UMKM');
  });
});

describe('KatalogEmpty', () => {
  it('judul + deskripsi + pil aksi bila label dan handler ada', () => {
    const html = render(
      <KatalogEmpty
        title="Tidak ada produk yang cocok"
        description="Coba ubah saringan."
        actionLabel="Hapus semua saringan"
        onAction={() => undefined}
      />,
    );
    expect(html).toContain(g.empty);
    expect(html).toContain('<button type="button"');
    expect(text(html)).toBe('Tidak ada produk yang cocok Coba ubah saringan. Hapus semua saringan');
  });

  it('tanpa handler → tanpa tombol walau label ada', () => {
    const html = render(<KatalogEmpty title="Kosong" actionLabel="Hapus semua saringan" />);
    expect(html).not.toContain('<button');
  });
});
