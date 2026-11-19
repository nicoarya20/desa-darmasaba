// @vitest-environment node
// Indeks Desa Membangun publik: kerangka Kabar, ringkasan tahun terbaru (skor + status), tiga kartu dimensi, riwayat per
// tahun, dan keadaan memuat/kosong/galat. jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), replace: vi.fn(), push: vi.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import { IndeksDesaContent, IndeksDesaPage } from '@/app/(public)/(pages)/indeks-desa/idm/_com/IndeksDesaPage';
import { barStyle, formatSkor } from '@/app/(public)/(pages)/indeks-desa/idm/_com/indeks-desa.logic';
import { INDEKS_DESA_TEXT as T } from '@/app/(public)/(pages)/indeks-desa/idm/_com/indeks-desa.text';
import type { IndeksDesaRecord } from '@/lib/indeks-desa';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: angka rekaan untuk menguji tampilan, bukan data IDM Desa Darmasaba.
const BARU: IndeksDesaRecord = { id: 'b', tahun: 2031, skorIdm: 0.75, skorIks: 0.8, skorIke: 0.7, skorIkl: 0.65, status: 'Maju', catatan: 'Sumber uji' };
const LAMA: IndeksDesaRecord = { id: 'l', tahun: 2030, skorIdm: 0.5, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.45, status: 'Berkembang', catatan: null };

describe('logic tampilan', () => {
  it('formatSkor: koma desimal Indonesia, empat desimal tetap', () => {
    expect(formatSkor(0.75)).toBe('0,7500');
    expect(formatSkor(1)).toBe('1,0000');
    expect(formatSkor(0)).toBe('0,0000');
  });

  it('barStyle: persen dari skor 0-1 lewat variabel --w, dipotong ke 0-100', () => {
    expect(barStyle(0.5)).toEqual({ '--w': '50%' });
    expect(barStyle(1.4)).toEqual({ '--w': '100%' });
    expect(barStyle(-0.2)).toEqual({ '--w': '0%' });
  });
});

describe('Halaman', () => {
  it('sebelum data siap: satu h1 judul + kerangka aria-busy, tanpa skor', () => {
    const html = render(<IndeksDesaPage />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(text(html)).toContain(T.title);
    expect(html).toContain('aria-busy="true"');
    expect(text(html)).not.toContain(T.skorIdmLabel);
  });

  it('kosong → ubin "belum tersedia", tanpa angka, kartu, atau tabel', () => {
    const html = render(<IndeksDesaContent state={{ status: 'ready', data: [] }} />);
    expect(text(html)).toContain(T.emptyTitle);
    expect(text(html)).toContain(T.emptyBody);
    expect(html).not.toContain('<table');
    expect(html).not.toContain('0,0000');
    expect(text(html)).not.toContain(T.dimensiTitle);
  });

  it('galat ≠ kosong: role alert + pesan galat', () => {
    const html = render(<IndeksDesaContent state={{ status: 'error' }} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.failed);
    expect(text(html)).not.toContain(T.emptyTitle);
  });
});

describe('Data ada', () => {
  const html = render(<IndeksDesaContent state={{ status: 'ready', data: [BARU, LAMA] }} />);
  const out = text(html);

  it('tahun terbaru (baris pertama): skor IDM, status, dan catatan', () => {
    expect(out).toContain(T.latestTitle(2031));
    expect(out).toContain('0,7500');
    expect(out).toContain('Maju');
    expect(out).toContain(`${T.catatanLabel}: Sumber uji`);
  });

  it('tiga kartu dimensi IKS, IKE, IKL dengan nama lengkap dan nilainya', () => {
    expect(out).toContain('Indeks Ketahanan Sosial');
    expect(out).toContain('Indeks Ketahanan Ekonomi');
    expect(out).toContain('Indeks Ketahanan Lingkungan');
    expect(html.match(/<li class="[^"]*card[^"]*"/g)).toHaveLength(3);
    for (const nilai of ['0,8000', '0,7000', '0,6500']) expect(out).toContain(nilai);
  });

  it('batang skor memakai variabel --w dan disembunyikan dari pembaca layar', () => {
    expect(html).toContain('--w:75%');
    expect(html).toContain('--w:80%');
    expect(html).toMatch(/aria-hidden="true"[^>]*><div[^>]*style="--w:80%/);
  });

  it('riwayat: tabel berketerangan, kolom ber-scope, satu baris per tahun (terbaru dulu)', () => {
    expect(html).toContain(`<caption class="`);
    expect(out).toContain(T.tableCaption);
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html.match(/<tr class="[^"]*row[^"]*"/g)).toHaveLength(2);
    expect(out.indexOf('2031')).toBeLessThan(out.lastIndexOf('2030'));
    expect(out).toContain('Berkembang');
    expect(out).toContain('0,5000');
  });

  it('catatan kosong tidak menampilkan label Catatan; hanya satu tahun tetap menampilkan riwayat', () => {
    const satu = text(render(<IndeksDesaContent state={{ status: 'ready', data: [LAMA] }} />));
    expect(satu).not.toContain(T.catatanLabel);
    expect(satu).toContain(T.riwayatTitle);
  });

  it('sel tabel berlabel untuk tata letak ponsel (data-label) dan tanpa h1 tambahan', () => {
    expect(html).toContain(`data-label="${T.colIdm}"`);
    expect(html).toContain('data-label="IKS"');
    expect(html).not.toContain('<h1');
  });
});
