// @vitest-environment node
// Halaman daftar Layanan: kartu surat keterangan gaya galeri beranda, bagian Telunjuk Sakti & Non-Permanen.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; efek (fetch) tidak jalan di server,
// jadi data diisi langsung ke state valtio sebelum render.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import Page from '@/app/darmasaba/(pages)/pemerintahan/layanan/page';
import { SuratKeteranganCard } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/SuratKeteranganCard';
import PelayananPendudukNonPermanent from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/pelayananPendudukNonPermanent';
import PelayananSuratKeterangan from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/pelayananSuratKeterangan';
import PelayananTelunjukSaktiDesa from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/pelayananTelunjukSaktiDesa';
import { LAYANAN_TEXT } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/layanan.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: layanan berbentuk respons find-many.
const surat = (id: string, name: string, extra: object = {}) => ({
  id,
  name,
  image: { link: `https://example.test/${id}.jpg` },
  estimasiWaktu: null,
  biaya: null,
  ...extra,
});

const st = stateLayananDesa;

beforeEach(() => {
  st.suratKeterangan.findMany.data = null;
  st.suratKeterangan.findMany.loading = false;
  st.pelayananTelunjukSaktiDesa.findMany.data = null;
  st.pelayananTelunjukSaktiDesa.findMany.loading = false;
  st.pelayananPendudukNonPermanen.findById.data = null;
});

describe('SuratKeteranganCard', () => {
  it('seluruh kartu satu tautan ke detail: foto, nama h3, pil "Lihat layanan"', () => {
    const html = render(<SuratKeteranganCard item={surat('s1', 'Surat Keterangan Usaha')} />);
    expect(count(html, '<a ')).toBe(1);
    expect(html).toContain('href="/darmasaba/pemerintahan/layanan/s1"');
    expect(html).toContain('src="https://example.test/s1.jpg"');
    expect(html).toMatch(/<h3[^>]*>Surat Keterangan Usaha<\/h3>/);
    expect(html).toContain(LAYANAN_TEXT.surat.cta);
  });

  it('badge waktu & biaya hanya bila diisi admin', () => {
    expect(render(<SuratKeteranganCard item={surat('s1', 'A')} />)).not.toContain('Gratis');
    const html = render(<SuratKeteranganCard item={surat('s2', 'B', { estimasiWaktu: '1 hari kerja', biaya: 0 })} />);
    expect(html).toContain('1 hari kerja • Gratis');
  });
});

describe('PelayananSuratKeterangan', () => {
  it('belum dimuat → kerangka (aria-busy), bukan pesan kosong', () => {
    const html = render(<PelayananSuratKeterangan />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain(LAYANAN_TEXT.surat.empty);
  });

  it('semua layanan tampil tanpa paginasi (dulu item ke-10 hilang)', () => {
    st.suratKeterangan.findMany.data = Array.from({ length: 11 }, (_, i) => surat(`s${i}`, `Surat ${i}`));
    const html = render(<PelayananSuratKeterangan />);
    expect(count(html, 'href="/darmasaba/pemerintahan/layanan/s')).toBe(11);
    expect(html).toContain('Surat 9');
    expect(html).not.toContain('mantine-Pagination');
    expect(html).toContain('role="search"');
  });

  it('data kosong → pesan kosong', () => {
    st.suratKeterangan.findMany.data = [];
    expect(render(<PelayananSuratKeterangan />)).toContain(LAYANAN_TEXT.surat.empty);
  });
});

describe('PelayananTelunjukSaktiDesa', () => {
  it('baris = tautan tab baru; tautan tanpa skema diberi https://', () => {
    st.pelayananTelunjukSaktiDesa.findMany.data = [
      { id: 't1', name: 'Akta Kematian', deskripsi: 'Petunjuk Akta Kematian', link: 'www.test.com', estimasiWaktu: null, biaya: null },
    ];
    const html = render(<PelayananTelunjukSaktiDesa />);
    expect(html).toContain('href="https://www.test.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('Petunjuk Akta Kematian');
  });
});

describe('PelayananPendudukNonPermanent', () => {
  it('judul h2 dari data + isi; tanpa tanggal palsu & tombol bagikan', () => {
    st.pelayananPendudukNonPermanen.findById.data = {
      id: 'edit',
      name: 'Pelayanan Penduduk Non-Permanent',
      deskripsi: '<p>Isi layanan</p>',
      estimasiWaktu: null,
      biaya: null,
    } as never;
    const html = render(<PelayananPendudukNonPermanent />);
    expect(html).toMatch(/<h2[^>]*>Pelayanan Penduduk Non-Permanent<\/h2>/);
    expect(html).toContain('<p>Isi layanan</p>');
    expect(html).not.toContain('25 Mei 2021');
    expect(html).not.toContain('Bagikan');
  });
});

describe('Page', () => {
  it('satu h1 (judul halaman), 4 bagian h2', () => {
    const html = render(<Page />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Layanan Desa Darmasaba<\/h1>/);
    expect(count(html, '<h2')).toBe(4);
  });
});
