// @vitest-environment node
// Gotong Royong = satu kategori tetap di Kegiatan Desa: filter API `kategoriId`, seed kategori, kepala Kegiatan Desa
// tetap ber-pil, dan pencarian tipe gotongRoyong (berisi semua kegiatan) menaut ke detail Kegiatan Desa.
// Halaman publik Gotong Royong (daftar/detail/URL) diuji di lingkungan_gotong_royong_{logic,ui}.test.*.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const kegiatanGet = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({ kegiatanDesa: { findMany: vi.fn(), count: vi.fn() } }));
const nav = vi.hoisted(() => ({ pathname: '/pemerintahan/kegiatan-desa/semua' }));

vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { kegiatandesa: { 'find-many': { get: kegiatanGet } } } } },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import KegiatanShell from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/KegiatanShell';
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

describe('Kegiatan Desa & pencarian', () => {
  it('kepala Kegiatan Desa tetap punya pil "Semua"', () => {
    nav.pathname = '/pemerintahan/kegiatan-desa/semua';
    const html = render(<KegiatanShell>isi</KegiatanShell>);
    expect(html).toContain('href="/pemerintahan/kegiatan-desa/semua"');
    expect(html).toContain('Kegiatan Desa Darmasaba');
  });

  it('hasil pencarian tipe gotongRoyong (semua kegiatan desa) menaut ke detail Kegiatan Desa', () => {
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
