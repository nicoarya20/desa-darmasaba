// @vitest-environment node
// Publik DAK: kartu program ringkas (tanpa daftar dokumen) + halaman program (grid folder, ?folder, Umum).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ProgramFolderCard } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramFolderCard';
import { ProgramIsi } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramIsi';
import {
  programHref,
  resolveActiveFolder,
  ringkasanIsi,
  searchDokumen,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-folder';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const dok = (id: string, judul: string, mimeType = 'application/pdf'): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  createdAt: '2026-11-09T00:00:00.000Z',
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType, size: 1024 },
});

const now = new Date();
const detail: DesaAntiKorupsiDetail = {
  id: 'p1',
  name: 'Program Transparansi Anggaran',
  deskripsi: '<p>Deskripsi program</p>',
  kategoriId: 'k1',
  kategori: { id: 'k1', name: 'PENGUATAN PENGAWASAN', createdAt: now, updatedAt: now, deletedAt: now, isActive: true },
  createdAt: now,
  updatedAt: now,
  deletedAt: now,
  isActive: true,
  folders: [
    { id: 'fa', nama: 'Laporan Keuangan', urutan: 0, dokumen: [dok('a1', 'APBDes 2025'), dok('a2', 'Realisasi', 'application/gzip')] },
    { id: 'fb', nama: 'Kosong', urutan: 1, dokumen: [] },
  ],
  dokumenUmum: [dok('u1', 'Pengumuman APBDes')],
};

describe('ProgramFolderCard', () => {
  it('menampilkan judul (title penuh), kategori, "N folder · M dokumen", dan tombol Buka ke halaman program', () => {
    const html = render(
      <ProgramFolderCard id="p1" name="Program Transparansi" kategori="PENGUATAN PENGAWASAN" jumlahFolder={2} jumlahDokumen={5} />,
    );
    expect(html).toContain('title="Program Transparansi"');
    expect(html).toContain('PENGUATAN PENGAWASAN');
    expect(html).toContain('2 folder · 5 dokumen');
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi/program/p1"');
    expect(html).toContain('>Buka<');
  });

  it('tidak merender daftar dokumen; 0 folder → hanya "M dokumen"', () => {
    const html = render(<ProgramFolderCard id="p1" name="P" jumlahFolder={0} jumlahDokumen={3} />);
    expect(html).not.toContain('data-dokumen-id');
    expect(html).not.toContain('folder ·');
    expect(html).toMatch(/data-testid="ringkasan-isi"[^>]*>3 dokumen</);
  });

  it('halaman detail memberi kartu ringkasan jumlah, bukan daftar dokumen', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../src/app/darmasaba/(tambahan)/desa-anti-korupsi/detail/page.tsx'),
      'utf8',
    );
    expect(src).toContain('jumlahFolder={item.jumlahFolder}');
    expect(src).toContain('jumlahDokumen={item.jumlahDokumen}');
    expect(src).not.toContain('item.dokumen');
    expect(src).not.toContain('DokumenPreviewModal');
  });
});

describe('program-folder helpers', () => {
  it('programHref & ringkasanIsi', () => {
    expect(programHref('p 1')).toBe('/darmasaba/desa-anti-korupsi/program/p%201');
    expect(programHref('p1', 'umum')).toBe('/darmasaba/desa-anti-korupsi/program/p1?folder=umum');
    expect(ringkasanIsi(1, 0)).toBe('1 folder · 0 dokumen');
    expect(ringkasanIsi(0, 0)).toBe('0 dokumen');
  });

  it('folderGroups: Umum di akhir hanya bila ada dokumen tanpa folder; resolveActiveFolder dari ?folder', () => {
    const groups = folderGroups(detail);
    expect(groups.map((g) => g.key)).toEqual(['fa', 'fb', 'umum']);
    expect(folderGroups({ ...detail, dokumenUmum: [] }).map((g) => g.key)).toEqual(['fa', 'fb']);
    expect(resolveActiveFolder('umum', groups)?.nama).toBe('Umum');
    expect(resolveActiveFolder('fb', groups)?.nama).toBe('Kosong');
    expect(resolveActiveFolder('tidak-ada', groups)).toBeNull();
    expect(resolveActiveFolder(null, groups)).toBeNull();
  });

  it('searchDokumen mencari judul lintas folder tanpa beda kapital', () => {
    const res = searchDokumen(folderGroups(detail), '  apbdes ');
    expect(res.map((r) => [r.folder.nama, r.dokumen.id])).toEqual([
      ['Laporan Keuangan', 'a1'],
      ['Umum', 'u1'],
    ]);
    expect(searchDokumen(folderGroups(detail), '   ')).toEqual([]);
  });
});

describe('ProgramIsi (halaman /darmasaba/desa-anti-korupsi/program/[id])', () => {
  it('tanpa ?folder → grid folder termasuk Umum, dengan jumlah dokumen per folder', () => {
    const html = render(<ProgramIsi detail={detail} folderParam={null} />);
    expect([...html.matchAll(/data-folder-key="([^"]+)"/g)].map((m) => m[1])).toEqual(['fa', 'fb', 'umum']);
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi/program/p1?folder=umum"');
    expect([...html.matchAll(/data-testid="jumlah-dokumen-folder"[^>]*>(\d+) dokumen</g)].map((m) => m[1])).toEqual(['2', '0', '1']);
    expect(html).not.toContain('data-dokumen-id');
    expect(html).toContain('Program Transparansi Anggaran');
    expect(html).toContain('Deskripsi program');
  });

  it('kembali & breadcrumb menuju detail?kategori=<kategori program>', () => {
    const html = render(<ProgramIsi detail={detail} folderParam="fa" />);
    expect(html.match(/href="\/darmasaba\/desa-anti-korupsi\/detail\?kategori=PENGUATAN%20PENGAWASAN"/g)?.length).toBe(2);
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi"');
    // folder aktif = crumb terakhir; nama program jadi tautan kembali ke grid folder
    expect(html).toMatch(/aria-current="page"[^>]*>Laporan Keuangan</);
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi/program/p1"');
  });

  it('?folder=<id> → daftar dokumen folder itu saja, dengan Pratinjau khusus PDF & Unduh', () => {
    const html = render(<ProgramIsi detail={detail} folderParam="fa" />);
    expect(html).toMatch(/data-testid="folder-aktif"[^>]*>Laporan Keuangan</);
    expect([...html.matchAll(/data-dokumen-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['a1', 'a2']);
    expect(html).toContain('aria-label="Pratinjau APBDes 2025"');
    expect(html).not.toContain('aria-label="Pratinjau Realisasi"');
    expect(html).toContain('aria-label="Unduh Realisasi"');
    expect(html).not.toContain('data-folder-key');
  });

  it('?folder=umum → dokumen tanpa folder; folder kosong & program kosong → empty state', () => {
    const umum = render(<ProgramIsi detail={detail} folderParam="umum" />);
    expect([...umum.matchAll(/data-dokumen-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['u1']);
    expect(render(<ProgramIsi detail={detail} folderParam="fb" />)).toContain('Folder ini belum berisi dokumen');
    const kosong = render(<ProgramIsi detail={{ ...detail, folders: [], dokumenUmum: [] }} folderParam={null} />);
    expect(kosong).toContain('Belum ada dokumen pada program ini');
    expect(kosong).not.toContain('Cari judul dokumen');
  });
});
