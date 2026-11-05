// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  buildLoopTrack,
  loopStart,
  normalizeLoopIndex,
  realIndex,
  swipeStep,
} from '@/app/darmasaba/_com/main-page/layanan-potensi/gallery.logic';

describe('buildLoopTrack', () => {
  it('mengulang item agar tiap sisi salinan tengah punya minimal buffer kartu', () => {
    const track = buildLoopTrack(['a', 'b', 'c'], 4);
    // ceil(4/3)=2 salinan per sisi → 5 salinan
    expect(track).toHaveLength(15);
    const start = loopStart(3, 4);
    expect(start).toBe(6);
    expect(track.slice(start, start + 3)).toEqual(['a', 'b', 'c']);
    expect(start).toBeGreaterThanOrEqual(4);
    expect(track.length - (start + 3)).toBeGreaterThanOrEqual(4);
  });

  it('cukup satu salinan per sisi bila item ≥ buffer', () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    expect(buildLoopTrack(items, 4)).toHaveLength(30);
    expect(loopStart(10, 4)).toBe(10);
  });

  it('tidak membuat loop untuk 0 atau 1 item', () => {
    expect(buildLoopTrack([], 4)).toEqual([]);
    expect(buildLoopTrack(['x'], 4)).toEqual(['x']);
    expect(loopStart(1, 4)).toBe(0);
    expect(loopStart(0, 4)).toBe(0);
  });
});

describe('realIndex', () => {
  it('memetakan indeks track ke item asli, termasuk indeks negatif', () => {
    expect(realIndex(13, 5)).toBe(3);
    expect(realIndex(-1, 5)).toBe(4);
    expect(realIndex(0, 0)).toBe(0);
  });

  it('item track sama dengan items[realIndex]', () => {
    const items = ['a', 'b', 'c', 'd'];
    const track = buildLoopTrack(items, 4);
    track.forEach((item, i) => expect(item).toBe(items[realIndex(i, items.length)]));
  });
});

describe('normalizeLoopIndex', () => {
  it('melompat dari ujung salinan tengah kembali ke awal tanpa ganti item', () => {
    // count 10, start 10: setelah maju dari 19 → 20 harus kembali ke 10
    expect(normalizeLoopIndex(20, 10, 4)).toBe(10);
    // mundur dari 10 → 9 harus ke 19
    expect(normalizeLoopIndex(9, 10, 4)).toBe(19);
    // indeks di salinan tengah tidak berubah
    expect(normalizeLoopIndex(15, 10, 4)).toBe(15);
  });

  it('menangani beberapa langkah cepat beruntun', () => {
    expect(normalizeLoopIndex(6 + 3 * 4, 3, 4)).toBe(6);
  });

  it('selalu 0 untuk item ≤ 1', () => {
    expect(normalizeLoopIndex(5, 1, 4)).toBe(0);
  });
});

describe('swipeStep', () => {
  it('geser ke kiri melewati ambang = maju, ke kanan = mundur', () => {
    expect(swipeStep(-80, 50)).toBe(1);
    expect(swipeStep(80, 50)).toBe(-1);
  });

  it('geser kecil di bawah ambang diabaikan', () => {
    expect(swipeStep(-20, 50)).toBe(0);
    expect(swipeStep(49, 50)).toBe(0);
  });
});

describe('gallery.module.css', () => {
  it('track tanpa padding agar flex-basis % dan translate % memakai acuan lebar yang sama', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(
      `${process.cwd()}/src/app/darmasaba/_com/main-page/layanan-potensi/gallery.module.css`,
      'utf8',
    );
    const trackRule = css.match(/\n\.track \{([^}]*)\}/)?.[1] ?? '';
    expect(trackRule).toContain('display: flex');
    expect(trackRule).not.toMatch(/padding/);
  });
});
