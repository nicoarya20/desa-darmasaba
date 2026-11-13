// @vitest-environment node
// Logika kartu katalog UMKM publik: format harga, label stok/unggulan, foto & alamat pengganti, rute detail.
import { describe, expect, it } from 'vitest';
import {
  alamatTampil,
  formatHarga,
  fotoSrc,
  hargaParts,
  isHabis,
  produkHref,
  produkLabel,
  tokoHref,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-card.logic';
import { KATALOG_CARD_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-card.text';

describe('formatHarga', () => {
  it('menulis rupiah ringkas tanpa spasi dengan titik ribuan', () => {
    expect(formatHarga(80000)).toBe('Rp80.000');
    expect(formatHarga(1250000)).toBe('Rp1.250.000');
    expect(formatHarga(500)).toBe('Rp500');
    expect(formatHarga(0)).toBe('Rp0');
  });

  it('membulatkan pecahan, tidak menampilkan koma desimal', () => {
    expect(formatHarga(15000.4)).toBe('Rp15.000');
  });
});

describe('hargaParts', () => {
  it('memisahkan harga dan akhiran satuan', () => {
    expect(hargaParts({ harga: 80000, satuan: 'ekor' })).toEqual({ harga: 'Rp80.000', satuan: ' / ekor' });
  });

  it('satuan kosong atau null → tanpa akhiran', () => {
    expect(hargaParts({ harga: 5000, satuan: null }).satuan).toBe('');
    expect(hargaParts({ harga: 5000, satuan: '  ' }).satuan).toBe('');
  });
});

describe('produkLabel', () => {
  it('stok ≤ 0 → habis', () => {
    expect(isHabis(0)).toBe(true);
    expect(isHabis(-2)).toBe(true);
    expect(isHabis(1)).toBe(false);
    expect(produkLabel({ stok: 0, isUnggulan: false })).toBe('habis');
  });

  it('unggulan hanya bila stok masih ada; habis mengalahkan unggulan', () => {
    expect(produkLabel({ stok: 3, isUnggulan: true })).toBe('unggulan');
    expect(produkLabel({ stok: 0, isUnggulan: true })).toBe('habis');
  });

  it('tersedia dan bukan unggulan → tanpa label', () => {
    expect(produkLabel({ stok: 5, isUnggulan: false })).toBeNull();
  });
});

describe('foto & alamat pengganti', () => {
  it('fotoSrc membuang URL kosong/spasi agar kartu memakai ikon', () => {
    expect(fotoSrc(null)).toBeNull();
    expect(fotoSrc('   ')).toBeNull();
    expect(fotoSrc(' /api/img/a.webp ')).toBe('/api/img/a.webp');
  });

  it('alamat kosong → nama desa', () => {
    expect(alamatTampil(null)).toBe(T.alamatKosong);
    expect(alamatTampil('  ')).toBe(T.alamatKosong);
    expect(alamatTampil(' Br. Tengah ')).toBe('Br. Tengah');
  });
});

describe('rute detail', () => {
  it('produk dan toko menuju halaman detail publik', () => {
    expect(produkHref('p1')).toBe('/ekonomi/umkm/produk/p1');
    expect(tokoHref('u1')).toBe('/ekonomi/umkm/u1');
  });
});
