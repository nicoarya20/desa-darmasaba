// @vitest-environment node
// Data Lingkungan Desa publik: normalisasi baris (jumlah apa adanya, ikon tak dikenal → tanpa ikon), cari klien, URL.
import { describe, expect, it } from 'vitest';
import {
  dataLingkunganEmptyMessage,
  dataLingkunganListHref,
  filterDataLingkungan,
  toDataLingkungan,
} from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/data-lingkungan.logic';

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = {
  id: 'bnlneq3zg0000vn8issps6jl4',
  name: ' Pengelolaan Sampah Desa (Inovasi CINtA) ',
  jumlah: ' 1 paket kegiatan ',
  deskripsi: 'Program inovatif cara indah tangani sampah (CINtA) termasuk TPS3R.',
  icon: 'sampah',
};
const identity = (html: string) => html;

describe('toDataLingkungan', () => {
  it('nama, jumlah apa adanya (tanpa "±"), deskripsi lewat sanitize, ikon dikenal', () => {
    const item = toDataLingkungan(api, identity);
    expect(item).toMatchObject({
      id: api.id,
      title: 'Pengelolaan Sampah Desa (Inovasi CINtA)',
      amount: '1 paket kegiatan',
      html: api.deskripsi,
      icon: 'sampah',
    });
    expect(item.amount).not.toContain('±');
  });

  it('angka murni tetap teks apa adanya (entri uji stg "100")', () => {
    expect(toDataLingkungan({ ...api, jumlah: '100' }, identity).amount).toBe('100');
  });

  it('ikon tak dikenal ("icon-test") / kosong → tanpa ikon; entri uji TIDAK disaring', () => {
    const uji = toDataLingkungan({ ...api, name: 'Test QA Data Lingkungan', icon: 'icon-test' }, identity);
    expect(uji.icon).toBeUndefined();
    expect(uji.title).toBe('Test QA Data Lingkungan');
    expect(toDataLingkungan({ ...api, icon: null }, identity).icon).toBeUndefined();
  });

  it('jumlah / deskripsi kosong → tidak ada (deskripsi "<p></p>" tidak memanggil sanitize)', () => {
    let calls = 0;
    const item = toDataLingkungan({ ...api, jumlah: ' ', deskripsi: '<p></p>' }, (html) => (calls++, html));
    expect(item.amount).toBeUndefined();
    expect(item.html).toBeUndefined();
    expect(calls).toBe(0);
  });
});

describe('filterDataLingkungan', () => {
  const items = [
    toDataLingkungan(api, identity),
    toDataLingkungan({ ...api, id: 'b', name: 'Pengelolaan Daerah Aliran Sungai', deskripsi: '<p>Menjaga sumber air</p>', icon: 'air' }, identity),
  ];

  it('semua kata harus muncul di nama, jumlah, atau deskripsi; tidak peka huruf besar', () => {
    expect(filterDataLingkungan(items, 'SUMBER air').map((i) => i.id)).toEqual(['b']);
    expect(filterDataLingkungan(items, 'cinta tps3r').map((i) => i.id)).toEqual([api.id]);
    expect(filterDataLingkungan(items, 'paket')).toHaveLength(2);
    expect(filterDataLingkungan(items, '')).toHaveLength(2);
    expect(filterDataLingkungan(items, '<p>')).toEqual([]);
  });
});

describe('URL & pesan', () => {
  it('daftar menulis search/page hanya bila perlu', () => {
    expect(dataLingkunganListHref()).toBe('/lingkungan/data-lingkungan-desa');
    expect(dataLingkunganListHref({ search: ' air ', page: 1 })).toBe('/lingkungan/data-lingkungan-desa?search=air');
    expect(dataLingkunganListHref({ page: 2 })).toBe('/lingkungan/data-lingkungan-desa?page=2');
  });

  it('pesan kosong: galat, cari tanpa hasil, belum ada', () => {
    expect(dataLingkunganEmptyMessage('air', true)).toBe('Data lingkungan gagal dimuat. Coba muat ulang halaman.');
    expect(dataLingkunganEmptyMessage(' air ', false)).toBe('Tidak ada data lingkungan yang cocok dengan “air”.');
    expect(dataLingkunganEmptyMessage('', false)).toBe('Belum ada data lingkungan desa.');
  });
});
