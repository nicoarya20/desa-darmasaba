// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  isWideCard,
  toPrestasiCards,
  type PrestasiApiItem,
} from '@/app/darmasaba/_com/main-page/prestasi/prestasi.logic';
import {
  PRESTASI_BERANDA_LIMIT,
  PRESTASI_HERO_IMAGE,
  PRESTASI_LIST_HREF,
} from '@/app/darmasaba/_com/main-page/prestasi/prestasi.meta';

// test-only: urutan meniru respons API (createdAt desc → terbaru di depan).
const item = (id: string, name = `Prestasi ${id}`, link: string | null = `/api/img/${id}.webp`): PrestasiApiItem => ({
  id,
  name,
  image: link === null ? null : { link },
});

describe('toPrestasiCards', () => {
  it('ambil maksimal 4 prestasi terbaru dengan urutan dari API', () => {
    const data = ['e', 'd', 'c', 'b', 'a'].map((id) => item(id));
    const cards = toPrestasiCards(data, PRESTASI_BERANDA_LIMIT);
    expect(PRESTASI_BERANDA_LIMIT).toBe(4);
    expect(cards.map((c) => c.id)).toEqual(['e', 'd', 'c', 'b']);
  });

  it('tautan kartu menuju halaman detail prestasi', () => {
    const [card] = toPrestasiCards([item('abc123')], 4);
    expect(card.href).toBe(`${PRESTASI_LIST_HREF}/abc123`);
    expect(card.href).toBe('/darmasaba/prestasi-desa/abc123');
  });

  it('judul memakai field name (dirapikan spasinya) dan gambar dari image.link', () => {
    const [card] = toPrestasiCards([item('x', '  Juara 1 Lomba Desa  ', '/api/img/x-mobile.webp')], 4);
    expect(card.name).toBe('Juara 1 Lomba Desa');
    expect(card.imageUrl).toBe('/api/img/x-mobile.webp');
  });

  it('prestasi tanpa gambar → imageUrl undefined (tile tampil latar gelap)', () => {
    const cards = toPrestasiCards([item('a', 'A', null), { id: 'b', name: 'B', image: { link: '' } }], 4);
    expect(cards.map((c) => c.imageUrl)).toEqual([undefined, undefined]);
  });

  it('data kosong/null → tanpa kartu', () => {
    expect(toPrestasiCards([], 4)).toEqual([]);
    expect(toPrestasiCards(null, 4)).toEqual([]);
    expect(toPrestasiCards(undefined, 4)).toEqual([]);
  });
});

describe('isWideCard', () => {
  it('jumlah genap → tidak ada kartu lebar', () => {
    expect([0, 1, 2, 3].map((i) => isWideCard(i, 4))).toEqual([false, false, false, false]);
  });

  it('jumlah ganjil → hanya kartu terakhir yang lebar', () => {
    expect([0, 1, 2].map((i) => isWideCard(i, 3))).toEqual([false, false, true]);
    expect(isWideCard(0, 1)).toBe(true);
  });
});

describe('PRESTASI_HERO_IMAGE', () => {
  it('srcset berisi 3 ukuran lokal (bukan hotlink)', () => {
    const entries = PRESTASI_HERO_IMAGE.srcSet.split(', ');
    expect(entries).toEqual([
      '/assets/images/prestasi/prestasi-hero-1280.webp 1280w',
      '/assets/images/prestasi/prestasi-hero-2048.webp 2048w',
      '/assets/images/prestasi/prestasi-hero-3200.webp 3200w',
    ]);
    expect(PRESTASI_HERO_IMAGE.src.startsWith('/assets/')).toBe(true);
  });
});
