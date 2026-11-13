// @vitest-environment node
// Logika halaman Polsek Terdekat: isian "-"/kosong, parse jarak, urutan terdekat, badge 24 jam, layanan, URL peta.
import { describe, expect, it } from 'vitest';
import {
  directionsHref,
  filledText,
  formatJarak,
  jamInfo,
  layananNames,
  mapEmbedSrc,
  parseJarakKm,
  pickMapPolsek,
  sortByJarak,
} from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.logic';

const EMBED = 'https://www.google.com/maps/embed?pb=!1m18!2sPolsek'; // test-only

describe('filledText', () => {
  it.each(['', '   ', '-', ' - ', '–', '—', '.', 'N/A', null, undefined])('%j dianggap kosong', (v) => {
    expect(filledText(v)).toBeNull();
  });
  it('isian nyata di-trim dan spasi ganda dirapikan', () => {
    expect(filledText('  Buka   24 Jam ')).toBe('Buka 24 Jam');
    expect(filledText('Jl. Kebo Iwa No.1 - Mengwi')).toBe('Jl. Kebo Iwa No.1 - Mengwi');
  });
});

describe('parseJarakKm', () => {
  it.each([
    ['7 Km', 7],
    ['5,8 Km', 5.8],
    ['9,7 Km', 9.7],
    ['1.5 km', 1.5],
    ['12', 12],
    ['± 3 km', 3],
    ['800 m', 0.8],
    ['1.200 meter', 1.2],
    ['3 kilometer', 3],
  ])('%j → %d', (raw, km) => {
    expect(parseJarakKm(raw)).toBeCloseTo(km);
  });
  it.each(['', '-', null, undefined, 'dekat'])('%j → null', (raw) => {
    expect(parseJarakKm(raw)).toBeNull();
  });
});

describe('formatJarak', () => {
  it('km dengan koma desimal Indonesia, bilangan bulat tanpa ",0"', () => {
    expect(formatJarak(5.8)).toEqual({ value: '5,8', unit: 'km' });
    expect(formatJarak(7)).toEqual({ value: '7', unit: 'km' });
  });
  it('di bawah 1 km ditulis meter', () => {
    expect(formatJarak(0.8)).toEqual({ value: '800', unit: 'm' });
  });
});

describe('sortByJarak', () => {
  it('urut terdekat; jarak kosong/tak terbaca di paling bawah dengan urutan asal', () => {
    const items = [
      { id: 'ahmad-yani', jarakKeDesa: '7 Km' },
      { id: 'kosong-1', jarakKeDesa: '-' },
      { id: 'mengwi', jarakKeDesa: '9,7 Km' },
      { id: 'kosong-2', jarakKeDesa: '' },
      { id: 'polres', jarakKeDesa: '5,8 Km' },
      { id: 'abiansemal', jarakKeDesa: '9,6 Km' },
    ];
    expect(sortByJarak(items).map((i) => i.id)).toEqual([
      'polres',
      'ahmad-yani',
      'abiansemal',
      'mengwi',
      'kosong-1',
      'kosong-2',
    ]);
    expect(items[0].id).toBe('ahmad-yani'); // tidak memutasi masukan
  });
});

describe('jamInfo', () => {
  it.each(['Buka 24 Jam', '24 jam', '24Jam', 'buka 24 jam setiap hari', '24/7'])('%j → badge 24 jam', (raw) => {
    expect(jamInfo(raw)).toEqual({ open24: true, text: raw.replace(/\s+/g, ' ').trim() });
  });
  it('jam buka biasa atau campuran tidak dianggap 24 jam', () => {
    expect(jamInfo('Senin-Jumat 08.00-16.00')).toEqual({ open24: false, text: 'Senin-Jumat 08.00-16.00' });
    expect(jamInfo('08.00-16.00, piket 24 jam')?.open24).toBe(false);
  });
  it('kosong/"-" → null (tidak ada badge "Buka" palsu)', () => {
    expect(jamInfo('-')).toBeNull();
    expect(jamInfo('')).toBeNull();
  });
});

describe('layananNames', () => {
  it('relasi aktif tanpa duplikat, layanan utama tidak digandakan', () => {
    const names = layananNames({
      layananPolsek: { nama: 'Layanan Administrasi & Surat-Menyurat' },
      LayananToPolsek: [
        { layanan: { nama: 'Layanan Administrasi & Surat-Menyurat' } },
        { layanan: { nama: 'Penanganan Laporan & Pengaduan' } },
        { isActive: false, layanan: { nama: 'Relasi nonaktif' } },
        { layanan: { nama: 'Layanan nonaktif', isActive: false } },
        { layanan: { nama: '-' } },
      ],
    });
    expect(names).toEqual(['Layanan Administrasi & Surat-Menyurat', 'Penanganan Laporan & Pengaduan']);
  });
  it('tanpa relasi → layanan utama saja; tanpa apa pun → kosong', () => {
    expect(layananNames({ layananPolsek: { nama: 'SKCK' }, LayananToPolsek: [] })).toEqual(['SKCK']);
    expect(layananNames({})).toEqual([]);
  });
});

describe('URL peta & petunjuk arah', () => {
  it('iframe hanya menerima embed Google Maps https', () => {
    expect(mapEmbedSrc(EMBED)).toBe(EMBED);
    expect(mapEmbedSrc('http://www.google.com/maps/embed?pb=1')).toBeNull();
    expect(mapEmbedSrc('https://maps.app.goo.gl/abc')).toBeNull();
    expect(mapEmbedSrc('https://evil.example/maps/embed')).toBeNull();
    expect(mapEmbedSrc('-')).toBeNull();
    expect(mapEmbedSrc('bukan url')).toBeNull();
  });
  it('petunjuk arah hanya http(s)', () => {
    expect(directionsHref('https://maps.app.goo.gl/7yQQod4PFhpqqe7Z8')).toBe('https://maps.app.goo.gl/7yQQod4PFhpqqe7Z8');
    expect(directionsHref('javascript:alert(1)')).toBeNull();
    expect(directionsHref('-')).toBeNull();
  });
});

describe('pickMapPolsek', () => {
  const items = [
    { id: 'tanpa-peta', embedMapUrl: '-' },
    { id: 'a', embedMapUrl: EMBED },
    { id: 'b', embedMapUrl: EMBED },
  ];
  it('default = polsek pertama (terdekat) yang punya peta', () => {
    expect(pickMapPolsek(items, null)?.id).toBe('a');
  });
  it('pilihan pengguna dipakai bila punya peta; pilihan tanpa peta jatuh ke default', () => {
    expect(pickMapPolsek(items, 'b')?.id).toBe('b');
    expect(pickMapPolsek(items, 'tanpa-peta')?.id).toBe('a');
  });
  it('tidak ada peta sama sekali → null', () => {
    expect(pickMapPolsek([{ id: 'x', embedMapUrl: '' }], null)).toBeNull();
  });
});
