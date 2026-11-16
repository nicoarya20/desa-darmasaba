// @vitest-environment node
// Halaman detail sekolah publik (Info Sekolah › lembaga/[id]): data lengkap, data minimal (bagian kosong tidak
// dirender), keadaan muat/galat/tidak ditemukan, direktori menaut ke detail, dan loader menolak lembaga nonaktif.
// jsdom rusak di repo ini → renderToStaticMarkup; klik tidak diuji.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

import { JenjangDirectory } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/JenjangDirectory';
import { buildRingkasan } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.logic';
import { loadLembagaDetail } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.source';
import { LembagaDetailBody } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailPage';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import getDetailUrl from '@/app/(public)/_com/searchUrl';
import type { LembagaDetail } from '@/lib/lembaga-pendidikan/lembaga.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const body = (state: LoadState<LembagaDetail | null>) => render(<LembagaDetailBody state={state} onRetry={vi.fn()} />);
const ready = (data: LembagaDetail | null): LoadState<LembagaDetail | null> => ({ status: 'ready', data });

// test-only: data rekaan.
const MINIMAL: LembagaDetail = {
  id: 'lb1',
  nama: 'TK Contoh Ceria',
  jenjangId: 'j-tk',
  jenjangPendidikan: { id: 'j-tk', nama: 'TK' },
  isActive: true,
  deskripsi: null,
  alamat: null,
  kontak: null,
  mediaSosial: [],
  lat: null,
  lng: null,
  linkGoogleMaps: null,
  fotoSekolahId: null,
  fotoSekolah: null,
  fotoBaganStrukturId: null,
  fotoBaganStruktur: null,
  pengurus: [],
  fotoKegiatan: [],
  _count: { siswa: 0, pengajar: 0 },
};

// test-only: data rekaan.
const LENGKAP: LembagaDetail = {
  ...MINIMAL,
  deskripsi: 'Sekolah contoh tempat anak bermain dan belajar.\nKegiatan rutin setiap pagi.',
  alamat: 'Jl. Contoh No. 1, Desa Contoh',
  kontak: '081200001111 (Admin)',
  mediaSosial: [{ platform: 'instagram', url: 'https://www.instagram.com/tk_contoh' }],
  lat: -8.6,
  lng: 115.2,
  linkGoogleMaps: 'https://maps.app.goo.gl/Contoh123',
  fotoSekolahId: 'img-sekolah',
  fotoSekolah: { id: 'img-sekolah', link: '/api/img/sekolah.webp' },
  fotoBaganStrukturId: 'img-bagan',
  fotoBaganStruktur: { id: 'img-bagan', link: '/api/img/bagan.webp' },
  pengurus: [{ id: 'p1', nama: 'Kepala Contoh', jabatan: 'Kepala Sekolah', urutan: 0, imageId: null, image: null }],
  fotoKegiatan: [{ id: 'f1', imageId: 'img-f1', keterangan: 'Menanam padi', urutan: 0, image: { id: 'img-f1', link: '/api/img/f1.webp' } }],
  _count: { siswa: 24, pengajar: 3 },
};

describe('LembagaDetailBody', () => {
  it('lengkap: foto sekolah, profil, info, medsos, peta + tombol Maps, struktur, galeri', () => {
    const html = body(ready(LENGKAP));
    const t = text(html);
    expect(html).toContain('<h1');
    expect(t).toContain('TK Contoh Ceria');
    expect(t).toContain('Taman Kanak-kanak');
    expect(html).toContain('src="/api/img/sekolah.webp"');
    expect(t).toContain('Profil Sekolah');
    expect(t).toContain('Kegiatan rutin setiap pagi.');
    expect(t).toContain('24 siswa · 3 pengajar');
    expect(t).toContain('Jl. Contoh No. 1, Desa Contoh');
    expect(html).toContain('href="https://maps.app.goo.gl/Contoh123"');
    expect(html).toMatch(/href="tel:[^"]+"/);
    expect(html).toContain('href="https://www.instagram.com/tk_contoh"');
    expect(html).toContain('data-testid="peta"');
    expect(t).toContain('Struktur Organisasi');
    expect(t).toContain('Kepala Contoh');
    expect(html).toContain('src="/api/img/bagan.webp"');
    expect(html).toContain('data-testid="galeri-lembaga"');
    expect(t).toContain('Menanam padi');
  });

  it('minimal: bagian kosong tidak dirender (tanpa foto, profil, lokasi, struktur, galeri, medsos)', () => {
    const html = body(ready(MINIMAL));
    const t = text(html);
    expect(t).toContain('TK Contoh Ceria');
    expect(t).toContain('Informasi');
    expect(t).toContain('0 siswa · 0 pengajar');
    for (const absen of ['Profil Sekolah', 'Lokasi', 'Struktur Organisasi', 'Foto Kegiatan', 'Alamat', 'Kontak', 'Media sosial']) {
      expect(t).not.toContain(absen);
    }
    expect(html).not.toContain('<img');
    expect(html).not.toContain('Buka di Google Maps');
    expect(html).not.toContain('data-testid="konten-kosong"');
  });

  it('tanpa alamat tetapi ada link Maps → tombol Google Maps tetap ada', () => {
    const html = body(ready({ ...MINIMAL, linkGoogleMaps: 'https://maps.app.goo.gl/Contoh123' }));
    expect(html).toContain('href="https://maps.app.goo.gl/Contoh123"');
    expect(text(html)).not.toContain('Lokasi');
  });

  it('memuat / galat / tidak ditemukan', () => {
    expect(body({ status: 'loading' })).toContain('aria-busy="true"');
    const galat = body({ status: 'error' });
    expect(galat).toContain('role="alert"');
    expect(galat).toContain('Coba lagi');
    const hilang = body(ready(null));
    expect(text(hilang)).toContain('Sekolah tidak ditemukan');
    expect(hilang).toContain('href="/pendidikan/info-sekolah#lembaga"');
  });
});

describe('direktori sekolah per jenjang', () => {
  it('tiap ubin sekolah menaut ke halaman detail', () => {
    const ringkasan = buildRingkasan(
      { perJenjang: [{ nama: 'TK', jumlahSiswa: 1, jumlahPengajar: 1 }], jumlahLembaga: 1, jumlahPengajar: 1 },
      [{ id: 'lb 1', nama: 'TK Contoh Ceria', jenjangPendidikan: { nama: 'TK' } }],
    );
    const html = render(<JenjangDirectory ringkasan={ringkasan} />);
    expect(html).toContain('href="/pendidikan/info-sekolah/lembaga/lb%201"');
    // Hasil pencarian global tipe lembaga juga menuju detail (dulu ke /lembaga yang 308 ke direktori).
    expect(getDetailUrl({ type: 'lembaga', id: 'lb1' })).toBe('/pendidikan/info-sekolah/lembaga/lb1');
  });
});

describe('loadLembagaDetail', () => {
  afterEach(() => vi.unstubAllGlobals());
  const stubFetch = (status: number, json: unknown) =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(json), { status })));

  it('aktif → data; nonaktif / 404 → null; galat server → lempar', async () => {
    stubFetch(200, { success: true, data: LENGKAP });
    expect(await loadLembagaDetail('lb1')).toMatchObject({ id: 'lb1' });
    stubFetch(200, { success: true, data: { ...LENGKAP, isActive: false } });
    expect(await loadLembagaDetail('lb1')).toBeNull();
    stubFetch(404, { success: false, message: 'Lembaga pendidikan tidak ditemukan' });
    expect(await loadLembagaDetail('x')).toBeNull();
    stubFetch(500, { success: false, message: 'boom' });
    await expect(loadLembagaDetail('lb1')).rejects.toThrow('HTTP 500');
  });
});
