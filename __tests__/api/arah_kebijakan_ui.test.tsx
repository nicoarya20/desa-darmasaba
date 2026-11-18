// @vitest-environment node
// Halaman publik Arah Kebijakan Pembangunan Desa (SSR): tab 4 kategori, tab Berita Acara bersyarat, baris dengan
// Lihat + Unduh, urutan tahun menurun, keadaan memuat/gagal/kosong, dan paginasi. jsdom rusak → renderToStaticMarkup;
// efek tidak jalan di server, jadi ArahKebijakanView (tanpa pengambilan data) dirender dengan state yang diberikan.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));

import Page from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/page';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import {
  ARAH_PAGE_SIZE,
  kategoriTampil,
  type ArahDokumen,
  type ArahDokumenPage,
} from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/_com/arah-kebijakan.logic';
import { ARAH_TEXT, KATEGORI_TEXT } from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/_com/arah-kebijakan.text';
import { ArahKebijakanView } from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/_com/ArahKebijakanView';
import type { JenisDokumen } from '@/lib/dokumen-perencanaan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const dok = (id: string, extra: Partial<ArahDokumen> = {}): ArahDokumen => ({
  id, jenis: 'RKP', judul: `Dokumen ${id}`, tahun: 2026, tahunMulai: null, tahunSelesai: null, // test-only
  nomorPerdes: null, ringkasan: null, jenisMusyawarah: null, file: null, ...extra,
});
const pdf = (name: string) => ({ link: `https://files.test/${name}`, realName: name }); // test-only
const ready = (items: ArahDokumen[], totalPages = 1): LoadState<ArahDokumenPage> => ({
  status: 'ready', data: { items, totalPages, total: items.length },
});

type ViewOverrides = Partial<React.ComponentProps<typeof ArahKebijakanView>>;
const view = (state: LoadState<ArahDokumenPage>, over: ViewOverrides = {}, kategori: JenisDokumen = 'RKP') =>
  render(
    <ArahKebijakanView
      kategoriList={kategoriTampil(false)}
      kategori={kategori}
      onKategoriChange={() => {}}
      state={state}
      page={1}
      onPageChange={() => {}}
      onRetry={() => {}}
      {...over}
    />,
  );

describe('kepala halaman dan tab kategori', () => {
  it('judul halaman dan empat kategori tampil sebagai tab', () => {
    const html = view(ready([]));
    const t = text(html);
    expect(html).toContain(`>${ARAH_TEXT.pageTitle}</h1>`);
    for (const tab of ['RPJM Desa', 'RKPDes', 'APBDes', 'Pelaporan']) expect(t).toContain(tab);
    expect(html).toContain(`aria-label="${ARAH_TEXT.tabsLabel}"`);
  });

  it('tab Berita Acara tersembunyi bila belum ada dokumen aktif', () => {
    const t = text(view(ready([])));
    expect(t).not.toContain(KATEGORI_TEXT.BERITA_ACARA_MUSYAWARAH.tab);
    expect(t).not.toContain('Berita Acara');
  });

  it('tab Berita Acara muncul bila sudah ada dokumen, tanpa menghilangkan empat kategori lain', () => {
    const t = text(view(ready([]), { kategoriList: kategoriTampil(true) }));
    for (const tab of ['RPJM Desa', 'RKPDes', 'APBDes', 'Pelaporan', 'Berita Acara']) expect(t).toContain(tab);
  });

  it('judul dan pengantar panel mengikuti kategori terpilih', () => {
    const html = view(ready([]), {}, 'PELAPORAN_APBDES');
    expect(html).toContain(`>${KATEGORI_TEXT.PELAPORAN_APBDES.title}</h2>`);
    expect(text(html)).toContain(KATEGORI_TEXT.PELAPORAN_APBDES.lead);
  });
});

describe('tabel dokumen', () => {
  const items = [
    dok('d2024', { tahun: 2024, nomorPerdes: '5 Tahun 2024', file: pdf('apbdes-2024.pdf') }),
    dok('d2026', { tahun: 2026, ringkasan: 'Ringkasan 2026', file: pdf('apbdes-2026.pdf') }),
    dok('d2025', { tahun: 2025 }),
  ];

  it('kolom No, Nama Dokumen, Tahun, File, Aksi', () => {
    const html = view(ready(items));
    for (const col of [ARAH_TEXT.colNo, ARAH_TEXT.colNama, ARAH_TEXT.colTahun, ARAH_TEXT.colFile, ARAH_TEXT.colAksi]) {
      expect(html).toContain(`scope="col"`);
      expect(text(html)).toContain(col);
    }
    expect(html).toContain(`aria-label="${ARAH_TEXT.tableLabel(KATEGORI_TEXT.RKP.title)}"`);
  });

  it('baris diurut tahun menurun walau data datang tak berurutan, dengan nomor 1..n', () => {
    const html = view(ready(items));
    const urutan = ['Dokumen d2026', 'Dokumen d2025', 'Dokumen d2024'].map((j) => html.indexOf(j));
    expect(urutan.every((i) => i > 0)).toBe(true);
    expect([...urutan].sort((a, b) => a - b)).toEqual(urutan);
    const nomor = [...html.matchAll(/<td class="[^"]*colNo[^"]*" data-label="No">(\d+)<\/td>/g)].map((m) => m[1]);
    expect(nomor).toEqual(['1', '2', '3']);
  });

  it('penomoran berlanjut di halaman berikutnya', () => {
    const html = view(ready([dok('x')], 3), { page: 2 });
    expect(html).toContain(`data-label="No">${ARAH_PAGE_SIZE + 1}</td>`);
  });

  it('baris berkas punya Lihat (tab baru, rel aman) dan Unduh (download = nama asli)', () => {
    const html = view(ready(items));
    expect(html).toContain('href="https://files.test/apbdes-2026.pdf" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('download="apbdes-2026.pdf"');
    expect(html).toContain(`aria-label="${ARAH_TEXT.lihatLabel('Dokumen d2026')}"`);
    expect(html).toContain(`aria-label="${ARAH_TEXT.unduhLabel('Dokumen d2026')}"`);
    expect(text(html)).toContain('apbdes-2024.pdf');
    expect(text(html)).toContain(ARAH_TEXT.lihat);
    expect(text(html)).toContain(ARAH_TEXT.unduh);
  });

  it('dokumen tanpa berkas: keterangan jujur, tanpa tombol Lihat/Unduh', () => {
    const html = view(ready([dok('kosong')]));
    expect(text(html)).toContain(ARAH_TEXT.fileKosong);
    expect(text(html)).toContain(ARAH_TEXT.aksiKosong);
    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('download=');
  });

  it('nomor Perdes dan ringkasan tampil bila ada; RPJM menampilkan rentang tahun', () => {
    const t = text(view(ready(items)));
    expect(t).toContain('Nomor Perdes: 5 Tahun 2024');
    expect(t).toContain('Ringkasan 2026');
    const rpjm = text(
      view(ready([dok('r', { jenis: 'RPJM', tahun: null, tahunMulai: 2021, tahunSelesai: 2027 })]), {}, 'RPJM'),
    );
    expect(rpjm).toContain('2021 - 2027');
  });

  it('berita acara menampilkan jenis musyawarah', () => {
    const html = view(
      ready([dok('b', { jenis: 'BERITA_ACARA_MUSYAWARAH', jenisMusyawarah: 'MUSDES' })]),
      { kategoriList: kategoriTampil(true) },
      'BERITA_ACARA_MUSYAWARAH',
    );
    expect(text(html)).toContain('Musyawarah Desa (Musdes)');
  });
});

describe('keadaan memuat, kosong, dan gagal', () => {
  it('memuat → kerangka beraria-busy, tanpa tabel maupun pesan kosong', () => {
    const html = view({ status: 'loading' });
    expect(html).toContain(`aria-label="${ARAH_TEXT.loading}"`);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<table');
    expect(text(html)).not.toContain(KATEGORI_TEXT.RKP.empty);
  });

  it.each(['RPJM', 'RKP', 'APBDES', 'PELAPORAN_APBDES'] as const)('%s kosong → satu kalimat per kategori', (kategori) => {
    const html = view(ready([]), {}, kategori);
    expect(text(html)).toContain(KATEGORI_TEXT[kategori].empty);
    expect(html).not.toContain('<table');
  });

  it('gagal → pesan berbeda dari kosong + tombol coba lagi (role alert)', () => {
    const html = view({ status: 'error' });
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(ARAH_TEXT.failed);
    expect(text(html)).toContain(ARAH_TEXT.retry);
    expect(text(html)).not.toContain(KATEGORI_TEXT.RKP.empty);
    expect(html).not.toContain('<table');
  });
});

describe('halaman (page.tsx) sebelum data datang', () => {
  it('tampil sebagai kerangka RPJM dengan empat tab; Berita Acara belum diketahui jadi tersembunyi', () => {
    const html = render(<Page />);
    expect(html).toContain(`>${ARAH_TEXT.pageTitle}</h1>`);
    expect(html).toContain(`aria-label="${ARAH_TEXT.loading}"`);
    expect(html).toContain(`>${KATEGORI_TEXT.RPJM.title}</h2>`);
    expect(text(html)).not.toContain('Berita Acara');
  });
});

describe('paginasi', () => {
  it('hanya tampil bila lebih dari satu halaman', () => {
    expect(view(ready([dok('a')], 1))).not.toContain(`aria-label="${ARAH_TEXT.pagination}"`);
    expect(view(ready([dok('a')], 3))).toContain(`aria-label="${ARAH_TEXT.pagination}"`);
    expect(view({ status: 'error' })).not.toContain(`aria-label="${ARAH_TEXT.pagination}"`);
  });
});
