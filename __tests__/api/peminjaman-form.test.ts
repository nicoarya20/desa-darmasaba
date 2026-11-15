// @vitest-environment node
// Formulir pinjam buku Perpustakaan Digital (fungsi murni): validasi isian, tanggal kalender zona desa,
// escape catatan, dan payload POST (tanpa tanggalKembali, tanggal stabil 12.00 WITA).
import { describe, expect, it } from 'vitest';
import {
  AMBIL_MAKS_HARI,
  CATATAN_MAX,
  EMPTY_PEMINJAMAN,
  LAMA_PINJAM_HARI,
  NAMA_MAX,
  catatanKeHtml,
  formatTanggal,
  hariIniDesa,
  isPeminjamanFormValid,
  peminjamanErrors,
  richTextLength,
  tambahHari,
  tanggalKeIso,
  toPeminjamanPayload,
  type PeminjamanValues,
} from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/peminjamanForm';

const HARI_INI = '2026-11-15'; // test-only

// test-only: isian valid.
const valid = (over: Partial<PeminjamanValues> = {}): PeminjamanValues => ({
  nama: 'Budi Santoso',
  telp: '81234567890',
  alamat: 'Banjar Tengah, Darmasaba',
  tanggalAmbil: '2026-11-16',
  catatan: '',
  ...over,
});

describe('peminjamanErrors / isPeminjamanFormValid', () => {
  it('isian lengkap valid; catatan opsional', () => {
    expect(peminjamanErrors(valid(), HARI_INI)).toEqual({});
    expect(isPeminjamanFormValid(valid(), HARI_INI)).toBe(true);
  });

  it('formulir kosong: semua isian wajib bergalat, catatan tidak', () => {
    const errors = peminjamanErrors(EMPTY_PEMINJAMAN, HARI_INI);
    expect(Object.keys(errors).sort()).toEqual(['alamat', 'nama', 'tanggalAmbil', 'telp']);
    expect(isPeminjamanFormValid(EMPTY_PEMINJAMAN, HARI_INI)).toBe(false);
  });

  it('nama dan alamat dihitung setelah dipangkas, dengan batas atas', () => {
    expect(peminjamanErrors(valid({ nama: '  ab  ' }), HARI_INI).nama).toBe('Nama minimal 3 karakter.');
    expect(peminjamanErrors(valid({ nama: 'a'.repeat(NAMA_MAX + 1) }), HARI_INI).nama).toBe(
      `Nama maksimal ${NAMA_MAX} karakter.`,
    );
    expect(peminjamanErrors(valid({ alamat: ' Jl. ' }), HARI_INI).alamat).toBe('Alamat minimal 5 karakter.');
  });

  it('telepon 9–12 digit setelah +62', () => {
    expect(peminjamanErrors(valid({ telp: '81234567' }), HARI_INI).telp).toMatch(/10–13 digit/);
    expect(peminjamanErrors(valid({ telp: '812345678' }), HARI_INI).telp).toBeUndefined();
    expect(peminjamanErrors(valid({ telp: '812345678901' }), HARI_INI).telp).toBeUndefined();
  });

  it(`tanggal ambil hari ini s.d. +${AMBIL_MAKS_HARI} hari, selain itu galat`, () => {
    expect(peminjamanErrors(valid({ tanggalAmbil: HARI_INI }), HARI_INI).tanggalAmbil).toBeUndefined();
    expect(peminjamanErrors(valid({ tanggalAmbil: '2026-11-29' }), HARI_INI).tanggalAmbil).toBeUndefined();
    expect(peminjamanErrors(valid({ tanggalAmbil: '2026-11-30' }), HARI_INI).tanggalAmbil).toMatch(/14 hari/);
    expect(peminjamanErrors(valid({ tanggalAmbil: '2026-11-14' }), HARI_INI).tanggalAmbil).toMatch(/hari ini/);
    expect(peminjamanErrors(valid({ tanggalAmbil: '16/11/2026' }), HARI_INI).tanggalAmbil).toBe(
      'Pilih tanggal ambil buku.',
    );
  });

  it(`catatan maksimal ${CATATAN_MAX} karakter`, () => {
    expect(peminjamanErrors(valid({ catatan: 'a'.repeat(CATATAN_MAX) }), HARI_INI).catatan).toBeUndefined();
    expect(peminjamanErrors(valid({ catatan: 'a'.repeat(CATATAN_MAX + 1) }), HARI_INI).catatan).toBe(
      `Catatan maksimal ${CATATAN_MAX} karakter.`,
    );
  });
});

describe('tanggal kalender', () => {
  it('hari ini dihitung di WITA, bukan zona perangkat', () => {
    // 15 Nov 16.30Z = 16 Nov 00.30 WITA.
    expect(hariIniDesa(new Date('2026-11-15T16:30:00.000Z'))).toBe('2026-11-16');
    expect(hariIniDesa(new Date('2026-11-15T15:59:00.000Z'))).toBe('2026-11-15');
  });

  it('tambahHari melewati akhir bulan/tahun', () => {
    expect(tambahHari('2026-11-28', 4)).toBe('2026-12-02');
    expect(tambahHari('2026-12-30', 4)).toBe('2027-01-03');
  });

  it('formatTanggal bahasa Indonesia lengkap dengan hari', () => {
    expect(formatTanggal('2026-11-20')).toBe('Jumat, 20 November 2026');
  });

  it('tanggalKeIso = 12.00 WITA, tetap tanggal yang sama di WIB dan WIT', () => {
    const iso = tanggalKeIso('2026-11-16');
    expect(iso).toBe('2026-11-16T04:00:00.000Z');
    for (const timeZone of ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'UTC']) {
      expect(new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso))).toBe('2026-11-16');
    }
  });
});

describe('catatanKeHtml', () => {
  it('teks warga di-escape (tidak jadi tag), baris baru → <br>', () => {
    expect(catatanKeHtml(' <img src=x onerror=alert(1)> & "a"\n\'b\' ')).toBe(
      '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;a&quot;<br>&#39;b&#39;',
    );
  });

  it('kosong/spasi saja → ""', () => {
    expect(catatanKeHtml('   ')).toBe('');
  });
});

describe('toPeminjamanPayload', () => {
  it('isian dipangkas, telepon +62, tanggal stabil, batas kembali = ambil + lama pinjam, tanpa tanggalKembali', () => {
    const payload = toPeminjamanPayload('buku-1', valid({ nama: '  Budi Santoso ', telp: '081234567890' }));
    expect(payload).toEqual({
      bukuId: 'buku-1',
      nama: 'Budi Santoso',
      noTelp: '+6281234567890',
      alamat: 'Banjar Tengah, Darmasaba',
      tanggalPinjam: '2026-11-16T04:00:00.000Z',
      batasKembali: `2026-11-${16 + LAMA_PINJAM_HARI}T04:00:00.000Z`,
    });
    expect(payload).not.toHaveProperty('tanggalKembali');
    expect(payload).not.toHaveProperty('catatan');
  });

  it('catatan terisi ikut dalam bentuk HTML ter-escape', () => {
    expect(toPeminjamanPayload('buku-1', valid({ catatan: 'Sore <b>saja</b>' })).catatan).toBe(
      'Sore &lt;b&gt;saja&lt;/b&gt;',
    );
  });
});

describe('richTextLength (kontrak lama, dipakai src/lib/permohonan-keberatan.ts)', () => {
  it('panjang teks tanpa tag, dipangkas', () => {
    expect(richTextLength('<p> Halo <strong>desa</strong> </p>')).toBe(9);
    expect(richTextLength(undefined)).toBe(0);
  });
});
