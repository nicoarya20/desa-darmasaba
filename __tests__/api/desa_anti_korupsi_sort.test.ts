// @vitest-environment node
// Helper murni urut/cari/format ukuran dokumen DAK (dipakai UI publik & admin).
import { describe, expect, it } from 'vitest';
import { filterDokumen, formatUkuran, sortDokumen } from '@/lib/desa-anti-korupsi-sort';

type D = { judul: string; urutan: number; createdAt?: string; file?: { realName?: string; mimeType?: string; size?: number | null } | null };
const d = (judul: string, urutan: number, over: Partial<D> = {}): D => ({ judul, urutan, ...over });
const judul = (list: D[]) => list.map((x) => x.judul);

describe('sortDokumen', () => {
  it('judul memakai urutan alami bahasa Indonesia (angka numerik, tanpa beda kapital)', () => {
    const list = [d('Laporan 10', 0), d('laporan 2', 1), d('Anggaran', 2), d('Laporan 1', 3)];
    expect(judul(sortDokumen(list, 'judul', 'asc'))).toEqual(['Anggaran', 'Laporan 1', 'laporan 2', 'Laporan 10']);
    expect(judul(sortDokumen(list, 'judul', 'desc'))).toEqual(['Laporan 10', 'laporan 2', 'Laporan 1', 'Anggaran']);
  });

  it('stabil: nilai sama mempertahankan urutan asal, dan input tidak diubah', () => {
    const list = [d('B', 1), d('A', 0), d('C', 1), d('D', 0)];
    const copy = [...list];
    expect(judul(sortDokumen(list, 'urutan', 'asc'))).toEqual(['A', 'D', 'B', 'C']);
    expect(judul(sortDokumen(list, 'urutan', 'desc'))).toEqual(['B', 'C', 'A', 'D']);
    expect(list).toEqual(copy);
  });

  it('ukuran null selalu di akhir untuk asc maupun desc', () => {
    const list = [d('null1', 0, { file: { size: null } }), d('besar', 1, { file: { size: 500 } }), d('kecil', 2, { file: { size: 5 } }), d('tanpa file', 3, { file: null })];
    expect(judul(sortDokumen(list, 'ukuran', 'asc'))).toEqual(['kecil', 'besar', 'null1', 'tanpa file']);
    expect(judul(sortDokumen(list, 'ukuran', 'desc'))).toEqual(['besar', 'kecil', 'null1', 'tanpa file']);
  });

  it('tanggal dari createdAt ISO; tipe dari ekstensi realName lalu mimeType', () => {
    const list = [
      d('lama', 0, { createdAt: '2025-01-01T00:00:00.000Z', file: { realName: 'a.pdf' } }),
      d('baru', 1, { createdAt: '2026-11-09T00:00:00.000Z', file: { realName: 'b.docx' } }),
      d('tengah', 2, { createdAt: '2026-01-01T00:00:00.000Z', file: { realName: 'tanpa-ekstensi', mimeType: 'application/zip' } }),
    ];
    expect(judul(sortDokumen(list, 'tanggal', 'desc'))).toEqual(['baru', 'tengah', 'lama']);
    expect(judul(sortDokumen(list, 'tipe', 'asc'))).toEqual(['baru', 'lama', 'tengah']); // DOCX < PDF < ZIP
  });
});

describe('filterDokumen', () => {
  const list = [d('Laporan Keuangan', 0, { file: { realName: 'apbdes-2025.pdf' } }), d('Perdes', 1, { file: null }), d('SK Kades', 2, { file: { realName: 'SK.PDF' } })];

  it('cocok di judul atau nama berkas, tanpa beda kapital & spasi tepi', () => {
    expect(judul(filterDokumen(list, '  keuangan '))).toEqual(['Laporan Keuangan']);
    expect(judul(filterDokumen(list, 'APBDES'))).toEqual(['Laporan Keuangan']);
    expect(judul(filterDokumen(list, '.pdf'))).toEqual(['Laporan Keuangan', 'SK Kades']);
  });

  it('kueri kosong mengembalikan salinan seluruh daftar', () => {
    const res = filterDokumen(list, '   ');
    expect(res).toEqual(list);
    expect(res).not.toBe(list);
  });
});

describe('formatUkuran', () => {
  it.each([
    [null, '—'],
    [undefined, '—'],
    [-1, '—'],
    [512, '512 B'],
    [12 * 1024, '12 KB'],
    [3.4 * 1024 * 1024, '3,4 MB'],
    [1024 * 1024, '1 MB'],
    [1023.9 * 1024, '1 MB'],
    [2.5 * 1024 * 1024 * 1024, '2,5 GB'],
  ])('%s → %s', (bytes, expected) => {
    expect(formatUkuran(bytes)).toBe(expected);
  });
});
