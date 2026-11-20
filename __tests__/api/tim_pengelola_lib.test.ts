// @vitest-environment node
// Tim Pengelola Website: aturan validasi bersama API dan form admin (src/lib/tim-pengelola.ts): nomor SK wajib dan
// berbatas panjang, tanggal SK opsional (tanggal kalender nyata), skFileId (tetap/lepas/ganti), daftar anggota
// (wajib berupa daftar, batas jumlah, nama + jabatan wajib), pembuangan kunci asing, dan konversi tanggal.
import { describe, expect, it } from 'vitest';
import {
  ANGGOTA_TIM_MAX,
  JABATAN_ANGGOTA_MAX_LENGTH,
  NAMA_ANGGOTA_MAX_LENGTH,
  NOMOR_SK_MAX_LENGTH,
  TAHUN_SK_MAX,
  TAHUN_SK_MIN,
  isTanggalSkValid,
  parseTimPengelolaInput,
  toTanggalSkDate,
} from '@/lib/tim-pengelola';

// test-only: isian rekaan yang valid (bukan data SK sebenarnya).
const VALID = { nomorSk: '99 Tahun 2026', anggota: [{ nama: 'Anggota Uji Satu', jabatan: 'Ketua' }] };
const parse = (patch: Record<string, unknown>) => parseTimPengelolaInput({ ...VALID, ...patch });
const pesan = (patch: Record<string, unknown>) => {
  const result = parse(patch);
  return result.ok ? null : result.message;
};

describe('isTanggalSkValid', () => {
  it.each(['2026-01-12', '2024-02-29', `${TAHUN_SK_MIN}-01-01`, `${TAHUN_SK_MAX}-12-31`])('menerima %s', (tanggal) =>
    expect(isTanggalSkValid(tanggal)).toBe(true),
  );

  it.each([
    ['bukan tanggal', 'kemarin'],
    ['format Indonesia', '12-01-2026'],
    ['tanpa nol di depan', '2026-1-2'],
    ['tanggal mustahil (30 Februari)', '2026-02-30'],
    ['kabisat palsu', '2025-02-29'],
    ['bulan 13', '2026-13-01'],
    ['tahun terlalu kecil', '0026-01-12'],
    ['tahun terlalu besar', `${TAHUN_SK_MAX + 1}-01-01`],
    ['kosong', ''],
  ])('menolak %s', (_label, tanggal) => expect(isTanggalSkValid(tanggal)).toBe(false));
});

describe('toTanggalSkDate', () => {
  it('tanggal menjadi Date tengah malam UTC (tak bergeser zona waktu); null tetap null', () => {
    expect(toTanggalSkDate('2026-01-12')?.toISOString()).toBe('2026-01-12T00:00:00.000Z');
    expect(toTanggalSkDate(null)).toBeNull();
  });
});

describe('parseTimPengelolaInput: nomor SK', () => {
  it('menerima isian valid dan merapikan spasi berulang; tanggal dan berkas yang tak dikirim = null/undefined', () => {
    const result = parse({ nomorSk: '  99   Tahun 2026 ', anggota: [{ nama: ' Anggota   Uji ', jabatan: ' Ketua ' }] });
    expect(result).toEqual({
      ok: true,
      data: { nomorSk: '99 Tahun 2026', tanggalSk: null, anggota: [{ nama: 'Anggota Uji', jabatan: 'Ketua' }] },
    });
  });

  it.each([
    ['tidak dikirim', undefined],
    ['string kosong', ''],
    ['hanya spasi', '   '],
  ])('nomor SK %s → wajib diisi', (_label, nomorSk) => {
    const input = nomorSk === undefined ? { anggota: [] } : { nomorSk, anggota: [] };
    expect(parseTimPengelolaInput(input)).toEqual({ ok: false, message: 'Nomor SK wajib diisi' });
  });

  it('menolak nomor melebihi batas panjang; tepat di batas diterima', () => {
    expect(pesan({ nomorSk: 'x'.repeat(NOMOR_SK_MAX_LENGTH + 1) })).toBe(`Nomor SK maksimal ${NOMOR_SK_MAX_LENGTH} karakter`);
    expect(parse({ nomorSk: 'x'.repeat(NOMOR_SK_MAX_LENGTH) }).ok).toBe(true);
  });

  it('menolak nomor bukan teks', () => {
    expect(pesan({ nomorSk: 181 })).toBe('Nomor SK harus berupa teks');
  });
});

describe('parseTimPengelolaInput: tanggal SK opsional', () => {
  it.each([
    ['tidak dikirim', undefined],
    ['null', null],
    ['string kosong', ''],
    ['hanya spasi', '   '],
  ])('%s → null (bukan galat)', (_label, tanggalSk) => {
    const result = tanggalSk === undefined ? parse({}) : parse({ tanggalSk });
    expect(result.ok && result.data.tanggalSk).toBeNull();
  });

  it('tanggal nyata diterima apa adanya (spasi tepi dibuang)', () => {
    const result = parse({ tanggalSk: ' 2026-01-12 ' });
    expect(result.ok && result.data.tanggalSk).toBe('2026-01-12');
  });

  it.each(['12/01/2026', '2026-02-30', '0026-01-12', 'abc'])('menolak tanggal tidak valid %s', (tanggalSk) => {
    expect(pesan({ tanggalSk })).toMatch(/^Tanggal SK tidak valid: gunakan format TTTT-BB-HH/);
  });

  it('menolak tanggal bukan teks', () => {
    expect(pesan({ tanggalSk: 20260112 })).toBe('Tanggal SK harus berupa teks');
  });
});

describe('parseTimPengelolaInput: berkas SK (skFileId)', () => {
  it('tidak dikirim = undefined (berkas tetap), null = lepas berkas, id = ganti berkas', () => {
    const tetap = parse({});
    const lepas = parse({ skFileId: null });
    const ganti = parse({ skFileId: 'file-uji-1' });
    expect(tetap.ok && tetap.data.skFileId).toBeUndefined();
    expect(lepas.ok && lepas.data.skFileId).toBeNull();
    expect(ganti.ok && ganti.data.skFileId).toBe('file-uji-1');
  });

  it('menolak id kosong dan id bukan teks', () => {
    expect(pesan({ skFileId: '' })).toBe('skFileId tidak boleh kosong');
    expect(pesan({ skFileId: 12 })).toBe('skFileId harus berupa teks');
  });
});

describe('parseTimPengelolaInput: daftar anggota', () => {
  it('daftar kosong diterima (tim belum punya anggota)', () => {
    const result = parse({ anggota: [] });
    expect(result.ok && result.data.anggota).toEqual([]);
  });

  it('urutan daftar dipertahankan', () => {
    const anggota = [
      { nama: 'B Uji', jabatan: 'Sekretaris' },
      { nama: 'A Uji', jabatan: 'Ketua' },
    ];
    const result = parse({ anggota });
    expect(result.ok && result.data.anggota).toEqual(anggota);
  });

  it('daftar tidak dikirim atau bukan daftar → galat (tidak diam-diam mengosongkan anggota)', () => {
    expect(parseTimPengelolaInput({ nomorSk: VALID.nomorSk })).toEqual({ ok: false, message: 'Daftar anggota wajib dikirim (boleh kosong)' });
    expect(pesan({ anggota: 'Ketua' })).toBe('Daftar anggota harus berupa daftar');
  });

  it('galat menyebut nomor urut anggota (mulai 1) yang bermasalah', () => {
    const anggota = [VALID.anggota[0], { nama: '   ', jabatan: 'Ketua' }];
    expect(pesan({ anggota })).toBe('Anggota ke-2: Nama wajib diisi');
    expect(pesan({ anggota: [{ nama: 'Anggota Uji', jabatan: '' }] })).toBe('Anggota ke-1: Jabatan wajib diisi');
  });

  it('menolak nama/jabatan melebihi batas panjang; tepat di batas diterima', () => {
    const nama = 'x'.repeat(NAMA_ANGGOTA_MAX_LENGTH + 1);
    expect(pesan({ anggota: [{ nama, jabatan: 'Ketua' }] })).toBe(`Anggota ke-1: Nama maksimal ${NAMA_ANGGOTA_MAX_LENGTH} karakter`);
    const jabatan = 'x'.repeat(JABATAN_ANGGOTA_MAX_LENGTH + 1);
    expect(pesan({ anggota: [{ nama: 'Anggota Uji', jabatan }] })).toBe(
      `Anggota ke-1: Jabatan maksimal ${JABATAN_ANGGOTA_MAX_LENGTH} karakter`,
    );
    expect(parse({ anggota: [{ nama: 'x'.repeat(NAMA_ANGGOTA_MAX_LENGTH), jabatan: 'Ketua' }] }).ok).toBe(true);
  });

  it('menolak daftar melebihi batas jumlah anggota; tepat di batas diterima', () => {
    const anggota = (n: number) => Array.from({ length: n }, (_, i) => ({ nama: `Anggota Uji ${i + 1}`, jabatan: 'Anggota' }));
    expect(pesan({ anggota: anggota(ANGGOTA_TIM_MAX + 1) })).toBe(`Anggota maksimal ${ANGGOTA_TIM_MAX} orang`);
    expect(parse({ anggota: anggota(ANGGOTA_TIM_MAX) }).ok).toBe(true);
  });

  it('membuang kunci asing di tingkat tim dan tingkat anggota', () => {
    const result = parse({ id: 'lain', createdAt: '2000-01-01', anggota: [{ nama: 'Anggota Uji', jabatan: 'Ketua', urutan: 9, id: 'x' }] });
    // skFileId yang tidak dikirim tidak menjadi kunci sama sekali (berkas tetap).
    expect(result.ok && Object.keys(result.data).sort()).toEqual(['anggota', 'nomorSk', 'tanggalSk']);
    expect(result.ok && result.data.anggota[0]).toEqual({ nama: 'Anggota Uji', jabatan: 'Ketua' });
  });
});
