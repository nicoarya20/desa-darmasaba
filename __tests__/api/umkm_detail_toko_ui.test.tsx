// @vitest-environment node
// Halaman detail toko UMKM publik: kepala toko, status, rakitan + halaman tipis, dan tombol WhatsApp toko.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { DetailToko, DetailTokoState } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/detail-toko.types';

const h = vi.hoisted(() => ({ state: { status: 'loading' } as DetailTokoState, ids: [] as string[] }));

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'umkm-3' }) }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/use-detail-toko', () => ({
  useDetailToko: (id: string) => {
    h.ids.push(id);
    return { state: h.state, reload: () => undefined };
  },
}));

import DetailTokoPage from '@/app/(public)/(pages)/ekonomi/umkm/[id]/page';
import { DetailTokoStatus } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/DetailTokoStatus';
import { TokoHeader } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/TokoHeader';
import { DETAIL_TOKO_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/detail-toko.text';
import hs from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/toko-header.module.css';
import { HUBUNGI_PENJUAL_LABEL } from '@/app/(public)/(pages)/ekonomi/umkm/_com/HubungiPenjualButton';
import { buildHubungiPenjualMessage, WA_PENJUAL_TIDAK_VALID } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// test-only: bentuk hasil adapter.
const produk = (id: string, nama: string, harga: number) => ({
  id,
  nama,
  harga,
  satuan: 'ikat',
  stok: 0,
  isUnggulan: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  imageUrl: null,
  umkm: { id: 'umkm-3', nama: 'Sayur Segar Pak Wayan' },
  kategori: null,
});
const toko = (over: Partial<DetailToko> = {}): DetailToko => ({
  id: 'umkm-3',
  nama: 'Sayur Segar Pak Wayan',
  pemilik: 'Wayan Sudarma',
  alamat: 'Br. Tengah, Darmasaba',
  kontak: '0812-3456-7890',
  deskripsiHtml: '<p>Sayur <strong>segar</strong> tiap pagi</p>',
  fotoUrl: null,
  kategori: { id: 'k1', nama: 'Pertanian' },
  produk: [produk('a', 'Bayam', 5000), produk('b', 'Kangkung', 4000)],
  ...over,
});

const waHref = (html: string) => {
  const m = html.match(/href="(https:\/\/wa\.me\/[^"]+)"/);
  return m ? new URL(m[1].replace(/&amp;/g, '&')) : null;
};

describe('TokoHeader', () => {
  it('kategori, h1 nama, meta pemilik · alamat · jumlah produk, deskripsi HTML bersih', () => {
    const html = render(<TokoHeader toko={toko()} />);
    expect(html).toContain(`<p class="${hs.kategori}">Pertanian</p>`);
    expect(html).toMatch(/<h1[^>]*>Sayur Segar Pak Wayan<\/h1>/);
    expect(text(html)).toContain('Pemilik: Wayan Sudarma');
    expect(text(html)).toContain('Alamat: Br. Tengah, Darmasaba');
    expect(text(html)).toContain('2 produk');
    expect(html).toContain('<p>Sayur <strong>segar</strong> tiap pagi</p>');
  });

  it('tanpa foto → inisial; dengan foto → <img> ber-alt nama toko', () => {
    const tanpa = render(<TokoHeader toko={toko()} />);
    expect(tanpa).toMatch(/aria-hidden="true">SS<\/span>/);
    expect(tanpa).not.toContain('<img');
    const dengan = render(<TokoHeader toko={toko({ fotoUrl: '/api/img/toko.webp' })} />);
    const img = dengan.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toContain('src="/api/img/toko.webp"');
    expect(img).toContain('alt="Sayur Segar Pak Wayan"');
    expect(dengan).not.toContain(hs.inisial);
  });

  it('kolom kosong disembunyikan: tanpa kategori, pemilik, alamat, deskripsi, dan produk', () => {
    const html = render(
      <TokoHeader toko={toko({ kategori: null, pemilik: null, alamat: null, deskripsiHtml: '', produk: [] })} />,
    );
    expect(html).not.toContain(hs.kategori);
    expect(html).not.toContain(hs.metaItem);
    expect(html).not.toContain(hs.deskripsi);
    expect(text(html)).not.toContain('produk');
  });

  it('tombol WhatsApp memakai pesan umum toko (bukan pesan produk)', () => {
    const url = waHref(render(<TokoHeader toko={toko()} />));
    expect(url?.pathname).toBe('/6281234567890');
    expect(url?.searchParams.get('text')).toBe(buildHubungiPenjualMessage({ umkmNama: 'Sayur Segar Pak Wayan' }));
    expect(url?.searchParams.get('text')).not.toContain('tertarik dengan produk');
  });

  it('nomor tidak valid → tombol disabled + penjelasan', () => {
    const html = render(<TokoHeader toko={toko({ kontak: null })} />);
    expect(html).not.toContain('wa.me');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Hubungi Penjual \(WhatsApp\)/);
    expect(html).toContain(`${WA_PENJUAL_TIDAK_VALID}.`);
  });

  it('stok tidak pernah tampil', () => {
    expect(render(<TokoHeader toko={toko()} />).toLowerCase()).not.toContain('stok');
  });
});

describe('DetailTokoStatus', () => {
  const status = (s: 'loading' | 'notFound' | 'error') => render(<DetailTokoStatus status={s} onRetry={() => undefined} />);

  it('loading → kerangka kepala berlabel + 4 kerangka kartu produk', () => {
    const html = status('loading');
    expect(html).toContain(`aria-label="${T.memuat}"`);
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(5);
    expect(html).toContain('data-variant="produk"');
  });

  it('notFound → judul + deskripsi tanpa tombol; error → alert + Coba lagi', () => {
    const nf = status('notFound');
    expect(nf).toContain(T.notFoundTitle);
    expect(nf).toContain(T.notFoundDesc);
    expect(nf).not.toContain('<button');
    const err = status('error');
    expect(err).toContain('role="alert"');
    expect(err).toContain(T.errorTitle);
    expect(err).toMatch(/<button[^>]*>Coba lagi<\/button>/);
  });
});

describe('DetailTokoView via halaman [id]', () => {
  it('halaman tipis meneruskan id dari URL; tautan kembali ke tab Toko', () => {
    h.ids = [];
    h.state = { status: 'loading' };
    const html = render(<DetailTokoPage />);
    expect(h.ids).toEqual(['umkm-3']);
    expect(html).toMatch(/<a href="\/ekonomi\/umkm\?tab=toko"[^>]*>[\s\S]*?Katalog UMKM<\/a>/);
    expect(html).toContain('aria-busy="true"');
  });

  it('notFound (toko nonaktif / terhapus) → panel Toko tidak ditemukan, tanpa kepala toko', () => {
    h.state = { status: 'notFound' };
    const html = render(<DetailTokoPage />);
    expect(html).toContain(T.notFoundTitle);
    expect(html).not.toContain('<h1');
  });

  it('siap → kepala toko + daftar produk toko berkartu tautan detail produk', () => {
    h.state = { status: 'ready', data: toko() };
    const html = render(<DetailTokoPage />);
    expect(html).toMatch(/<h1[^>]*>Sayur Segar Pak Wayan<\/h1>/);
    expect(html).toContain(HUBUNGI_PENJUAL_LABEL);
    expect(html).toContain('href="/ekonomi/umkm/produk/a"');
    expect(html).toContain('href="/ekonomi/umkm/produk/b"');
    expect(html).not.toContain('Cara memesan');
    expect(html).not.toContain('aria-busy');
  });
});
