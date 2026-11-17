// @vitest-environment node
// Perbaikan kecil persiapan Lomba Website Desa 2027: kontak resmi kantor desa + pengelola website di footer,
// kontak PPID tanpa nomor contoh, tab statistik Posyandu disembunyikan, angka penduduk miskin = tahun terbaru.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FooterKontakDesa } from '@/app/(public)/_com/FooterKontakDesa';
import { DaftarKontak } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarKontak';
import {
  POSYANDU_TABS,
  POSYANDU_TABS_TAMPIL,
  POSYANDU_TABS_TERSEMBUNYI,
  RINGKASAN_STATISTIK_TAMPIL,
} from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.meta';
import {
  pendudukMiskinTerbaru,
  urutkanPerTahun,
} from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/penduduk-miskin.logic';
import { KONTAK_DESA, PENGELOLA_WEBSITE } from '@/con/kontak-desa';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('Footer: kontak kantor desa & pengelola website', () => {
  const html = render(<FooterKontakDesa />);

  it('menampilkan alamat, telepon (tautan tel:), dan email (tautan mailto:) resmi', () => {
    expect(html).toContain('Kontak Kantor Desa');
    expect(html).toContain(KONTAK_DESA.alamat);
    expect(html).toContain('href="tel:+623618441518"');
    expect(html).toContain(`href="mailto:${KONTAK_DESA.email}"`);
  });

  it('mencantumkan pengelola website; tanpa nama redaksi selama SK belum diterima', () => {
    expect(html).toContain(`Pengelola website: ${PENGELOLA_WEBSITE.lembaga}`);
    expect(PENGELOLA_WEBSITE.timRedaksi).toHaveLength(0);
    expect(html).not.toContain(' (');
  });
});

describe('Kontak PPID (Daftar Informasi Publik)', () => {
  const html = render(<DaftarKontak />);

  it('memakai email & telepon resmi kantor desa, tanpa nomor WhatsApp contoh', () => {
    expect(html).toContain(KONTAK_DESA.email);
    expect(html).toContain(KONTAK_DESA.telepon);
    expect(html).not.toContain('081-xxx');
    expect(html).not.toContain('ppid@desadarmasaba.id');
  });
});

describe('Posyandu: tab & kartu statistik disembunyikan sementara', () => {
  it('tab Balita & Ibu Hamil tidak tampil, Ringkasan & Data Posyandu tetap', () => {
    expect(POSYANDU_TABS_TERSEMBUNYI).toEqual(['balita', 'ibu-hamil']);
    expect(POSYANDU_TABS_TAMPIL).toEqual(['ringkasan', 'posyandu']);
    expect(POSYANDU_TABS).toHaveLength(4);
  });

  it('kartu angka gabungan di Ringkasan dimatikan', () => {
    expect(RINGKASAN_STATISTIK_TAMPIL).toBe(false);
  });
});

describe('Jumlah penduduk miskin: angka tahun terbaru, bukan jumlah semua tahun', () => {
  // test-only: angka sama dengan data prod 2024–2026.
  const rows = [
    { year: 2025, totalPoorPopulation: 27 },
    { year: 2026, totalPoorPopulation: 26 },
    { year: '2024', totalPoorPopulation: '27' },
  ];

  it('mengambil tahun terbesar (2026 → 26), bukan 27 + 27 + 26 = 80', () => {
    expect(pendudukMiskinTerbaru(rows)).toEqual({ year: 2026, total: 26 });
  });

  it('kosong / tahun tidak valid → null', () => {
    expect(pendudukMiskinTerbaru([])).toBeNull();
    expect(pendudukMiskinTerbaru([{ year: 'x', totalPoorPopulation: 5 }])).toBeNull();
  });

  it('grafik diurutkan tahun naik', () => {
    expect(urutkanPerTahun(rows).map((r) => Number(r.year))).toEqual([2024, 2025, 2026]);
  });
});
