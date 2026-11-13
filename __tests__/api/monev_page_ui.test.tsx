// @vitest-environment node
// Halaman Monev & Pembangunan gaya APBDes: keadaan kosong (tanpa "Rp 0"/0%), ringkasan berisi,
// baris kegiatan, tautan APBDes, dan dokumen perencanaan.
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
import type { DokumenPerencanaanItem } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import stateMonevPembangunan, { type MonevKegiatan } from '@/app/admin/(dashboard)/_state/desa/monevPembangunan';
import Page from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/page';
import { DokumenList } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/DokumenPerencanaanSection';
import { MonevKegiatanPanel } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/MonevKegiatanPanel';
import { MonevSummary } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/MonevSummary';
import { MONEV_TEXT } from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/monev.text';
import { DOKUMEN_PERENCANAAN_SECTION_ID, type RkpRef } from '@/lib/dokumen-perencanaan';
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
// test-only: dokumen berbentuk respons find-many.
const dokumen = (id: string, extra: Partial<DokumenPerencanaanItem> = {}): DokumenPerencanaanItem => ({
  id,
  jenis: 'RPJM',
  judul: `Dokumen ${id}`,
  tahun: null,
  tahunMulai: 2021,
  tahunSelesai: 2027,
  nomorPerdes: null,
  ringkasan: null,
  jenisMusyawarah: null,
  fileId: null,
  file: null,
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
  Object.assign(stateDokumenPerencanaanPublik, { data: [], totalPages: 1, loading: false, failed: false, rkpDocs: [] });
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

  it('tautan realisasi APBDes dan dokumen perencanaan tetap tampil', () => {
    stateMonevPembangunan.summary = EMPTY_SUMMARY;
    const html = render(<Page />);

    expect(html).toContain('href="/apbdes"');
    expect(html).toContain(MONEV_TEXT.apbdesCta);
    expect(html).toContain(`id="${DOKUMEN_PERENCANAAN_SECTION_ID}"`);
    expect(html).toContain(MONEV_TEXT.docEmpty('RPJM'));
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

describe('DokumenList', () => {
  it('kosong → pesan per jenis', () => {
    const html = render(<DokumenList jenis="RKP" items={[]} loading={false} failed={false} onRetry={() => {}} />);
    expect(html).toContain(MONEV_TEXT.docEmpty('RKP'));
  });

  it('berisi → periode, judul, nomor Perdes, Lihat PDF + Unduh; tanpa file → keterangan', () => {
    const items = [
      dokumen('d1', {
        nomorPerdes: '4 Tahun 2021',
        ringkasan: 'Ringkasan RPJM',
        file: { id: 'f1', link: 'https://cdn.test/rpjm.pdf', realName: 'rpjm.pdf' },
      }),
      dokumen('d2', { jenis: 'BERITA_ACARA_MUSYAWARAH', tahun: 2026, tahunMulai: null, tahunSelesai: null, jenisMusyawarah: 'MUSRENBANGDES' }),
    ];
    const html = render(<DokumenList jenis="RPJM" items={items} loading={false} failed={false} onRetry={() => {}} />);
    const t = text(html);

    expect(t).toContain('2021 - 2027');
    expect(t).toContain('Dokumen d1');
    expect(t).toContain('Nomor Perdes: 4 Tahun 2021');
    expect(html).toContain('href="https://cdn.test/rpjm.pdf"');
    expect(html).toContain('download="rpjm.pdf"');
    expect(t).toContain('2026 · Musrenbang Desa');
    expect(t).toContain(MONEV_TEXT.docNoFile);
  });
});
