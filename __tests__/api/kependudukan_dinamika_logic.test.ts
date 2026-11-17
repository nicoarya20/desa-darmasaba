// @vitest-environment node
// Dinamika Penduduk (Dashboard Kependudukan): parser baris API, neraca bertambah/berkurang, tahun berjalan.
import { describe, expect, it } from 'vitest';
import {
  dinamikaNeraca,
  isTahunBerjalan,
  parseDinamikaRow,
  parseDinamikaRows,
  ringkasDinamika,
} from '@/app/(public)/(pages)/kependudukan/_com/dinamika/dinamika.logic';

// test-only: bentuk respons stg 2026-11-17 (`/api/kependudukan/dinamikapenduduk/find-many`, urut tahun menurun).
const STG = [
  { id: 'cmk-dinamika-001', tahun: 2026, kelahiran: 45, kematian: 18, masuk: 22, keluar: 15 },
  { id: 'cmk-dinamika-002', tahun: 2025, kelahiran: 52, kematian: 21, masuk: 18, keluar: 12 },
  { id: 'cmk-dinamika-003', tahun: 2024, kelahiran: 48, kematian: 19, masuk: 25, keluar: 20 },
];

describe('parseDinamikaRow', () => {
  it('baris valid diteruskan apa adanya', () => {
    expect(parseDinamikaRow(STG[0])).toEqual(STG[0]);
  });

  it('jumlah string bertitik ribuan diterima, tahun string angka diterima', () => {
    expect(parseDinamikaRow({ id: 'a', tahun: '2023', kelahiran: '1.204', kematian: 3, masuk: '0', keluar: 7 })).toEqual({
      id: 'a',
      tahun: 2023,
      kelahiran: 1204,
      kematian: 3,
      masuk: 0,
      keluar: 7,
    });
  });

  it.each([
    ['bukan objek', null],
    ['tanpa id', { tahun: 2025, kelahiran: 1, kematian: 1, masuk: 1, keluar: 1 }],
    ['id kosong', { id: '', tahun: 2025, kelahiran: 1, kematian: 1, masuk: 1, keluar: 1 }],
    ['tahun di luar batas', { id: 'x', tahun: 1999, kelahiran: 1, kematian: 1, masuk: 1, keluar: 1 }],
    ['tahun pecahan', { id: 'x', tahun: 2025.5, kelahiran: 1, kematian: 1, masuk: 1, keluar: 1 }],
    ['jumlah negatif', { id: 'x', tahun: 2025, kelahiran: -1, kematian: 1, masuk: 1, keluar: 1 }],
    ['jumlah kosong', { id: 'x', tahun: 2025, kelahiran: 1, kematian: null, masuk: 1, keluar: 1 }],
    ['jumlah teks', { id: 'x', tahun: 2025, kelahiran: 1, kematian: 1, masuk: '12 orang', keluar: 1 }],
  ])('%s → null', (_, value) => {
    expect(parseDinamikaRow(value)).toBeNull();
  });
});

describe('parseDinamikaRows', () => {
  it('urut tahun terbaru dulu meski masukan naik, baris rusak dibuang', () => {
    const rows = parseDinamikaRows([STG[2], { id: 'rusak' }, STG[0], STG[1]]);
    expect(rows.map((r) => r.tahun)).toEqual([2026, 2025, 2024]);
  });

  it('tahun ganda → baris pertama yang dipakai', () => {
    const rows = parseDinamikaRows([STG[0], { ...STG[0], id: 'dobel', kelahiran: 999 }]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('cmk-dinamika-001');
  });

  it('kosong → []', () => {
    expect(parseDinamikaRows([])).toEqual([]);
  });
});

describe('dinamikaNeraca', () => {
  it('stg 2026: bertambah 45+22=67, berkurang 18+15=33, bersih +34', () => {
    expect(dinamikaNeraca(STG[0])).toEqual({ bertambah: 67, berkurang: 33, bersih: 34 });
  });

  it('bersih bisa negatif', () => {
    expect(dinamikaNeraca({ id: 'n', tahun: 2020, kelahiran: 5, kematian: 20, masuk: 3, keluar: 10 })).toEqual({
      bertambah: 8,
      berkurang: 30,
      bersih: -22,
    });
  });
});

describe('ringkasDinamika', () => {
  it('pecahan alami/migrasi + lebar batang relatif ke arus terbesar', () => {
    const r = ringkasDinamika(STG[0]);
    expect(r.pertumbuhanAlami).toBe(27);
    expect(r.migrasiBersih).toBe(7);
    expect(r.lebar.bertambah).toBe(100);
    expect(r.lebar.berkurang).toBeCloseTo((33 / 67) * 100, 5);
    expect(r.row).toBe(STG[0]);
  });

  it('semua 0 → lebar 0 (tanpa bagi nol)', () => {
    const r = ringkasDinamika({ id: 'z', tahun: 2021, kelahiran: 0, kematian: 0, masuk: 0, keluar: 0 });
    expect(r.lebar).toEqual({ bertambah: 0, berkurang: 0 });
    expect(r.bersih).toBe(0);
  });
});

describe('isTahunBerjalan', () => {
  it('sama dengan tahun kalender → true, tahun lalu → false', () => {
    const now = new Date(2026, 10, 17);
    expect(isTahunBerjalan(2026, now)).toBe(true);
    expect(isTahunBerjalan(2025, now)).toBe(false);
  });
});
