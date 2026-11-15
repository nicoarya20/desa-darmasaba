// @vitest-environment node
// Info Sekolah publik (ringkasan 3 ubin + sekolah per jenjang, daftar pengajar). jsdom rusak di repo ini →
// markup diuji via renderToStaticMarkup dengan keadaan muat diisi langsung.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { InfoSekolahBody } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/InfoSekolahPage';
import {
  buildRingkasan,
  type InfoSekolahQuery,
} from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.logic';
import { PengajarResults } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/PengajarResults';
import type { PengajarPage } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.source';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: data bentuk stg (siswa = pengajar, seperti data dummy saat ini).
const RINGKASAN = buildRingkasan(
  {
    perJenjang: [
      { nama: 'SD', jumlahSiswa: 70, jumlahPengajar: 70 },
      { nama: 'TK', jumlahSiswa: 49, jumlahPengajar: 49 },
      { nama: 'SMK', jumlahSiswa: 0, jumlahPengajar: 0 },
    ],
    jumlahLembaga: 3,
    jumlahPengajar: 119,
  },
  [
    { id: 'a', nama: 'SD No. 1 Darmasaba', jenjangPendidikan: { nama: 'SD' } },
    { id: 'b', nama: 'SD No. 2 Darmasaba', jenjangPendidikan: { nama: 'SD' } },
    { id: 'c', nama: 'TK Widya Sari', jenjangPendidikan: { nama: 'TK' } },
  ],
);

const body = (state: LoadState<typeof RINGKASAN>) => render(<InfoSekolahBody state={state} onRetry={vi.fn()} />);

describe('InfoSekolahBody (halaman utama)', () => {
  it('memuat → kerangka aria-busy, tanpa angka', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Siswa terdaftar');
  });

  it('galat → pesan + "Coba lagi", bukan angka 0', () => {
    const html = body({ status: 'error' });
    expect(html).toContain('role="alert"');
    expect(html).toContain('Coba lagi');
    expect(text(html)).not.toMatch(/\b0 lembaga/);
  });

  it('tanpa lembaga → satu ubin "Belum ada data sekolah", tanpa ubin angka 0', () => {
    const html = body({ status: 'ready', data: { totalLembaga: 0, totalSiswa: 0, totalPengajar: 0, groups: [] } });
    expect(html).toContain('Belum ada data sekolah');
    expect(html).not.toContain('Tenaga pengajar');
  });

  it('ringkasan: 3 ubin berjudul h2 dengan total; tanpa "Segarkan Data"/"Lihat Detail"', () => {
    const html = body({ status: 'ready', data: RINGKASAN });
    const t = text(html);
    for (const label of ['Lembaga pendidikan', 'Siswa terdaftar', 'Tenaga pengajar']) expect(html).toMatch(new RegExp(`<h2[^>]*>${label}</h2>`));
    expect(t).toContain('3 lembaga');
    expect(t).toContain('119 siswa');
    expect(t).toContain('119 orang');
    expect(t).not.toContain('Segarkan Data');
    expect(t).not.toContain('Lihat Detail');
  });

  it('batang sebaran: label aksesibel per jenjang + legenda urut TK, SD', () => {
    const html = body({ status: 'ready', data: RINGKASAN });
    expect(html).toContain('aria-label="Sebaran lembaga per jenjang: TK 1, SD 2"');
    expect(text(html).indexOf('TK 1')).toBeLessThan(text(html).indexOf('SD 2'));
  });

  it('siswa hanya angka (catatan perlindungan anak), tanpa tautan daftar siswa; pengajar menaut ke daftarnya', () => {
    const html = body({ status: 'ready', data: RINGKASAN });
    expect(html).toContain('Nama siswa tidak ditampilkan');
    expect(html).not.toContain('/pendidikan/info-sekolah/siswa');
    expect(html).toContain('href="/pendidikan/info-sekolah/pengajar"');
  });

  it('direktori #lembaga: kelompok per jenjang (nama panjang + angka) dan nama sekolah', () => {
    const html = body({ status: 'ready', data: RINGKASAN });
    const t = text(html);
    expect(html).toContain('id="lembaga"');
    expect(t).toContain('Sekolah per jenjang');
    expect(t).toContain('3 lembaga pendidikan di 2 jenjang.');
    expect(t).toContain('Sekolah Dasar');
    expect(t).toContain('2 lembaga · 70 siswa · 70 pengajar');
    expect(t).toContain('SD No. 2 Darmasaba');
    expect(t).toContain('TK Widya Sari');
    expect(t).not.toContain('SMK'); // jenjang tanpa lembaga tidak dibuat kelompok
  });
});

const QUERY: InfoSekolahQuery = { jenjang: '', search: '', page: 1 };
// test-only: dua baris pengajar.
const PAGE: PengajarPage = {
  items: [
    { id: 'p1', nama: 'I Kadek Ariyasa', lembaga: { nama: 'TK Widya Kumara', jenjangPendidikan: { nama: 'TK' } } },
    { id: 'p2', nama: 'Ni Luh Sari', lembaga: null },
  ],
  total: 12,
  totalPages: 2,
};
const pengajar = (state: LoadState<PengajarPage>, query: Partial<InfoSekolahQuery> = {}) =>
  render(<PengajarResults state={state} query={{ ...QUERY, ...query }} onRetry={vi.fn()} onPage={vi.fn()} />);

describe('PengajarResults (daftar pengajar)', () => {
  it('baris: nama, lembaga, pil jenjang; jumlah total dan paginasi bila > 1 halaman', () => {
    const html = pengajar({ status: 'ready', data: PAGE });
    const t = text(html);
    expect(t).toContain('12 pengajar');
    expect(t).toContain('I Kadek Ariyasa');
    expect(t).toContain('TK Widya Kumara');
    expect(html).toMatch(/<span[^>]*>.*?TK<\/span>/);
    expect(t).toContain('Ni Luh Sari');
    expect(html).toContain('aria-label="Halaman daftar pengajar"');
    expect(html).not.toContain('<table');
  });

  it('satu halaman → tanpa paginasi', () => {
    expect(pengajar({ status: 'ready', data: { ...PAGE, totalPages: 1 } })).not.toContain('Halaman daftar pengajar');
  });

  it('memuat → kerangka; galat → "Coba lagi"', () => {
    expect(pengajar({ status: 'loading' })).toContain('aria-busy="true"');
    const err = pengajar({ status: 'error' });
    expect(err).toContain('role="alert"');
    expect(err).toContain('Coba lagi');
  });

  it('kosong karena filter → pesan menyebut jenjang & kata kunci', () => {
    const empty: LoadState<PengajarPage> = { status: 'ready', data: { items: [], total: 0, totalPages: 0 } };
    expect(text(pengajar(empty, { jenjang: 'sd', search: 'zzz' }))).toContain('Tidak ada pengajar “zzz” di jenjang SD.');
    expect(text(pengajar(empty))).toContain('Belum ada data pengajar.');
  });

  it('halaman di URL melewati halaman terakhir → pesan + tombol ke halaman pertama', () => {
    const t = text(pengajar({ status: 'ready', data: { items: [], total: 12, totalPages: 2 } }, { page: 9 }));
    expect(t).toContain('Halaman 9 tidak ada.');
    expect(t).toContain('Ke halaman pertama');
  });
});
