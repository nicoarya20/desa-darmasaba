// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { isPeminjamanFormValid } from '@/app/darmasaba/(pages)/pendidikan/perpustakaan-digital/_lib/peminjamanForm';

const baseForm = {
  nama: 'Budi',
  noTelp: '081234567890',
  alamat: 'Jl. Darmasaba No. 1',
  tanggalPinjam: '2026-08-13T00:00:00.000Z',
};

describe('isPeminjamanFormValid', () => {
  it('is valid when catatan is empty but required fields are filled', () => {
    expect(isPeminjamanFormValid({ ...baseForm, catatan: '' })).toBe(true);
  });

  it('is valid when catatan is omitted entirely', () => {
    expect(isPeminjamanFormValid(baseForm)).toBe(true);
  });

  it('is invalid when nama is empty', () => {
    expect(isPeminjamanFormValid({ ...baseForm, nama: '' })).toBe(false);
  });

  it('is invalid when noTelp is empty', () => {
    expect(isPeminjamanFormValid({ ...baseForm, noTelp: '' })).toBe(false);
  });

  it('is invalid when alamat is empty', () => {
    expect(isPeminjamanFormValid({ ...baseForm, alamat: '' })).toBe(false);
  });

  it('is invalid when tanggalPinjam is empty', () => {
    expect(isPeminjamanFormValid({ ...baseForm, tanggalPinjam: '' })).toBe(false);
  });
});
