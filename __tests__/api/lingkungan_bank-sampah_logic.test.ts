// @vitest-environment node
// Bank Sampah: normalisasi langkah & lokasi, urut nama, saring klien, dan pilihan tautan "Petunjuk arah".
import { describe, expect, it } from 'vitest';
import {
  filterLokasi,
  hasCoords,
  parseCoords,
  petunjukArahHref,
  sortLokasi,
  toLangkah,
  toLokasi,
  type LokasiApiItem,
} from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.logic';
import { DIRECTIONS_BASE_URL } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.meta';

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const STG_LOKASI: LokasiApiItem = {
  id: 'cmkm8z5v70000vnrmu60qyd7b',
  name: 'TPS3R Pudak Mesari',
  alamat: 'JL.BUGBUG DAM TANAH PUTIH, DESA DARMASABA',
  namaTempatMaps: 'TPS3R Pudak Mesari',
  linkPetunjukArah: 'https://www.google.com/maps/dir/?api=1&destination=-8.568,115.204',
  lat: -8.568,
  lng: 115.204,
};
const lokasi = (over: Partial<LokasiApiItem>) => toLokasi({ ...STG_LOKASI, ...over });

describe('toLangkah', () => {
  it('mempertahankan urutan API, memangkas teks, dan membuang langkah tanpa nama', () => {
    const out = toLangkah([
      { id: 'a', name: ' Pilah sampah ', icon: 'trash' },
      { id: 'b', name: '  ', icon: 'truck' },
      { id: 'c', name: 'Timbang', icon: null },
    ]);
    expect(out).toEqual([
      { id: 'a', name: 'Pilah sampah', icon: 'trash' },
      { id: 'c', name: 'Timbang', icon: '' },
    ]);
  });
});

describe('toLokasi', () => {
  it('data stg: koordinat & tautan rute dari CMS dipakai apa adanya', () => {
    const out = toLokasi(STG_LOKASI);
    expect(out).toMatchObject({ name: 'TPS3R Pudak Mesari', lat: -8.568, lng: 115.204 });
    expect(out.petunjukArah).toBe(STG_LOKASI.linkPetunjukArah);
    expect(hasCoords(out)).toBe(true);
  });

  it('nama kosong → nama tempat Maps; koordinat string diurai; 0,0 dianggap kosong', () => {
    expect(lokasi({ name: '', namaTempatMaps: 'Bank Sampah Banjar' }).name).toBe('Bank Sampah Banjar');
    expect(lokasi({ lat: '-8.5', lng: '115.2' })).toMatchObject({ lat: -8.5, lng: 115.2 });
    const nol = lokasi({ lat: 0, lng: 0, linkPetunjukArah: '' });
    expect(hasCoords(nol)).toBe(false);
    expect(nol.petunjukArah).toBeNull();
  });
});

describe('petunjukArahHref', () => {
  const coords = { lat: -8.568, lng: 115.204 };

  it('tautan http(s) CMS diutamakan', () => {
    expect(petunjukArahHref('https://maps.app.goo.gl/abc', coords)).toBe('https://maps.app.goo.gl/abc');
  });

  it('tautan bukan http(s) atau kosong → rute dari koordinat', () => {
    const expected = `${DIRECTIONS_BASE_URL}-8.568,115.204`;
    expect(petunjukArahHref('javascript:alert(1)', coords)).toBe(expected);
    expect(petunjukArahHref('bukan url', coords)).toBe(expected);
    expect(petunjukArahHref('', coords)).toBe(expected);
  });

  it('tanpa tautan sah dan tanpa koordinat → null', () => {
    expect(petunjukArahHref(null, null)).toBeNull();
  });
});

describe('parseCoords', () => {
  it('menolak nilai di luar rentang, kosong, atau bukan angka', () => {
    expect(parseCoords(-91, 115)).toBeNull();
    expect(parseCoords(-8, 181)).toBeNull();
    expect(parseCoords('', 115)).toBeNull();
    expect(parseCoords('abc', 115)).toBeNull();
    expect(parseCoords(null, undefined)).toBeNull();
    expect(parseCoords(Number.NaN, 115)).toBeNull();
  });
});

describe('sortLokasi & filterLokasi', () => {
  // namaTempatMaps diisi per lokasi (stg: sama dengan name); tanpa itu semua mewarisi "TPS3R Pudak Mesari" dari STG_LOKASI.
  const items = [
    lokasi({ id: '1', name: 'TPS3R Pudak Mesari' }),
    lokasi({ id: '2', name: 'Bank Sampah Banjar 10', namaTempatMaps: 'Bank Sampah Banjar 10', alamat: 'Jl. Raya Sibang' }),
    lokasi({ id: '3', name: 'bank sampah banjar 2', namaTempatMaps: 'bank sampah banjar 2', alamat: 'Br. Tegal' }),
  ];

  it('urut nama A-Z tanpa beda huruf besar, angka alami (2 sebelum 10)', () => {
    expect(sortLokasi(items).map((i) => i.id)).toEqual(['3', '2', '1']);
  });

  it('setiap kata kunci harus cocok di nama, nama Maps, atau alamat', () => {
    expect(filterLokasi(items, '').map((i) => i.id)).toEqual(['1', '2', '3']);
    expect(filterLokasi(items, 'SIBANG').map((i) => i.id)).toEqual(['2']);
    expect(filterLokasi(items, 'banjar tegal').map((i) => i.id)).toEqual(['3']);
    expect(filterLokasi(items, 'pudak sibang')).toEqual([]);
  });
});
