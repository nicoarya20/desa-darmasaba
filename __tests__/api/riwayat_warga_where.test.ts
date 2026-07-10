// @vitest-environment node
// Pure where-builder untuk endpoint agregat Riwayat Kesehatan Warga — tanpa DOM/prisma.
import { describe, it, expect } from 'vitest';
import {
  banjarWhereViaPosyandu,
  banjarWhereDirect,
  orSearch,
  searchFields,
} from '@/app/api/[[...slugs]]/_lib/kesehatan/riwayat-warga/_where';

describe('banjarWhereViaPosyandu', () => {
  it('menghasilkan nested filter { posyandu: { banjarId } } tanpa is:', () => {
    expect(banjarWhereViaPosyandu('b1')).toEqual({ posyandu: { banjarId: 'b1' } });
  });
});

describe('banjarWhereDirect', () => {
  it('menghasilkan filter langsung { banjarId }', () => {
    expect(banjarWhereDirect('b1')).toEqual({ banjarId: 'b1' });
  });
});

describe('orSearch - field per model', () => {
  it('ibuHamil: OR mencakup nama/nik/alamat', () => {
    expect(orSearch(searchFields.ibuHamil, 'nico')).toEqual([
      { nama: { contains: 'nico', mode: 'insensitive' } },
      { nik: { contains: 'nico', mode: 'insensitive' } },
      { alamat: { contains: 'nico', mode: 'insensitive' } },
    ]);
  });

  it('balita: OR mencakup namaOrtu', () => {
    const or = orSearch(searchFields.balita, 'x');
    expect(or).toContainEqual({ namaOrtu: { contains: 'x', mode: 'insensitive' } });
    expect(or?.map((c) => Object.keys(c)[0])).toEqual(['nama', 'nik', 'namaOrtu', 'alamat']);
  });

  it('penyakit: OR mencakup penyakit & jenisKelamin', () => {
    const or = orSearch(searchFields.penyakit, 'x');
    expect(or).toContainEqual({ penyakit: { contains: 'x', mode: 'insensitive' } });
    expect(or).toContainEqual({ jenisKelamin: { contains: 'x', mode: 'insensitive' } });
    expect(or?.map((c) => Object.keys(c)[0])).toEqual(['nama', 'alamat', 'jenisKelamin', 'penyakit']);
  });
});

describe('orSearch - blank handling', () => {
  it('string kosong → undefined (tanpa OR)', () => {
    expect(orSearch(searchFields.ibuHamil, '')).toBeUndefined();
  });

  it('whitespace-only → undefined (di-trim seperti buildUserWhere)', () => {
    expect(orSearch(searchFields.ibuHamil, '   ')).toBeUndefined();
  });

  it('search di-trim sebelum contains', () => {
    expect(orSearch(searchFields.ibuHamil, '  nico  ')).toEqual([
      { nama: { contains: 'nico', mode: 'insensitive' } },
      { nik: { contains: 'nico', mode: 'insensitive' } },
      { alamat: { contains: 'nico', mode: 'insensitive' } },
    ]);
  });
});
