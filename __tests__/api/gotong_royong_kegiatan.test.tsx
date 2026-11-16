// @vitest-environment node
// Gotong Royong = satu kategori tetap di Kegiatan Desa: halaman publik /lingkungan/gotong-royong hanya memuat
// kategori itu (per id, bukan nama), tanpa pil kategori; URL lama dialihkan; filter API `kategoriId`; seed.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const kegiatanGet = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const permanentRedirectMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({ kegiatanDesa: { findMany: vi.fn(), count: vi.fn() } }));
const nav = vi.hoisted(() => ({ pathname: '/lingkungan/gotong-royong/semua' }));

vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { kegiatandesa: { 'find-many': { get: kegiatanGet } } } } },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  permanentRedirect: permanentRedirectMock,
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import KegiatanShell from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/KegiatanShell';
import { KEGIATAN_DESA_SCOPE } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-scope';
import {
  GOTONG_ROYONG_LIST_PATH,
  gotongRoyongDetailHref,
  gotongRoyongListHref,
} from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.meta';
import {
  GOTONG_ROYONG_SCOPE,
  loadGotongRoyongPage,
} from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.scope';
import RootPage from '@/app/(public)/(pages)/lingkungan/gotong-royong/page';
import KategoriPage from '@/app/(public)/(pages)/lingkungan/gotong-royong/[kategori]/page';
import DetailPage from '@/app/(public)/(pages)/lingkungan/gotong-royong/[kategori]/[id]/page';
import getDetailUrl from '@/app/(public)/_com/searchUrl';
import kegiatanDesaFindMany from '@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/find-many';
import { KATEGORI_GOTONG_ROYONG_ID } from '@/lib/kegiatan-gotong-royong';
import { KATEGORI_PEMBANGUNAN_ID } from '@/lib/kegiatan-pembangunan';
import { loadJsonData } from '../../prisma/load-json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context handler Elysia
const ctx = (query: Record<string, string>) => ({ set: {}, params: {}, query }) as any;
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

beforeEach(() => vi.clearAllMocks());

describe('loadGotongRoyongPage', () => {
  it('selalu menyaring kategoriId tetap Gotong Royong, nama kategori dari URL diabaikan', async () => {
    kegiatanGet.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 0 } });
    await loadGotongRoyongPage({ page: 2, limit: 7, search: 'pura', kategori: 'budaya' });
    expect(kegiatanGet).toHaveBeenCalledWith({
      query: { page: 2, limit: 7, search: 'pura', kategoriId: KATEGORI_GOTONG_ROYONG_ID },
    });
  });

  it('kartu menaut ke detail Kegiatan Desa', async () => {
    // test-only: item find-many rekaan.
    const item = { id: 'g1', judul: 'Kerja Bakti Banjar', tanggal: '2026-01-10T00:00:00.000Z', kategoriKegiatan: { nama: 'Gotong Royong' } };
    kegiatanGet.mockResolvedValue({ status: 200, data: { success: true, data: [item], totalPages: 1 } });
    const { items } = await loadGotongRoyongPage({ page: 1, limit: 7, search: '', kategori: '' });
    expect(items[0].href).toBe('/pemerintahan/kegiatan-desa/gotong%20royong/g1');
  });
});

describe('cakupan & URL Gotong Royong', () => {
  it('tanpa pil kategori; URL daftar tetap /semua (href navbar), slug diabaikan', () => {
    expect(GOTONG_ROYONG_SCOPE.withKategori).toBe(false);
    expect(KEGIATAN_DESA_SCOPE.withKategori).toBe(true);
    expect(GOTONG_ROYONG_LIST_PATH).toBe('/lingkungan/gotong-royong/semua');
    expect(gotongRoyongListHref('budaya', { search: 'pura', page: 2 })).toBe(
      '/lingkungan/gotong-royong/semua?search=pura&page=2',
    );
    expect(gotongRoyongDetailHref('g1')).toBe('/pemerintahan/kegiatan-desa/gotong%20royong/g1');
  });

  it('kepala halaman memakai judul Gotong Royong tanpa pil kategori (SSR)', () => {
    const html = render(<KegiatanShell scope={GOTONG_ROYONG_SCOPE}>isi</KegiatanShell>);
    expect(html).toContain('Gotong Royong Desa Darmasaba');
    expect(html).not.toContain('<nav');
    expect(html).not.toContain('Kegiatan Desa Darmasaba');
  });

  it('kepala Kegiatan Desa tetap punya pil "Semua"', () => {
    nav.pathname = '/pemerintahan/kegiatan-desa/semua';
    const html = render(<KegiatanShell>isi</KegiatanShell>);
    expect(html).toContain('href="/pemerintahan/kegiatan-desa/semua"');
    expect(html).toContain('Kegiatan Desa Darmasaba');
    nav.pathname = '/lingkungan/gotong-royong/semua';
  });
});

describe('URL lama Gotong Royong dialihkan', () => {
  it('/lingkungan/gotong-royong → daftar /semua', () => {
    RootPage();
    expect(redirectMock).toHaveBeenCalledWith('/lingkungan/gotong-royong/semua');
  });

  it('tab kategori lama → daftar /semua (permanen)', () => {
    KategoriPage();
    expect(permanentRedirectMock).toHaveBeenCalledWith('/lingkungan/gotong-royong/semua');
  });

  it('detail lama /{kategori}/{id} → detail Kegiatan Desa id yang sama (permanen)', async () => {
    await DetailPage({ params: Promise.resolve({ kategori: 'lingkungan', id: 'g1' }) });
    expect(permanentRedirectMock).toHaveBeenCalledWith('/pemerintahan/kegiatan-desa/gotong%20royong/g1');
  });

  it('hasil pencarian tipe gotongRoyong menaut langsung ke detail Kegiatan Desa', () => {
    expect(getDetailUrl({ type: 'gotongRoyong', id: 'g1', kategori: 'Gotong Royong' })).toBe(
      '/pemerintahan/kegiatan-desa/gotong%20royong/g1',
    );
    // Item pencarian tanpa kategori → segmen kategori pengganti, tetap di bawah Kegiatan Desa.
    expect(getDetailUrl({ type: 'gotongRoyong', id: 'g1' })).toMatch(/^\/pemerintahan\/kegiatan-desa\/[^/]+\/g1$/);
  });
});

describe('GET find-many kegiatan desa — filter kategoriId', () => {
  beforeEach(() => {
    prismaMock.kegiatanDesa.findMany.mockResolvedValue([]);
    prismaMock.kegiatanDesa.count.mockResolvedValue(0);
  });

  it('kategoriId → where.kategoriKegiatanId persis (bukan pencocokan nama)', async () => {
    await kegiatanDesaFindMany(ctx({ kategoriId: KATEGORI_GOTONG_ROYONG_ID }));
    const { where } = prismaMock.kegiatanDesa.findMany.mock.calls[0][0];
    expect(where).toEqual({ isActive: true, kategoriKegiatanId: KATEGORI_GOTONG_ROYONG_ID });
    expect(prismaMock.kegiatanDesa.count).toHaveBeenCalledWith({ where });
  });

  it('kategoriId menang atas kategori (nama); tanpa kategoriId filter nama lama tetap', async () => {
    await kegiatanDesaFindMany(ctx({ kategoriId: KATEGORI_GOTONG_ROYONG_ID, kategori: 'budaya' }));
    expect(prismaMock.kegiatanDesa.findMany.mock.calls[0][0].where).not.toHaveProperty('kategoriKegiatan');

    await kegiatanDesaFindMany(ctx({ kategori: 'budaya' }));
    expect(prismaMock.kegiatanDesa.findMany.mock.calls[1][0].where).toEqual({
      isActive: true,
      kategoriKegiatan: { nama: { contains: 'budaya', mode: 'insensitive' } },
    });
  });
});

describe('seed kategori Gotong Royong', () => {
  type Row = { id: string; nama?: string; kategoriKegiatanId?: string };
  const kategori = loadJsonData<Row[]>('desa/kegiatan-desa/kategori-kegiatan.json');

  it('kategori tetap ada dengan nama "Gotong Royong" dan id berbeda dari Pembangunan', () => {
    expect(kategori.find((k) => k.id === KATEGORI_GOTONG_ROYONG_ID)?.nama).toBe('Gotong Royong');
    expect(KATEGORI_GOTONG_ROYONG_ID).not.toBe(KATEGORI_PEMBANGUNAN_ID);
  });

  it('semua kegiatan seed gotong royong memakai kategori tetap', () => {
    const rows = loadJsonData<Row[]>('lingkungan/gotong-royong/gotong-royong.json');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.kategoriKegiatanId === KATEGORI_GOTONG_ROYONG_ID)).toBe(true);
  });
});
