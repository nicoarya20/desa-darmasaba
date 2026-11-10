// @vitest-environment node
// Publik DAK halaman program: judul sentence case + nomor, deskripsi duplikat, kartu folder (cuplikan, tanggal, Kosong), chip folder.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ProgramIsi } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramIsi';
import { cuplikanJudul, tanggalTerakhir } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/folder-kartu';
import {
  isDeskripsiDuplikat,
  judulProgram,
  teksPolos,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-judul';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import type { DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

// test-only fixture
const dok = (id: string, judul: string, createdAt = '2026-11-09T00:00:00.000Z'): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  createdAt,
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size: 1024 },
});

const NAMA = '1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PELAYANAN';
const now = new Date();
const detail: DesaAntiKorupsiDetail = {
  id: 'p1',
  name: NAMA,
  deskripsi: '<p>1.1 ADANYA PERDES/KEPUTUSAN KEPALA&nbsp;DESA/SOP  TENTANG PELAYANAN</p>',
  kategoriId: 'k1',
  kategori: { id: 'k1', name: 'PENGUATAN TATA LAKSANA', createdAt: now, updatedAt: now, deletedAt: now, isActive: true },
  createdAt: now,
  updatedAt: now,
  deletedAt: now,
  isActive: true,
  folders: [
    {
      id: 'fa',
      nama: 'Perdes',
      urutan: 0,
      dokumen: [
        dok('a1', 'Perdes No. 1', '2026-01-05T00:00:00.000Z'),
        dok('a2', 'Perdes No. 2', '2026-03-01T15:30:00.000Z'),
        dok('a3', 'Perdes No. 3', '2025-12-31T23:00:00.000Z'),
        dok('a4', 'Perdes No. 4', 'bukan-tanggal'),
      ],
    },
    { id: 'fb', nama: 'SK Kepala Desa', urutan: 1, dokumen: [] },
  ],
  dokumenUmum: [dok('u1', 'Pengumuman')],
};
const noop = () => undefined;
const isi = (folderParam: string | null, d: DesaAntiKorupsiDetail = detail) =>
  render(<ProgramIsi detail={d} folderParam={folderParam} urutParam={null} onUrutChange={noop} />);
/** Potongan markup satu kartu folder (dari data-folder-key ini sampai kartu berikutnya). */
const kartu = (html: string, key: string) =>
  new RegExp(`data-folder-key="${key}"[\\s\\S]*?(?=data-folder-key=|$)`).exec(html)?.[0] ?? '';

describe('judulProgram & deskripsi duplikat', () => {
  it('nomor dipisah, teks kapital jadi sentence case dengan singkatan dipertahankan', () => {
    expect(judulProgram(NAMA)).toEqual({
      nomor: '1.1',
      judul: 'Adanya Perdes/keputusan kepala desa/SOP tentang pelayanan',
      lengkap: '1.1 Adanya Perdes/keputusan kepala desa/SOP tentang pelayanan',
    });
    expect(judulProgram('Program Transparansi')).toEqual({ nomor: null, judul: 'Program Transparansi', lengkap: 'Program Transparansi' });
  });

  it('deskripsi = nama (abaikan HTML, entitas, spasi, kapital, nomor) → duplikat; isi berbeda / kosong → bukan', () => {
    expect(teksPolos('<p>Halo&nbsp;<b>desa</b></p>')).toBe('Halo desa');
    expect(isDeskripsiDuplikat(detail.deskripsi, NAMA)).toBe(true);
    expect(isDeskripsiDuplikat('<p>adanya perdes/keputusan kepala desa/sop tentang pelayanan.</p>', NAMA)).toBe(true);
    expect(isDeskripsiDuplikat('<p>Perdes ini mengatur jam pelayanan kantor desa.</p>', NAMA)).toBe(false);
    expect(isDeskripsiDuplikat('<p></p>', NAMA)).toBe(false);
    expect(isDeskripsiDuplikat(null, NAMA)).toBe(false);
  });
});

describe('ringkasan kartu folder', () => {
  it('cuplikanJudul: judul pertama sesuai urutan + sisa', () => {
    const dokumen = detail.folders[0].dokumen;
    expect(cuplikanJudul(dokumen)).toEqual({ judul: ['Perdes No. 1', 'Perdes No. 2'], sisa: 2 });
    expect(cuplikanJudul(dokumen, 3)).toEqual({ judul: ['Perdes No. 1', 'Perdes No. 2', 'Perdes No. 3'], sisa: 1 });
    expect(cuplikanJudul([])).toEqual({ judul: [], sisa: 0 });
  });

  it('tanggalTerakhir: createdAt terbaru (WITA), tanggal tak valid diabaikan; kosong → null', () => {
    // 15:30 UTC 1 Mar = 23:30 WITA 1 Mar
    expect(tanggalTerakhir(detail.folders[0].dokumen)).toBe('1 Mar 2026');
    expect(tanggalTerakhir([dok('x', 'x', 'bukan-tanggal')])).toBeNull();
    expect(tanggalTerakhir([])).toBeNull();
  });
});

describe('ProgramIsi tampilan', () => {
  it('header: badge nomor + judul sentence case; deskripsi duplikat tidak dirender; breadcrumb sentence case', () => {
    const html = isi(null);
    expect(html).toMatch(/data-testid="nomor-program"[\s\S]*?>1\.1</);
    expect(html).toMatch(/<h1[^>]*>Adanya Perdes\/keputusan kepala desa\/SOP tentang pelayanan<\/h1>/);
    expect(html).not.toContain('data-testid="deskripsi-program"');
    expect(html).not.toContain('ADANYA PERDES');
    expect(html).toContain('>Penguatan tata laksana<');
    expect(html).toContain('>1.1 Adanya Perdes/keputusan kepala desa/SOP tentang pelayanan<');
  });

  it('deskripsi yang berbeda dari nama tetap dirender', () => {
    const html = isi(null, { ...detail, deskripsi: '<p>Dasar hukum pelayanan publik desa</p>' });
    expect(html).toMatch(/data-testid="deskripsi-program"[^>]*><p>Dasar hukum pelayanan publik desa<\/p>/);
  });

  it('baris folder: meta, tanggal, cuplikan + sisa; folder kosong redup + badge Kosong, tetap tautan', () => {
    const html = isi(null);
    const fa = kartu(html, 'fa');
    expect(fa).toContain('data-kosong="false"');
    expect(fa).toMatch(/data-testid="jumlah-dokumen-folder"[^>]*>4 dokumen</);
    expect(fa).toMatch(/data-testid="tanggal-folder"[\s\S]*?Diperbarui 1 Mar 2026/);
    expect(fa).toMatch(/data-testid="cuplikan-folder"[^>]*>Perdes No\. 1 · Perdes No\. 2/);
    expect(fa).toMatch(/data-testid="cuplikan-sisa"[^>]*>\+2 lainnya</);
    expect(fa).not.toContain('badge-kosong');

    const fb = kartu(html, 'fb');
    expect(fb).toContain('data-kosong="true"');
    expect(fb).toMatch(/data-testid="badge-kosong"[\s\S]*?>Kosong</);
    expect(fb).not.toContain('data-testid="cuplikan-folder"');
    expect(fb).not.toContain('data-testid="tanggal-folder"');
    expect(html).toMatch(/data-folder-key="fb"[^>]*href="\/darmasaba\/desa-anti-korupsi\/program\/p1\?folder=fb"/);
    expect(kartu(html, 'umum')).not.toContain('cuplikan-sisa');
  });

  it('folder aktif: chip semua folder dengan href benar, chip aktif ter-highlight', () => {
    const html = render(<ProgramIsi detail={detail} folderParam="fb" urutParam="judul-asc" onUrutChange={noop} />);
    const chips = [...html.matchAll(/<a[^>]*data-folder-chip="([^"]+)"[^>]*>/g)];
    expect(chips.map((m) => m[1])).toEqual(['fa', 'fb', 'umum']);
    const chip = (key: string) => chips.find((m) => m[1] === key)?.[0] ?? '';
    expect(chip('fa')).toContain('href="/darmasaba/desa-anti-korupsi/program/p1?folder=fa&amp;urut=judul-asc"');
    expect(chip('umum')).toContain('href="/darmasaba/desa-anti-korupsi/program/p1?folder=umum&amp;urut=judul-asc"');
    expect(chip('fb')).toContain('aria-current="page"');
    expect(chip('fb')).toContain('data-active="true"');
    expect(chip('fa')).toContain('data-active="false"');
    expect(chip('fa')).not.toContain('aria-current');
  });

  it('folder kosong: tanpa tombol ZIP folder, empty state dengan subteks + aksi Kembali ke daftar folder', () => {
    const html = isi('fb');
    expect(html).not.toContain('data-zip-folder="fb"');
    expect(html).toContain('data-zip-folder="semua"');
    expect(html).toMatch(/data-testid="empty-state"[\s\S]*Folder ini belum berisi dokumen[\s\S]*Dokumen akan tampil di sini/);
    expect(html).toMatch(/data-testid="empty-state"[\s\S]*href="\/darmasaba\/desa-anti-korupsi\/program\/p1"[^>]*>[\s\S]*?Kembali</);
    expect(html).not.toContain('Semua folder');
    expect(isi('fa')).toContain('data-zip-folder="fa"');
  });
});
