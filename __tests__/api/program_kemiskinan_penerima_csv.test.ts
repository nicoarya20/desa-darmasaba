// @vitest-environment node
// Impor CSV penerima Program Kemiskinan: hanya nama + alamat yang diambil (kolom lain dibuang), baris
// tanpa nama/alamat ditolak, header alias BNBA, pemisah ";" dan kutip; plus aturan validasi bersama
// dan rekap per alamat/tahun. Semua data di bawah rekaan (test-only).
import { describe, expect, it } from 'vitest';
import { parseCsv, parseCsvPenerima } from '@/lib/program-kemiskinan/penerima-csv';
import { jumlahPerTahun, rekapPerAlamat } from '@/lib/program-kemiskinan/penerima-rekap';
import {
  ALAMAT_MAKS,
  IMPOR_MAKS_BARIS,
  NAMA_MAKS,
  validasiPenerima,
  validasiTahun,
} from '@/lib/program-kemiskinan/penerima.rules';

describe('parseCsvPenerima', () => {
  it('hanya mengambil nama & alamat; NIK, tanggal lahir, KK tidak ikut di hasil', () => {
    // test-only: data rekaan
    const csv = 'NO,NIK,NAMA,TGL_LAHIR,NO_KK,ALAMAT,PEKERJAAN\n1,5103000000000001,Warga Satu,1990-01-01,5103000000000009,Br. Contoh,Petani\n';
    const r = parseCsvPenerima(csv);
    expect(r.galat).toBeNull();
    expect(r.rows).toEqual([{ nama: 'Warga Satu', alamat: 'Br. Contoh', baris: 2 }]);
    expect(Object.keys(r.rows[0]).sort()).toEqual(['alamat', 'baris', 'nama']);
    expect(JSON.stringify(r)).not.toContain('5103000000000001');
    expect(JSON.stringify(r)).not.toContain('1990-01-01');
  });

  it('menolak baris tanpa nama atau tanpa alamat, melewati baris kosong', () => {
    // test-only
    const csv = 'nama,alamat\nWarga A,Br. Satu\n,Br. Dua\n\nWarga C,\n  ,  \nWarga D,Br. Empat';
    const r = parseCsvPenerima(csv);
    expect(r.rows.map((x) => x.nama)).toEqual(['Warga A', 'Warga D']);
    expect(r.ditolak).toEqual([
      { baris: 3, alasan: 'Nama wajib diisi' },
      { baris: 5, alasan: 'Alamat wajib diisi' },
    ]);
  });

  it('alias header BNBA (NAMA_PENERIMA, NAMA KEPALA KELUARGA) dan kolom KEL_NAME tidak dikira nama', () => {
    // test-only
    const a = parseCsvPenerima('NO,KEL_NAME,NAMA_PENERIMA,ALAMAT\n1,Darmasaba,Warga B,Br. Dua');
    expect(a.rows).toEqual([{ nama: 'Warga B', alamat: 'Br. Dua', baris: 2 }]);
    const b = parseCsvPenerima('NAMA KEPALA KELUARGA;ANGGOTA;ALAMAT\nWarga K;3;Br. Tiga');
    expect(b.rows).toEqual([{ nama: 'Warga K', alamat: 'Br. Tiga', baris: 2 }]);
  });

  it('header tanpa kolom nama/alamat → galat berkas, tanpa baris', () => {
    const r = parseCsvPenerima('no,nik\n1,123');
    expect(r.galat).toMatch(/nama.*alamat/);
    expect(r.rows).toEqual([]);
    expect(parseCsvPenerima('').galat).toBe('Berkas CSV kosong');
  });

  it('pemisah ";", kutip ganda berisi koma/baris baru, BOM & CRLF, spasi dirapikan', () => {
    // test-only
    const csv = '﻿nama;alamat\r\n"Warga ""E""";"Br. Lima, Gang 2\nBlok A"\r\n  Warga   F ;Br.  Enam\r\n';
    const r = parseCsvPenerima(csv);
    expect(r.rows).toEqual([
      { nama: 'Warga "E"', alamat: 'Br. Lima, Gang 2 Blok A', baris: 2 },
      { nama: 'Warga F', alamat: 'Br. Enam', baris: 3 },
    ]);
    expect(parseCsv('a,"b,c"\n1,2')).toEqual([['a', 'b,c'], ['1', '2']]);
  });

  it(`lebih dari ${IMPOR_MAKS_BARIS} baris valid → galat ukuran`, () => {
    const isi = Array.from({ length: IMPOR_MAKS_BARIS + 1 }, (_, i) => `Warga ${i},Br. X`).join('\n');
    const r = parseCsvPenerima(`nama,alamat\n${isi}`);
    expect(r.galat).toMatch(String(IMPOR_MAKS_BARIS));
    expect(r.rows).toEqual([]);
  });
});

describe('aturan validasi', () => {
  it('nama/alamat wajib, dirapikan, dan dibatasi panjangnya', () => {
    expect(validasiPenerima({ nama: '  A  B ', alamat: ' Br.\tC ' })).toEqual({ ok: true, value: { nama: 'A B', alamat: 'Br. C' } });
    expect(validasiPenerima({ nama: 'x'.repeat(NAMA_MAKS + 1), alamat: 'a' }).ok).toBe(false);
    expect(validasiPenerima({ nama: 'n', alamat: 'a'.repeat(ALAMAT_MAKS + 1) }).ok).toBe(false);
    expect(validasiPenerima({ nama: 12, alamat: 'a' })).toEqual({ ok: false, alasan: 'Nama wajib diisi' });
  });

  it('tahun bulat 2000..tahun depan; string angka diterima', () => {
    const now = new Date('2026-11-16T00:00:00Z');
    expect(validasiTahun('2025', now)).toEqual({ ok: true, value: 2025 });
    expect(validasiTahun(2027, now)).toEqual({ ok: true, value: 2027 });
    expect(validasiTahun(2028, now).ok).toBe(false);
    expect(validasiTahun(1999, now).ok).toBe(false);
    expect(validasiTahun('20a5', now).ok).toBe(false);
    expect(validasiTahun(2025.5, now).ok).toBe(false);
    expect(validasiTahun('', now).ok).toBe(false);
  });
});

describe('rekap', () => {
  it('per alamat: terbanyak dulu (seri abjad), dipotong ke batas, sisa → lainnya', () => {
    const grup = [
      { alamat: 'Br. B', _count: { _all: 3 } },
      { alamat: 'Br. A', _count: { _all: 3 } },
      { alamat: 'Br. C', _count: { _all: 5 } },
      { alamat: 'Br. D', _count: { _all: 1 } },
    ];
    expect(rekapPerAlamat(grup, 3)).toEqual({
      data: [
        { alamat: 'Br. C', jumlah: 5 },
        { alamat: 'Br. A', jumlah: 3 },
        { alamat: 'Br. B', jumlah: 3 },
      ],
      lainnya: 1,
      total: 12,
    });
    expect(rekapPerAlamat([])).toEqual({ data: [], lainnya: 0, total: 0 });
  });

  it('per tahun: terbaru dulu, tahun tanpa penerima dibuang', () => {
    const grup = [
      { tahun: 2025, _count: { _all: 4 } },
      { tahun: 2026, _count: { _all: 2 } },
      { tahun: 2024, _count: { _all: 0 } },
    ];
    expect(jumlahPerTahun(grup)).toEqual([
      { tahun: 2026, jumlah: 2 },
      { tahun: 2025, jumlah: 4 },
    ]);
  });
});
