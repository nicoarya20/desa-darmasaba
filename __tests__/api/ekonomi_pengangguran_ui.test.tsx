// @vitest-environment node
// Modul Pengangguran: keadaan muat/galat/kosong halaman Jumlah Pengangguran, ringkasan bulan terbaru + perubahan,
// rincian per bulan, pemilih tahun, panel sebaran (baris terbaru saja) dan tautan silang.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; efek (fetch) tidak jalan di server, state diisi langsung.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { JumlahPengangguranContent } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/JumlahPengangguranPage';
import { PengangguranCrossLink } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/PengangguranStates';
import { PengangguranSummary } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/PengangguranSummary';
import { SebaranSection } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/SebaranSection';
import { toSebaran, type PengangguranBulan } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.logic';
import { KOLOM_USIA, USIA_KERJA_MENGANGGUR_HREF } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.meta';
import { PENGANGGURAN_TEXT as T } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.text';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only
const bln = (tahun: number, bulan: number, terdidik: number, tidakTerdidik: number, updatedAt: string | null = null): PengangguranBulan => ({
  id: `${tahun}-${bulan}`,
  tahun,
  bulan,
  terdidik,
  tidakTerdidik,
  total: terdidik + tidakTerdidik,
  updatedAt,
});
// test-only: Des 2025 → Jan 2026 → Feb 2026, diacak seperti urutan API
const ROWS = [bln(2026, 1, 150, 120, '2026-11-02T03:00:00.000Z'), bln(2025, 11, 100, 32), bln(2026, 0, 200, 150)];

describe('JumlahPengangguranContent keadaan', () => {
  it('memuat → kerangka aria-busy tanpa angka', () => {
    const html = render(<JumlahPengangguranContent state={{ status: 'loading' }} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`aria-label="${T.jumlah.loading}"`);
    expect(text(html)).not.toContain(T.orang);
  });

  it('galat → kotak satu kalimat', () => {
    const html = render(<JumlahPengangguranContent state={{ status: 'error' }} />);
    expect(html).toContain(kabar.empty);
    expect(text(html)).toContain(T.jumlah.error);
  });

  it('kosong → kotak "akan tampil di sini", tanpa kartu 0 / grafik kosong', () => {
    const html = render(<JumlahPengangguranContent state={{ status: 'ready', data: [] }} />);
    const out = text(html);
    expect(out).toContain(T.jumlah.empty);
    expect(out).not.toContain(T.orang);
    expect(out).not.toContain(T.jumlah.trendTitle);
  });
});

describe('JumlahPengangguranContent berisi', () => {
  const html = render(<JumlahPengangguranContent state={{ status: 'ready', data: ROWS }} />);
  const out = text(html);

  it('kartu = bulan terbaru (bukan total setahun) + perubahan dari bulan sebelumnya', () => {
    expect(out).toContain('Data diperbarui 2 November 2026');
    expect(out).toContain('Pengangguran Februari 2026 270 orang');
    expect(out).toContain('Turun 80 orang (22,9%) dari Januari 2026');
    expect(out).not.toContain('620');
  });

  it('kartu terdidik & tidak terdidik dengan porsi dari jumlah bulan itu', () => {
    expect(out).toContain('Terdidik 150 orang 55,6% dari jumlah');
    expect(out).toContain('Tidak terdidik 120 orang 44,4% dari jumlah');
  });

  it('pemilih tahun muncul bila > 1 tahun; bawaan tahun bulan terbaru', () => {
    expect(html).toContain(`aria-label="${T.jumlah.yearPicker}"`);
    expect(out).toContain('2025');
    expect(out).toContain(T.jumlah.tableTitle(2026));
  });

  it('rincian tahun terpilih saja, perubahan dihitung lintas tahun', () => {
    expect(out).toContain('Januari 2026 350 200 150 +165,2%');
    expect(out).toContain('Februari 2026 270 150 120 −22,9%');
    expect(out).not.toContain('Desember 2025');
    expect(html).toContain(`data-label="${T.jumlah.terdidik}"`);
  });

  it('satu tahun saja → tanpa pemilih tahun; bulan tanpa pembanding → "–"', () => {
    const single = render(<JumlahPengangguranContent state={{ status: 'ready', data: [bln(2026, 3, 10, 5)] }} />);
    expect(single).not.toContain(`aria-label="${T.jumlah.yearPicker}"`);
    expect(text(single)).toContain(T.jumlah.tanpaPembanding);
    expect(text(single)).toContain('April 2026 15 10 5 –');
  });
});

describe('PengangguranSummary', () => {
  it('jumlah sama dengan bulan lalu → "Sama dengan"', () => {
    const rows = [bln(2026, 0, 5, 5), bln(2026, 1, 6, 4)];
    expect(text(render(<PengangguranSummary rows={rows} latest={rows[1]} />))).toContain('Sama dengan Januari 2026');
  });

  it('jumlah 0 → porsi tidak ditulis (bukan 0% / NaN)', () => {
    const row = bln(2026, 1, 0, 0);
    const out = text(render(<PengangguranSummary rows={[row]} latest={row} />));
    expect(out).toContain('Pengangguran Februari 2026 0 orang');
    expect(out).not.toContain('dari jumlah');
    expect(out).not.toContain('NaN');
  });
});

describe('SebaranSection', () => {
  const title = T.usia.usiaTitle;
  const usia = (over: Record<string, unknown> = {}) =>
    toSebaran({ id: 'u1', usia18_25: '25', usia26_35: '18', usia36_45: '12', usia46_keatas: '10', updatedAt: '2026-11-02T03:00:00.000Z', ...over }, KOLOM_USIA);

  it('memuat → kerangka role=status berlabel', () => {
    const html = render(<SebaranSection id="s" title={title} state={{ status: 'loading' }} />);
    expect(html).toContain('role="status"');
    expect(html).toContain(`aria-label="${T.usia.loading(title)}"`);
  });

  it('galat → role=alert dengan kalimat galat', () => {
    const html = render(<SebaranSection id="s" title={title} state={{ status: 'error' }} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.usia.error(title));
  });

  it('belum ada baris / semua kelompok belum diisi → ubin kosong berjudul', () => {
    for (const data of [null, usia({ usia18_25: '', usia26_35: 'x', usia36_45: null, usia46_keatas: '1,5' })]) {
      const out = text(render(<SebaranSection id="s" title={title} state={{ status: 'ready', data }} />));
      expect(out).toContain(title);
      expect(out).toContain(T.usia.empty(title));
      expect(out).not.toContain(T.total);
    }
  });

  it('berisi → panel stat-bars: total, kelompok urut usia, persen, tanggal', () => {
    const html = render(<SebaranSection id="sebaran-usia-title" title={title} state={{ status: 'ready', data: usia() }} />);
    const out = text(html);
    expect(html).toContain('aria-labelledby="sebaran-usia-title"');
    expect(out).toContain('Data diperbarui 2 November 2026');
    expect(out).toContain('Total tercatat 65 orang');
    expect(out).toContain('18–25 tahun 25 orang 38,5%');
    expect(out).toContain('46 tahun ke atas 10 orang 15,4%');
    expect(out.indexOf('18–25 tahun')).toBeLessThan(out.indexOf('46 tahun ke atas'));
  });

  it('kelompok tak terbaca → "Belum diisi", tidak ikut total', () => {
    const out = text(render(<SebaranSection id="s" title={title} state={{ status: 'ready', data: usia({ usia36_45: '12 orang' }) }} />));
    expect(out).toContain('Total tercatat 53 orang');
    expect(out).toContain(`36–45 tahun ${T.belumDiisi}`);
  });
});

describe('PengangguranCrossLink', () => {
  it('pil tautan ke halaman pasangan', () => {
    const html = render(<PengangguranCrossLink href={USIA_KERJA_MENGANGGUR_HREF} label={T.jumlah.crossLink} />);
    expect(html).toContain(`href="${USIA_KERJA_MENGANGGUR_HREF}"`);
    expect(text(html)).toContain(T.jumlah.crossLink);
  });
});
