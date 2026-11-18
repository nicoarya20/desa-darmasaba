// @vitest-environment node
// Halaman Monev & Pembangunan gaya APBDes: keadaan kosong (tanpa "Rp 0"/0%), ringkasan berisi,
// baris kegiatan, tautan APBDes, dan kartu tautan ke Arah Kebijakan Pembangunan Desa (dokumen perencanaan pindah ke sana).
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

import stateDokumenPerencanaanPublik from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaanPublik';
import stateMonevPembangunan, { type MonevKegiatan } from '@/app/admin/(dashboard)/_state/desa/monevPembangunan';
import Page from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/page';
import { MonevKegiatanPanel } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/MonevKegiatanPanel';
import { MonevSummary } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/MonevSummary';
import { MONEV_TEXT } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/monev.text';
import { DOKUMEN_PERENCANAAN_PUBLIC_HREF, type RkpRef } from '@/lib/dokumen-perencanaan';
import type { MonevSummary as MonevSummaryData } from '@/lib/kegiatan-pembangunan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: ringkasan & kegiatan berbentuk respons GET /kegiatandesa/monev.
const EMPTY_SUMMARY: MonevSummaryData = {
  totalKegiatan: 0,
  perStatus: { rencana: 0, berjalan: 0, selesai: 0, belumDiisi: 0 },
  totalAnggaran: 0,
  rataRataProgres: 0,
};
const FILLED_SUMMARY: MonevSummaryData = {
  totalKegiatan: 14,
  perStatus: { rencana: 3, berjalan: 5, selesai: 5, belumDiisi: 1 },
  totalAnggaran: 4_987_500_000,
  rataRataProgres: 61.4,
};
const kegiatan = (id: string, extra: Partial<MonevKegiatan> = {}): MonevKegiatan => ({
  id,
  judul: `Kegiatan ${id}`,
  deskripsiSingkat: '',
  tanggal: '2026-03-10',
  lokasi: 'Banjar Tengah',
  anggaran: 485_000_000,
  progres: 72,
  statusPembangunan: 'berjalan',
  sumberDana: 'Dana Desa',
  image: null,
  ...extra,
});
const panelProps = {
  loading: false,
  failed: false,
  filter: 'semua',
  onFilterChange: () => {},
  onRetry: () => {},
  page: 1,
  totalPages: 1,
  onPageChange: () => {},
};

beforeEach(() => {
  Object.assign(stateMonevPembangunan, { data: [], summary: null, totalPages: 1, loading: false, failed: false });
  stateDokumenPerencanaanPublik.rkpDocs = [];
});

describe('Halaman — keadaan kosong (data stg)', () => {
  it('satu ubin penjelasan, tanpa "Rp 0", tanpa 0%, tanpa daftar/filter', () => {
    stateMonevPembangunan.summary = EMPTY_SUMMARY;
    const html = render(<Page />);

    expect(html).toContain(MONEV_TEXT.emptyTitle);
    expect(html).toContain(MONEV_TEXT.emptyBody);
    expect(text(html)).not.toContain('Rp 0');
    expect(text(html)).not.toMatch(/\b0%/);
    expect(html).not.toContain(MONEV_TEXT.listTitle);
    expect(html).not.toContain(MONEV_TEXT.filterLabel);
  });

  it('tautan realisasi APBDes dan kartu tautan Arah Kebijakan tetap tampil', () => {
    stateMonevPembangunan.summary = EMPTY_SUMMARY;
    const html = render(<Page />);

    expect(html).toContain('href="/apbdes"');
    expect(html).toContain(MONEV_TEXT.apbdesCta);
    expect(html).toContain(`href="${DOKUMEN_PERENCANAAN_PUBLIC_HREF}"`);
    expect(html).toContain(MONEV_TEXT.arahCta);
  });

  it('sebelum data datang → kerangka, bukan pesan kosong', () => {
    const html = render(<Page />);
    expect(html).toContain(`aria-label="${MONEV_TEXT.loading}"`);
    expect(html).not.toContain(MONEV_TEXT.emptyTitle);
  });

  it('gagal muat tanpa ringkasan → pesan galat + coba lagi', () => {
    stateMonevPembangunan.failed = true;
    const html = render(<Page />);
    expect(html).toContain(MONEV_TEXT.failedSummary);
    expect(html).toContain(MONEV_TEXT.retry);
  });
});

describe('Halaman — berisi', () => {
  it('ringkasan + daftar kegiatan + filter tampil, ubin kosong tidak', () => {
    stateMonevPembangunan.summary = FILLED_SUMMARY;
    stateMonevPembangunan.data = [kegiatan('k1')];
    const html = render(<Page />);

    expect(html).not.toContain(MONEV_TEXT.emptyTitle);
    expect(html).toContain(MONEV_TEXT.kegiatanLabel);
    expect(html).toContain(MONEV_TEXT.listTitle);
    expect(html).toContain(`aria-label="${MONEV_TEXT.filterLabel}"`);
    expect(html).toContain('Kegiatan k1');
    expect(html).toContain('href="/apbdes"');
  });
});

describe('MonevSummary', () => {
  it('jumlah kegiatan, sebaran status, anggaran ringkas + penuh, rata-rata progres', () => {
    const html = render(<MonevSummary summary={FILLED_SUMMARY} />);
    const t = text(html);

    expect(t).toContain('14 kegiatan');
    expect(html).toContain('Sebaran kegiatan per status: Rencana 3, Berjalan 5, Selesai 5, Status belum diisi 1');
    expect(t).toContain('Rp 4,99 M');
    expect(t).toContain('Rp 4.987.500.000');
    expect(t).toContain('61,4%');
    expect(html).toContain('aria-valuenow="61"');
  });

  it('kegiatan ada tapi anggaran belum diisi → "Belum tercatat", bukan "Rp 0"', () => {
    const html = render(<MonevSummary summary={{ ...FILLED_SUMMARY, totalAnggaran: 0 }} />);
    expect(html).toContain(MONEV_TEXT.anggaranKosong);
    expect(text(html)).not.toContain('Rp 0');
  });

  it('legenda "belum diisi" disembunyikan bila semua kegiatan berstatus', () => {
    const html = render(
      <MonevSummary summary={{ ...FILLED_SUMMARY, totalKegiatan: 13, perStatus: { ...FILLED_SUMMARY.perStatus, belumDiisi: 0 } }} />,
    );
    expect(html).not.toContain(MONEV_TEXT.belumDiisi);
  });
});

describe('MonevKegiatanPanel', () => {
  it('baris = tautan detail, status, progres, anggaran Rupiah penuh', () => {
    const html = render(<MonevKegiatanPanel {...panelProps} items={[kegiatan('k1')]} />);

    expect(html).toContain('href="/pemerintahan/kegiatan-desa/pembangunan/k1"');
    expect(text(html)).toContain('Banjar Tengah · Sumber dana: Dana Desa');
    expect(text(html)).toContain('Berjalan');
    expect(text(html)).toContain('72%');
    expect(text(html)).toContain('Rp 485.000.000');
  });

  it('field kosong ditulis jujur: status/progres/anggaran "belum diisi", tanpa bar', () => {
    const item = kegiatan('k2', { statusPembangunan: null, progres: null, anggaran: null, lokasi: '', sumberDana: null });
    const html = render(<MonevKegiatanPanel {...panelProps} items={[item]} />);

    expect(html).toContain(MONEV_TEXT.belumDiisi);
    expect(html).toContain(MONEV_TEXT.progresBelumDiisi);
    expect(html).toContain(MONEV_TEXT.anggaranBelumDiisi);
    expect(html).not.toContain('role="progressbar"');
  });

  it('label sumber RKP menaut ke PDF bila ada dokumen RKP di tahun kegiatan', () => {
    const rkpIndex = new Map<number, RkpRef>([[2026, { id: 'r1', judul: 'RKP 2026', tahun: 2026, fileLink: 'https://cdn.test/rkp.pdf' }]]);
    const html = render(<MonevKegiatanPanel {...panelProps} items={[kegiatan('k1')]} rkpIndex={rkpIndex} />);
    expect(html).toContain('href="https://cdn.test/rkp.pdf"');
    expect(html).toContain('Bersumber dari RKP Desa 2026');
  });

  it('filter tanpa hasil → pesan khusus filter', () => {
    const html = render(<MonevKegiatanPanel {...panelProps} filter="selesai" items={[]} />);
    expect(html).toContain(MONEV_TEXT.listEmptyFiltered);
  });

  it('gagal muat → pesan + coba lagi; paginasi hanya bila > 1 halaman', () => {
    const failed = render(<MonevKegiatanPanel {...panelProps} failed items={[]} />);
    expect(failed).toContain(MONEV_TEXT.listFailed);
    expect(failed).not.toContain(MONEV_TEXT.pagination);

    const paged = render(<MonevKegiatanPanel {...panelProps} totalPages={2} items={[kegiatan('k1')]} />);
    expect(paged).toContain(`aria-label="${MONEV_TEXT.pagination}"`);
  });
});

describe('dokumen perencanaan pindah ke Arah Kebijakan Pembangunan Desa', () => {
  const RKP_PDF = 'https://cdn.test/rkp-2026.pdf'; // test-only
  const arahCard = (html: string) => html.slice(html.indexOf(MONEV_TEXT.arahTitle) - 200, html.indexOf(MONEV_TEXT.arahCta) + 200);

  it('kartu tautan menunjuk halaman baru, memuat nama halaman, dan tampil juga saat data terisi', () => {
    for (const summary of [EMPTY_SUMMARY, FILLED_SUMMARY]) {
      stateMonevPembangunan.summary = summary;
      const html = render(<Page />);
      expect(html).toContain('href="/pemerintahan/arah-kebijakan-pembangunan-desa"');
      expect(text(arahCard(html))).toContain('RPJM, RKP, APBDes, dan pelaporan realisasinya ada di Arah Kebijakan Pembangunan Desa');
      expect(text(html)).toContain(MONEV_TEXT.arahCta);
    }
  });

  it('bagian Dokumen Perencanaan lama hilang: tanpa anchor, tab, baris dokumen, atau tombol Lihat PDF', () => {
    stateMonevPembangunan.summary = FILLED_SUMMARY;
    stateMonevPembangunan.data = [kegiatan('k1')];
    const html = render(<Page />);

    expect(html).not.toContain('id="dokumen-perencanaan"');
    expect(html).not.toContain('Jenis dokumen perencanaan');
    expect(html).not.toContain('Halaman dokumen perencanaan');
    expect(html).not.toContain('Berkas PDF belum tersedia');
    expect(text(html)).not.toContain('Lihat PDF');
    expect(text(html)).not.toContain('Nomor Perdes');
    expect(html).not.toContain('Berita Acara');
  });

  it('kartu kegiatan di halaman tetap berlabel "Bersumber dari RKP Desa {tahun}" dengan tautan PDF dari state RKP', () => {
    stateMonevPembangunan.summary = FILLED_SUMMARY;
    stateMonevPembangunan.data = [kegiatan('k1', { tanggal: '2026-03-10' }), kegiatan('k2', { tanggal: '2024-05-01' })];
    stateDokumenPerencanaanPublik.rkpDocs = [{ id: 'r26', judul: 'RKP 2026', tahun: 2026, file: { id: 'f1', link: RKP_PDF, realName: 'rkp-2026.pdf' } }];
    const html = render(<Page />);

    expect(text(html)).toContain('Bersumber dari RKP Desa 2026');
    expect(html).toContain(`href="${RKP_PDF}"`);
    expect(text(html)).not.toContain('Bersumber dari RKP Desa 2024');
  });
});
