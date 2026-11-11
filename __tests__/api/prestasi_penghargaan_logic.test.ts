// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  countPages,
  isWideCard,
  safePage,
  toPrestasiItem,
  type PrestasiApiItem,
} from '@/app/darmasaba/_com/main-page/prestasi/prestasi.logic';

// test-only: bentuk meniru respons find-many prestasi desa (satu tabel, penghargaan = kategori "Penghargaan").
const api = (
  id: string,
  createdAt: string,
  name = `Item ${id}`,
  link: string | null = `/api/img/${id}.webp`,
  extra: Partial<PrestasiApiItem> = {},
): PrestasiApiItem => ({
  id,
  name,
  createdAt,
  image: link === null ? null : { link },
  kategori: { name: 'Olahraga dan Kepemudaan' },
  ...extra,
});

describe('toPrestasiItem', () => {
  it('semua entri (termasuk eks-penghargaan) ke detail prestasi dengan id yang sama', () => {
    expect(toPrestasiItem(api('p1', '2026-01-01')).href).toBe('/darmasaba/prestasi-desa/p1');
    const eks = api('h1', '2026-01-01', 'Penghargaan A', null, { kategori: { name: 'Penghargaan' } });
    expect(toPrestasiItem(eks).href).toBe('/darmasaba/prestasi-desa/h1');
  });

  it('source: kategori "Penghargaan" (trim, case-insensitive) → penghargaan; lainnya / tanpa kategori → prestasi', () => {
    expect(toPrestasiItem(api('a', '2026-01-01', 'A', null, { kategori: { name: ' penghargaan ' } })).source).toBe('penghargaan');
    expect(toPrestasiItem(api('b', '2026-01-01')).source).toBe('prestasi');
    expect(toPrestasiItem(api('c', '2026-01-01', 'C', null, { kategori: null })).source).toBe('prestasi');
  });

  it('dengan juara: kartu tetap sama seperti sebelumnya (judul = name, juara hanya di halaman detail)', () => {
    const withJuara = toPrestasiItem(
      api('h2', '2026-11-03T10:00:00.000Z', ' Desa Raih Juara ', null, {
        juara: 'Juara 1 Lomba Desa Provinsi Bali 2025',
        kategori: { name: 'Penghargaan' },
      }),
    );
    expect(withJuara).toEqual({
      id: 'h2',
      source: 'penghargaan',
      name: 'Desa Raih Juara',
      imageUrl: undefined,
      createdAt: Date.parse('2026-11-03T10:00:00.000Z'),
      href: '/darmasaba/prestasi-desa/h2',
    });
  });

  it('tanpa juara (null / tidak ada) → bentuk kartu identik', () => {
    const base = api('p3', '2026-11-03T10:00:00.000Z');
    expect(toPrestasiItem({ ...base, juara: null })).toEqual(toPrestasiItem(base));
    expect(Object.keys(toPrestasiItem(base)).sort()).toEqual(['createdAt', 'href', 'id', 'imageUrl', 'name', 'source']);
  });

  it('judul dirapikan, gambar dari image.link, createdAt jadi epoch ms (string maupun Date)', () => {
    const item = toPrestasiItem(api('p1', '2026-11-03T10:00:00.000Z', '  Juara 1  '));
    expect(item).toMatchObject({ id: 'p1', source: 'prestasi', name: 'Juara 1', imageUrl: '/api/img/p1.webp' });
    expect(item.createdAt).toBe(Date.parse('2026-11-03T10:00:00.000Z'));
    const fromDate = toPrestasiItem({ ...api('p2', '2026-01-01'), createdAt: new Date('2026-11-03T10:00:00.000Z') });
    expect(fromDate.createdAt).toBe(item.createdAt);
  });

  it('tanpa gambar / link kosong → imageUrl undefined', () => {
    expect(toPrestasiItem(api('a', '2026-01-01', 'A', null)).imageUrl).toBeUndefined();
    expect(toPrestasiItem({ ...api('b', '2026-01-01'), image: { link: '' } }).imageUrl).toBeUndefined();
  });
});

describe('safePage & countPages', () => {
  it('nomor halaman dibulatkan ke bawah, minimal 1', () => {
    expect(safePage(3)).toBe(3);
    expect(safePage(2.7)).toBe(2);
    expect(safePage(0)).toBe(1);
    expect(safePage(-4)).toBe(1);
    expect(safePage(Number.NaN)).toBe(1);
  });

  it('jumlah halaman minimal 1', () => {
    expect(countPages(0, 8)).toBe(1);
    expect(countPages(8, 8)).toBe(1);
    expect(countPages(9, 8)).toBe(2);
  });
});

describe('isWideCard', () => {
  it('genap → tak ada kartu lebar; ganjil → hanya kartu terakhir', () => {
    expect([0, 1, 2, 3].map((i) => isWideCard(i, 4))).toEqual([false, false, false, false]);
    expect([0, 1, 2].map((i) => isWideCard(i, 3))).toEqual([false, false, true]);
    expect(isWideCard(0, 1)).toBe(true);
  });
});
