// @vitest-environment node
// Validasi & normalisasi nomor telepon peminjaman perpustakaan — fungsi murni.
import { describe, it, expect } from 'vitest';
import {
  MAX_DIGITS,
  MIN_DIGITS,
  PHONE_PREFIX,
  isValidPhoneDigits,
  sanitizePhoneDigits,
  toPhoneDigits,
  toStoredPhone,
} from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/notelp';

describe('sanitizePhoneDigits', () => {
  it('buang huruf & simbol, sisakan digit', () => {
    expect(sanitizePhoneDigits('8a1b2c3')).toBe('8123');
    expect(sanitizePhoneDigits('812-345 678')).toBe('812345678');
  });

  it('buang angka 0 di depan (diwakili +62)', () => {
    expect(sanitizePhoneDigits('08123456')).toBe('8123456');
    expect(sanitizePhoneDigits('008123')).toBe('8123');
  });

  it('batasi maksimal MAX_DIGITS digit', () => {
    expect(sanitizePhoneDigits('8'.repeat(20))).toHaveLength(MAX_DIGITS);
  });

  it('input kosong/hanya huruf → string kosong', () => {
    expect(sanitizePhoneDigits('abc')).toBe('');
    expect(sanitizePhoneDigits('')).toBe('');
  });
});

describe('toStoredPhone / toPhoneDigits (round-trip)', () => {
  it('gabung digit jadi +62<digit>', () => {
    expect(toStoredPhone('8123456789')).toBe('+628123456789');
  });

  it('digit kosong → simpan string kosong (bukan "+62")', () => {
    expect(toStoredPhone('')).toBe('');
    expect(toStoredPhone('abc')).toBe('');
  });

  it('ketikan 0 depan tetap ternormalisasi', () => {
    expect(toStoredPhone('08123456')).toBe('+628123456');
  });

  it('ekstrak digit dari nilai tersimpan +62...', () => {
    expect(toPhoneDigits('+628123456789')).toBe('8123456789');
  });

  it('toPhoneDigits(toStoredPhone(x)) konsisten', () => {
    const digits = '81234567';
    expect(toPhoneDigits(toStoredPhone(digits))).toBe(digits);
  });

  it('nilai kosong aman', () => {
    expect(toPhoneDigits('')).toBe('');
    expect(PHONE_PREFIX).toBe('+62');
  });
});

describe('isValidPhoneDigits', () => {
  it(`valid pada batas ${MIN_DIGITS} (= 10 digit lokal)`, () => {
    expect(isValidPhoneDigits('8'.repeat(MIN_DIGITS))).toBe(true);
  });

  it(`valid pada batas ${MAX_DIGITS} (= 13 digit lokal)`, () => {
    expect(isValidPhoneDigits('8'.repeat(MAX_DIGITS))).toBe(true);
  });

  it('invalid bila kurang dari minimal', () => {
    expect(isValidPhoneDigits('8'.repeat(MIN_DIGITS - 1))).toBe(false);
  });

  it('invalid bila kosong', () => {
    expect(isValidPhoneDigits('')).toBe(false);
  });

  it('lebih dari maksimal dipotong dulu → tetap valid pada MAX', () => {
    // sanitize memotong ke MAX_DIGITS, jadi 20 "8" → MAX digit → valid
    expect(isValidPhoneDigits('8'.repeat(20))).toBe(true);
  });
});
