// @vitest-environment node
// Parser CSV generik (src/lib/csv/parse-csv.ts): BOM, pemisah ,/;, kutip RFC 4180, CRLF, baris kosong,
// ukuran, kutip tak tertutup, dan helper header. Semua data di bawah rekaan (test-only).
import { describe, expect, it } from 'vitest';
import { bacaTabelCsv, barisKosong, cariKolom, CSV_MAKS_BYTES, hitungKolom, normalHeader, parseCsv } from '@/lib/csv/parse-csv';

describe('parseCsv', () => {
  it('pemisah koma dan titik koma terdeteksi dari baris pertama', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
    expect(parseCsv('a;b\n1;2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('kutip berisi koma, pemisah, baris baru, dan "" (kutip ganda)', () => {
    expect(parseCsv('a,b\n"x,1","y\nz"\n"q""r",s')).toEqual([['a', 'b'], ['x,1', 'y\nz'], ['q"r', 's']]);
  });

  it('BOM dibuang, CRLF dan CR tunggal jadi pemisah baris', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n3,4')).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
    expect(parseCsv('a,b\r1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('jumlah sel per baris boleh berbeda tanpa crash', () => {
    expect(parseCsv('a,b,c\n1\n1,2,3,4')).toEqual([['a', 'b', 'c'], ['1'], ['1', '2', '3', '4']]);
  });
});

describe('bacaTabelCsv', () => {
  it('header dinormalkan, baris kosong dilewati diam-diam, nomor baris = nomor di berkas', () => {
    const t = bacaTabelCsv('NAMA_UMKM,No. HP\r\n\r\nA,1\n , \nB,2\n');
    expect(t.galat).toBeNull();
    expect(t.headers).toEqual(['nama umkm', 'no hp']);
    expect(t.data).toEqual([
      { baris: 3, cells: ['A', '1'] },
      { baris: 5, cells: ['B', '2'] },
    ]);
  });

  it('berkas kosong / hanya spasi → galat', () => {
    expect(bacaTabelCsv('').galat).toBe('Berkas CSV kosong');
    expect(bacaTabelCsv('﻿\n\n').galat).toBe('Berkas CSV kosong');
    expect(bacaTabelCsv(' , \n1,2').galat).toBe('Berkas CSV kosong');
  });

  it('melebihi batas byte (dihitung dalam byte UTF-8, bukan karakter) → galat ukuran', () => {
    expect(bacaTabelCsv(`a\n${'x'.repeat(100)}`, 50).galat).toMatch(/Ukuran berkas maksimal/);
    // "é" = 2 byte: 30 karakter = 60 byte > 50
    expect(bacaTabelCsv(`a\n${'é'.repeat(30)}`, 50).galat).toMatch(/Ukuran berkas maksimal/);
    expect(bacaTabelCsv('a\n1').galat).toBeNull();
    expect(CSV_MAKS_BYTES).toBe(2 * 1024 * 1024);
  });

  it('tanda kutip tak tertutup → galat (bukan menelan sisa berkas)', () => {
    expect(bacaTabelCsv('a,b\n"x,1\n2,3').galat).toMatch(/kutip/);
  });
});

describe('helper header', () => {
  it('normalHeader, cariKolom (prioritas alias), hitungKolom, barisKosong', () => {
    expect(normalHeader(' NAMA_PENERIMA ')).toBe('nama penerima');
    expect(cariKolom(['x', 'nama umkm', 'nama'], ['nama', 'nama umkm'])).toBe(2);
    expect(cariKolom(['x'], ['nama'])).toBe(-1);
    expect(hitungKolom(['nama', 'nama umkm', 'x', 'nama'], ['nama', 'nama umkm'])).toBe(3);
    expect(barisKosong(['', ' '])).toBe(true);
    expect(barisKosong(['', 'a'])).toBe(false);
  });
});
