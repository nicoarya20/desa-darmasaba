// @vitest-environment node
// Utilitas tampilan satuan produk UMKM (PasarDesa.satuan, nullable) — fungsi murni.
import { describe, it, expect } from 'vitest';
import {
  jumlahLabel,
  normalizeSatuan,
  perSatuanSuffix,
  withSatuan,
} from '@/app/(public)/(pages)/ekonomi/umkm/_lib/satuan';

describe('normalizeSatuan', () => {
  it('trim spasi', () => {
    expect(normalizeSatuan('  kg ')).toBe('kg');
  });
  it('kosong/null/undefined → undefined', () => {
    expect(normalizeSatuan('')).toBeUndefined();
    expect(normalizeSatuan('   ')).toBeUndefined();
    expect(normalizeSatuan(null)).toBeUndefined();
    expect(normalizeSatuan(undefined)).toBeUndefined();
  });
});

describe('perSatuanSuffix', () => {
  it('ada satuan → " / kg"', () => {
    expect(perSatuanSuffix('kg')).toBe(' / kg');
  });
  it('tanpa satuan → string kosong (fallback aman produk lama)', () => {
    expect(perSatuanSuffix(null)).toBe('');
    expect(perSatuanSuffix('')).toBe('');
  });
});

describe('withSatuan', () => {
  it('gabung angka + satuan', () => {
    expect(withSatuan(12, 'ekor')).toBe('12 ekor');
    expect(withSatuan(2, 'kg')).toBe('2 kg');
  });
  it('tanpa satuan → angka saja', () => {
    expect(withSatuan(12, null)).toBe('12');
    expect(withSatuan(1, '')).toBe('1');
  });
});

describe('jumlahLabel', () => {
  it('ada satuan → "Jumlah (ekor)"', () => {
    expect(jumlahLabel('ekor')).toBe('Jumlah (ekor)');
  });
  it('tanpa satuan → "Jumlah"', () => {
    expect(jumlahLabel(null)).toBe('Jumlah');
    expect(jumlahLabel('')).toBe('Jumlah');
  });
});
