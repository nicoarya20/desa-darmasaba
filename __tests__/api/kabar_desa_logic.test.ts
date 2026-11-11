// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  detailHref,
  formatTanggalKabar,
  htmlToText,
  splitFeatured,
  toBeritaItem,
  toPengumumanItem,
  type BeritaApiItem,
} from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';
import { readFindMany } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.source';

// test-only: bentuk meniru respons find-many berita.
const berita = (over: Partial<BeritaApiItem> = {}): BeritaApiItem => ({
  id: 'b1',
  judul: '  Festival Desa  ',
  deskripsi: '<p>Promosi&nbsp;UMKM &amp; budaya</p><p>lokal</p>',
  createdAt: '2026-11-03T02:00:00.000Z',
  image: { link: '/api/img/b1.webp' },
  kategoriBerita: { name: 'Budaya' },
  ...over,
});

describe('htmlToText', () => {
  it('membuang tag, membaca entitas umum, merapikan spasi', () => {
    expect(htmlToText('<p>Promosi&nbsp;UMKM &amp; budaya</p><p>lokal</p>')).toBe('Promosi UMKM & budaya lokal');
    expect(htmlToText('baris<br/>baru &lt;b&gt; &quot;x&quot; &#39;y&#39;')).toBe('baris baru <b> "x" \'y\'');
  });

  it('null/undefined/kosong → string kosong', () => {
    expect(htmlToText(null)).toBe('');
    expect(htmlToText(undefined)).toBe('');
    expect(htmlToText('<p> </p>')).toBe('');
  });
});

describe('detailHref', () => {
  it('kategori di-encode', () => {
    expect(detailHref('/darmasaba/pemerintahan/berita', 'Seni & Budaya', 'x1')).toBe('/darmasaba/pemerintahan/berita/Seni%20%26%20Budaya/x1');
  });

  it('kategori kosong/null → "umum"', () => {
    expect(detailHref('/b', null, 'x1')).toBe('/b/umum/x1');
    expect(detailHref('/b', '   ', 'x1')).toBe('/b/umum/x1');
  });
});

describe('toBeritaItem', () => {
  it('normalisasi judul, ringkasan, kategori, gambar, tanggal, href', () => {
    expect(toBeritaItem(berita())).toEqual({
      id: 'b1',
      title: 'Festival Desa',
      summary: 'Promosi UMKM & budaya lokal',
      kategori: 'Budaya',
      imageUrl: '/api/img/b1.webp',
      createdAt: Date.parse('2026-11-03T02:00:00.000Z'),
      href: '/darmasaba/pemerintahan/berita/Budaya/b1',
    });
  });

  it('tanpa gambar & kategori → undefined + href kategori "umum"', () => {
    const item = toBeritaItem(berita({ image: null, kategoriBerita: null, deskripsi: null }));
    expect(item.imageUrl).toBeUndefined();
    expect(item.kategori).toBeUndefined();
    expect(item.summary).toBe('');
    expect(item.href).toBe('/darmasaba/pemerintahan/berita/umum/b1');
  });
});

describe('toPengumumanItem', () => {
  it('memakai CategoryPengumuman untuk href detail, tanpa ringkasan/gambar', () => {
    const item = toPengumumanItem({
      id: 'p1',
      judul: 'Jadwal KTP keliling',
      createdAt: new Date('2026-11-05T00:00:00.000Z'),
      CategoryPengumuman: { name: 'Layanan' },
    });
    expect(item).toMatchObject({ title: 'Jadwal KTP keliling', summary: '', kategori: 'Layanan' });
    expect(item.imageUrl).toBeUndefined();
    expect(item.href).toBe('/darmasaba/pemerintahan/pengumuman/Layanan/p1');
  });
});

describe('formatTanggalKabar', () => {
  it('tanggal ringkas zona WITA (lewat tengah malam UTC+8 → hari berikutnya)', () => {
    // 2026-11-03 17:00 UTC = 4 Nov 01:00 WITA
    expect(formatTanggalKabar(Date.parse('2026-11-03T17:00:00.000Z'))).toMatch(/^4 Nov 2026$/);
  });
});

describe('splitFeatured', () => {
  it('item pertama jadi utama, sisanya rest', () => {
    expect(splitFeatured([1, 2, 3])).toEqual({ featured: 1, rest: [2, 3] });
  });

  it('kosong → featured undefined', () => {
    expect(splitFeatured([])).toEqual({ featured: undefined, rest: [] });
  });
});

describe('readFindMany', () => {
  it('respons sukses → data', () => {
    expect(readFindMany('berita', 200, { success: true, data: [{ id: 'a' }] })).toEqual([{ id: 'a' }]);
  });

  it('status/success/data tidak valid → Error dengan konteks', () => {
    expect(() => readFindMany('berita', 500, { success: false, message: 'Gagal' })).toThrow('find-many berita gagal (HTTP 500): Gagal');
    expect(() => readFindMany('pengumuman', 200, { success: true, data: null })).toThrow('find-many pengumuman gagal (HTTP 200): respons tidak valid');
    expect(() => readFindMany('berita', 200, null)).toThrow(/respons tidak valid/);
  });
});
