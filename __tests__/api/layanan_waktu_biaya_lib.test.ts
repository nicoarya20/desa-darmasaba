// @vitest-environment node
// Estimasi waktu & biaya pelayanan desa — fungsi murni (validasi, format, konversi form).
// Semantik: null = belum diisi (tidak tampil), biaya 0 = "Gratis".
import { describe, it, expect } from 'vitest';
import {
  PELAYANAN_BIAYA_MAX,
  PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH,
  formatBiayaPelayanan,
  parseWaktuBiaya,
  sanitizeBiayaInput,
  toWaktuBiayaForm,
  toWaktuBiayaPayload,
  validateWaktuBiayaForm,
  waktuBiayaLabel,
} from '@/lib/pelayanan-waktu-biaya';
import {
  PERKIRAAN_WAKTU_BIAYA,
  waktuBiayaUntukSeed,
} from '../../prisma/_seeder_list/desa/layanan/perkiraan_waktu_biaya';
import suratKeteranganSeed from '../../prisma/data/desa/layanan/pelayananSuratKeterangan.json';
import perizinanSeed from '../../prisma/data/desa/layanan/pelayananPerizinanBerusaha.json';

describe('parseWaktuBiaya — validasi biaya', () => {
  it('biaya valid (integer ≥ 0 sampai batas) diterima apa adanya', () => {
    expect(parseWaktuBiaya({ biaya: 50000 })).toEqual({ ok: true, data: { biaya: 50000 } });
    expect(parseWaktuBiaya({ biaya: PELAYANAN_BIAYA_MAX })).toEqual({
      ok: true,
      data: { biaya: PELAYANAN_BIAYA_MAX },
    });
  });

  it('biaya 0 tetap 0 (Gratis), bukan null', () => {
    const result = parseWaktuBiaya({ biaya: 0 });
    expect(result).toEqual({ ok: true, data: { biaya: 0 } });
    expect(result.ok && result.data.biaya).not.toBeNull();
  });

  it('biaya null → null (belum diisi / dikosongkan)', () => {
    expect(parseWaktuBiaya({ biaya: null })).toEqual({ ok: true, data: { biaya: null } });
  });

  it.each([
    ['negatif', -1, 'Biaya tidak boleh negatif'],
    ['desimal', 1.5, 'Biaya harus berupa bilangan bulat (rupiah)'],
    ['NaN', Number.NaN, 'Biaya harus berupa bilangan bulat (rupiah)'],
    ['Infinity', Number.POSITIVE_INFINITY, 'Biaya harus berupa bilangan bulat (rupiah)'],
    ['string angka', '5000', 'Biaya harus berupa bilangan bulat (rupiah)'],
    ['boolean', true, 'Biaya harus berupa bilangan bulat (rupiah)'],
  ])('menolak biaya %s', (_label, biaya, message) => {
    expect(parseWaktuBiaya({ biaya })).toEqual({ ok: false, message });
  });

  it('menolak biaya di atas batas wajar', () => {
    const result = parseWaktuBiaya({ biaya: PELAYANAN_BIAYA_MAX + 1 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain('Biaya maksimal Rp');
  });
});

describe('parseWaktuBiaya — validasi estimasi waktu', () => {
  it('di-trim; string kosong/spasi → null', () => {
    expect(parseWaktuBiaya({ estimasiWaktu: '  1 hari kerja ' })).toEqual({
      ok: true,
      data: { estimasiWaktu: '1 hari kerja' },
    });
    expect(parseWaktuBiaya({ estimasiWaktu: '   ' })).toEqual({ ok: true, data: { estimasiWaktu: null } });
    expect(parseWaktuBiaya({ estimasiWaktu: null })).toEqual({ ok: true, data: { estimasiWaktu: null } });
  });

  it('tepat batas panjang diterima, lebih satu karakter ditolak', () => {
    const atLimit = 'a'.repeat(PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH);
    expect(parseWaktuBiaya({ estimasiWaktu: atLimit }).ok).toBe(true);
    const tooLong = parseWaktuBiaya({ estimasiWaktu: atLimit + 'a' });
    expect(tooLong).toEqual({
      ok: false,
      message: `Estimasi waktu maksimal ${PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH} karakter`,
    });
  });

  it('menolak tipe non-string', () => {
    expect(parseWaktuBiaya({ estimasiWaktu: 3 })).toEqual({
      ok: false,
      message: 'Estimasi waktu harus berupa teks',
    });
  });
});

describe('parseWaktuBiaya — kontrak aditif', () => {
  it('tanpa field baru → data kosong (kolom tidak disentuh)', () => {
    for (const input of [{}, undefined, null, { name: 'x', deskripsi: 'y' }]) {
      const result = parseWaktuBiaya(input);
      expect(result).toEqual({ ok: true, data: {} });
      expect(result.ok && Object.keys(result.data)).toEqual([]);
    }
  });
});

describe('formatBiayaPelayanan & waktuBiayaLabel', () => {
  it('null/undefined → null; 0 → Gratis; lainnya → format rupiah', () => {
    expect(formatBiayaPelayanan(null)).toBeNull();
    expect(formatBiayaPelayanan(undefined)).toBeNull();
    expect(formatBiayaPelayanan(0)).toBe('Gratis');
    expect(formatBiayaPelayanan(50000)).toBe('Rp 50.000');
  });

  it('label gabungan', () => {
    expect(waktuBiayaLabel({ estimasiWaktu: '1 hari kerja', biaya: 0 })).toBe('1 hari kerja • Gratis');
    expect(waktuBiayaLabel({ estimasiWaktu: null, biaya: 50000 })).toBe('Rp 50.000');
    expect(waktuBiayaLabel({ estimasiWaktu: '2 hari kerja', biaya: null })).toBe('2 hari kerja');
  });

  it('kedua field belum diisi → null (badge tidak tampil), tapi biaya 0 tetap tampil', () => {
    expect(waktuBiayaLabel({ estimasiWaktu: null, biaya: null })).toBeNull();
    expect(waktuBiayaLabel({ estimasiWaktu: '   ', biaya: null })).toBeNull();
    expect(waktuBiayaLabel({})).toBeNull();
    expect(waktuBiayaLabel(null)).toBeNull();
    expect(waktuBiayaLabel({ estimasiWaktu: null, biaya: 0 })).toBe('Gratis');
  });
});

describe('konversi form admin', () => {
  it('sanitizeBiayaInput hanya menyisakan digit dan memotong panjang', () => {
    expect(sanitizeBiayaInput('Rp 50.000abc')).toBe('50000');
    expect(sanitizeBiayaInput('-5')).toBe('5');
    expect(sanitizeBiayaInput('1234567890123')).toHaveLength(String(PELAYANAN_BIAYA_MAX).length);
  });

  it('form → payload: kosong = null, "0" = 0 (dibedakan)', () => {
    expect(toWaktuBiayaPayload({ estimasiWaktu: '', biaya: '' })).toEqual({ estimasiWaktu: null, biaya: null });
    expect(toWaktuBiayaPayload({ estimasiWaktu: ' 1 hari ', biaya: '0' })).toEqual({
      estimasiWaktu: '1 hari',
      biaya: 0,
    });
    expect(toWaktuBiayaPayload({ estimasiWaktu: '', biaya: '25000' }).biaya).toBe(25000);
  });

  it('data API → form: null → string kosong, 0 → "0"', () => {
    expect(toWaktuBiayaForm({ estimasiWaktu: null, biaya: null })).toEqual({ estimasiWaktu: '', biaya: '' });
    expect(toWaktuBiayaForm({ estimasiWaktu: '1 hari kerja', biaya: 0 })).toEqual({
      estimasiWaktu: '1 hari kerja',
      biaya: '0',
    });
    expect(toWaktuBiayaForm(undefined)).toEqual({ estimasiWaktu: '', biaya: '' });
  });

  it('validateWaktuBiayaForm: null bila valid, pesan bila biaya melewati batas', () => {
    expect(validateWaktuBiayaForm({ estimasiWaktu: '', biaya: '' })).toBeNull();
    expect(validateWaktuBiayaForm({ estimasiWaktu: '1 hari', biaya: '0' })).toBeNull();
    expect(validateWaktuBiayaForm({ estimasiWaktu: '', biaya: '999999999' })).toContain('Biaya maksimal');
  });
});

describe('seed perkiraan waktu & biaya', () => {
  const allEntries = [
    ...Object.values(PERKIRAAN_WAKTU_BIAYA.suratKeterangan),
    ...Object.values(PERKIRAAN_WAKTU_BIAYA.perizinanBerusaha),
  ];

  it('semua nilai perkiraan lolos validasi API', () => {
    expect(allEntries.length).toBeGreaterThan(0);
    for (const entry of allEntries) {
      expect(parseWaktuBiaya(entry).ok).toBe(true);
    }
  });

  it('id di peta cocok dengan data seed (tidak ada typo id)', () => {
    const suratIds = new Set(suratKeteranganSeed.map((row: { id: string }) => row.id));
    for (const id of Object.keys(PERKIRAAN_WAKTU_BIAYA.suratKeterangan)) {
      expect(suratIds.has(id)).toBe(true);
    }
    const perizinanIds = new Set(perizinanSeed.map((row: { id: string }) => row.id));
    for (const id of Object.keys(PERKIRAAN_WAKTU_BIAYA.perizinanBerusaha)) {
      expect(perizinanIds.has(id)).toBe(true);
    }
  });

  it('nilai admin yang sudah ada tidak ditimpa perkiraan; null diisi perkiraan', () => {
    const perkiraan = { estimasiWaktu: '1 hari kerja', biaya: 0 };
    expect(waktuBiayaUntukSeed({ estimasiWaktu: '3 hari kerja', biaya: 25000 }, perkiraan)).toEqual({
      estimasiWaktu: '3 hari kerja',
      biaya: 25000,
    });
    expect(waktuBiayaUntukSeed({ estimasiWaktu: null, biaya: null }, perkiraan)).toEqual(perkiraan);
    expect(waktuBiayaUntukSeed(null, undefined)).toEqual({ estimasiWaktu: null, biaya: null });
  });
});
