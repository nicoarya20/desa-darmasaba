// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  countPages,
  isWideCard,
  mergeNewest,
  pageWindow,
  toPrestasiItem,
  type PrestasiApiItem,
} from '@/app/darmasaba/_com/main-page/prestasi/prestasi.logic';

// test-only: bentuk meniru respons find-many prestasi desa & penghargaan.
const api = (id: string, createdAt: string, name = `Item ${id}`, link: string | null = `/api/img/${id}.webp`): PrestasiApiItem => ({
  id,
  name,
  createdAt,
  image: link === null ? null : { link },
});

describe('toPrestasiItem', () => {
  it('href detail mengikuti sumbernya', () => {
    expect(toPrestasiItem(api('p1', '2026-01-01'), 'prestasi').href).toBe('/darmasaba/prestasi-desa/p1');
    expect(toPrestasiItem(api('h1', '2026-01-01'), 'penghargaan').href).toBe('/darmasaba/penghargaan/h1');
  });

  it('judul dirapikan, gambar dari image.link, createdAt jadi epoch ms (string maupun Date)', () => {
    const item = toPrestasiItem(api('p1', '2026-11-03T10:00:00.000Z', '  Juara 1  '), 'prestasi');
    expect(item).toMatchObject({ id: 'p1', source: 'prestasi', name: 'Juara 1', imageUrl: '/api/img/p1.webp' });
    expect(item.createdAt).toBe(Date.parse('2026-11-03T10:00:00.000Z'));
    const fromDate = toPrestasiItem({ ...api('p2', '2026-01-01'), createdAt: new Date('2026-11-03T10:00:00.000Z') }, 'prestasi');
    expect(fromDate.createdAt).toBe(item.createdAt);
  });

  it('tanpa gambar / link kosong → imageUrl undefined', () => {
    expect(toPrestasiItem(api('a', '2026-01-01', 'A', null), 'prestasi').imageUrl).toBeUndefined();
    expect(toPrestasiItem({ ...api('b', '2026-01-01'), image: { link: '' } }, 'penghargaan').imageUrl).toBeUndefined();
  });
});

describe('mergeNewest', () => {
  const prestasi = [api('p3', '2026-11-05'), api('p2', '2026-11-02'), api('p1', '2026-10-01')].map((i) => toPrestasiItem(i, 'prestasi'));
  const penghargaan = [api('h2', '2026-11-04'), api('h1', '2026-11-03')].map((i) => toPrestasiItem(i, 'penghargaan'));

  it('urut terbaru lintas sumber lalu dipotong', () => {
    expect(mergeNewest([prestasi, penghargaan], 0, 4).map((i) => i.id)).toEqual(['p3', 'h2', 'h1', 'p2']);
    expect(mergeNewest([prestasi, penghargaan], 4, 4).map((i) => i.id)).toEqual(['p1']);
  });

  it('waktu sama → urutan sumber dipertahankan (prestasi dulu)', () => {
    const a = toPrestasiItem(api('pa', '2026-11-03'), 'prestasi');
    const b = toPrestasiItem(api('hb', '2026-11-03'), 'penghargaan');
    expect(mergeNewest([[a], [b]], 0, 2).map((i) => i.id)).toEqual(['pa', 'hb']);
  });

  it('entri dengan id sama dari dua sumber tetap dua kartu berbeda (tidak disaring)', () => {
    const a = toPrestasiItem(api('x', '2026-11-03'), 'prestasi');
    const b = toPrestasiItem(api('x', '2026-11-03'), 'penghargaan');
    expect(mergeNewest([[a], [b]], 0, 4).map((i) => i.href)).toEqual(['/darmasaba/prestasi-desa/x', '/darmasaba/penghargaan/x']);
  });

  it('sumber kosong → hasil kosong', () => {
    expect(mergeNewest([[], []], 0, 4)).toEqual([]);
  });
});

describe('pageWindow & countPages', () => {
  it('halaman p ukuran n → ambil p×n teratas tiap sumber, offset (p−1)×n', () => {
    expect(pageWindow(1, 4)).toEqual({ fetchLimit: 4, offset: 0 });
    expect(pageWindow(3, 8)).toEqual({ fetchLimit: 24, offset: 16 });
    expect(pageWindow(0, 8)).toEqual({ fetchLimit: 8, offset: 0 });
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
