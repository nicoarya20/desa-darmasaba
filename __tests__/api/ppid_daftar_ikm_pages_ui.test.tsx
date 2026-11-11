// @vitest-environment node
// Halaman publik PPID Daftar Informasi Publik (+ detail) dan Indeks Kepuasan Masyarakat:
// kepala halaman bersama, slot kanan, dan percabangan memuat/kosong/berisi.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (efek tidak berjalan).
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Item = { id: string; jenisInformasi: string; deskripsi: string; tanggal: string | null };

const mocks = vi.hoisted(() => ({
  store: {
    findMany: {
      data: null as Item[] | null,
      page: 1,
      totalPages: 1,
      loading: false,
      load: vi.fn(),
    },
    findUnique: { data: null as Item | null, load: vi.fn(async () => undefined) },
  },
  params: { id: 'a1' } as { id?: string },
  kepuasan: { data: null as unknown[] | null, total: 0, summary: {} },
}));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('next/navigation', () => ({ useParams: () => mocks.params }));
vi.mock('valtio/utils', () => ({ useProxy: <T,>(value: T) => value }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik', () => ({
  default: mocks.store,
}));
vi.mock('@/app/darmasaba/_com/main-page/kepuasan/use-kepuasan-data', () => ({
  useKepuasanData: () => mocks.kepuasan,
}));
// Grafik & form punya test sendiri (kepuasan_ui); di sini cukup penanda bahwa halaman memakainya.
vi.mock('@/app/darmasaba/_com/main-page/kepuasan/components/KepuasanCharts', () => ({
  KepuasanCharts: ({ total }: { total: number }) => <div data-testid="charts" data-total={total} />,
}));
vi.mock('@/app/darmasaba/_com/main-page/kepuasan/components/RespondenFormModal', () => ({
  RespondenFormModal: ({ opened }: { opened: boolean }) => <div data-testid="modal" data-opened={String(opened)} />,
}));

import DaftarPage from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/page';
import DetailPage from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/[id]/page';
import { DAFTAR_TEXT } from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/_com/daftar.text';
import IkmPage from '@/app/darmasaba/(pages)/ppid/indeks-kepuasan-masyarakat/page';
import { IKM_TEXT } from '@/app/darmasaba/(pages)/ppid/indeks-kepuasan-masyarakat/_com/ikm.text';
import { KEPUASAN_TEXT } from '@/app/darmasaba/_com/main-page/kepuasan/kepuasan.text';
import { DOKUMEN_PERENCANAAN_PUBLIC_HREF } from '@/lib/dokumen-perencanaan';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: informasi fiktif.
const ITEMS: Item[] = [
  { id: 'a1', jenisInformasi: 'Akses Internet Desa', deskripsi: '<p>Jaringan <strong>desa</strong></p>', tanggal: '2025-02-21T00:00:00.000Z' },
  { id: 'b2', jenisInformasi: 'Informasi Publik Desa', deskripsi: '<p>Aplikasi</p>', tanggal: null },
];

beforeEach(() => {
  mocks.store.findMany.data = null;
  mocks.store.findMany.page = 1;
  mocks.store.findMany.totalPages = 1;
  mocks.store.findMany.loading = false;
  mocks.store.findUnique.data = null;
  mocks.params = { id: 'a1' };
  mocks.kepuasan = { data: null, total: 0, summary: {} };
});

describe('halaman Daftar Informasi Publik', () => {
  it('kepala halaman: satu h1, lead, kotak cari, tautan Dokumen Perencanaan, tanpa tombol kembali ganda', () => {
    const html = render(<DaftarPage />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(DAFTAR_TEXT.title);
    expect(html).toContain(DAFTAR_TEXT.lead);
    expect(html).toContain(`aria-label="${DAFTAR_TEXT.searchLabel}"`);
    expect(html).toContain(`href="${DOKUMEN_PERENCANAAN_PUBLIC_HREF}"`);
    expect(count(html, 'aria-label="Kembali ke halaman sebelumnya"')).toBe(1);
  });

  it('sebelum data ada: skeleton, kotak cari tetap terpasang, tanpa tabel', () => {
    const html = render(<DaftarPage />);
    expect(html).toContain(`aria-label="${DAFTAR_TEXT.loading}"`);
    expect(html).toContain('type="search"');
    expect(html).not.toContain('<table');
  });

  it('data kosong: pesan kosong, tanpa tabel & paginasi', () => {
    mocks.store.findMany.data = [];
    const html = render(<DaftarPage />);
    expect(html).toContain(DAFTAR_TEXT.empty);
    expect(html).not.toContain('<table');
    expect(html).not.toContain(`aria-label="${DAFTAR_TEXT.paginationLabel}"`);
  });

  it('data berisi: tabel dengan semua baris; paginasi hanya bila lebih dari satu halaman', () => {
    mocks.store.findMany.data = ITEMS;
    const single = render(<DaftarPage />);
    expect(single).toContain('Akses Internet Desa');
    expect(single).toContain('Informasi Publik Desa');
    expect(single).not.toContain(`aria-label="${DAFTAR_TEXT.paginationLabel}"`);

    mocks.store.findMany.totalPages = 3;
    const many = render(<DaftarPage />);
    expect(many).toContain(`aria-label="${DAFTAR_TEXT.paginationLabel}"`);
  });

  it('memuat ulang saat data sudah ada: tabel tetap tampil dan ditandai sibuk', () => {
    mocks.store.findMany.data = ITEMS;
    mocks.store.findMany.loading = true;
    const html = render(<DaftarPage />);
    expect(html).toContain('<table');
    expect(html).toContain('aria-busy="true"');
  });

  it('kontak PPID tetap tampil apa adanya', () => {
    const html = render(<DaftarPage />);
    expect(html).toContain(DAFTAR_TEXT.kontakTitle);
  });
});

describe('halaman detail Informasi Publik', () => {
  it('menampilkan jenis, tanggal, dan deskripsi milik id halaman', () => {
    mocks.store.findUnique.data = ITEMS[0];
    const html = render(<DetailPage />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(DAFTAR_TEXT.detailTitle);
    expect(html).toContain('Akses Internet Desa');
    expect(html).toContain('21 Februari 2025');
    expect(html).toContain('<p>Jaringan <strong>desa</strong></p>');
  });

  it('mengabaikan detail basi dari id lain dan menampilkan skeleton', () => {
    mocks.store.findUnique.data = ITEMS[1];
    const html = render(<DetailPage />);
    expect(html).not.toContain('Informasi Publik Desa');
    expect(html).toContain(`aria-label="${DAFTAR_TEXT.detailLoading}"`);
    expect(html).not.toContain(DAFTAR_TEXT.notFound);
  });
});

describe('halaman PPID Indeks Kepuasan Masyarakat', () => {
  it('kepala halaman: judul, lead, dan tombol Ajukan Responden di slot kanan', () => {
    const html = render(<IkmPage />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(KEPUASAN_TEXT.title);
    expect(html).toContain(IKM_TEXT.lead);
    expect(html).toContain(KEPUASAN_TEXT.cta);
    expect(html).toContain('data-opened="false"');
  });

  it('data null → skeleton, bukan grafik', () => {
    const html = render(<IkmPage />);
    expect(html).not.toContain('data-testid="charts"');
    expect(html).not.toContain(KEPUASAN_TEXT.emptyTitle);
  });

  it('data kosong → keadaan kosong', () => {
    mocks.kepuasan = { data: [], total: 0, summary: {} };
    const html = render(<IkmPage />);
    expect(html).toContain(KEPUASAN_TEXT.emptyTitle);
    expect(html).not.toContain('data-testid="charts"');
  });

  it('data berisi → grafik beranda dengan total responden', () => {
    mocks.kepuasan = { data: [{}, {}, {}, {}], total: 4, summary: {} };
    const html = render(<IkmPage />);
    expect(html).toContain('data-testid="charts"');
    expect(html).toContain('data-total="4"');
  });
});
