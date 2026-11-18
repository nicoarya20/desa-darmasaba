// @vitest-environment node
// Foto kartu galeri Layanan & Potensi: lazy sebelum section mendekati layar; sesudahnya kartu di sekitar kartu
// aktif dimuat lebih awal supaya slide berikutnya tidak menampilkan kotak gelap.
import { describe, expect, it } from 'vitest';
import {
  GALLERY_IMAGE_SIZES,
  PRELOAD_DISTANCE,
  galleryImageLoading,
} from '@/app/(public)/_com/main-page/layanan-potensi/gallery-image.logic';

describe('galleryImageLoading', () => {
  it('belum mendekati layar: semua kartu lazy, termasuk kartu aktif', () => {
    for (const i of [0, 3, 6, 9, 14]) expect(galleryImageLoading(i, 6, 'feature', false)).toBe('lazy');
    for (const i of [0, 6, 10]) expect(galleryImageLoading(i, 6, 'tile', false)).toBe('lazy');
  });

  it('feature mendekati layar: aktif ±2 eager, lebih jauh lazy', () => {
    const eager = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((i) => galleryImageLoading(i, 6, 'feature', true) === 'eager');
    expect(eager).toEqual([4, 5, 6, 7, 8]);
  });

  it('tile mendekati layar: aktif ±4 eager, lebih jauh lazy', () => {
    const eager = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((i) => galleryImageLoading(i, 6, 'tile', true) === 'eager');
    expect(eager).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('jarak preload per varian', () => {
    expect(PRELOAD_DISTANCE).toEqual({ feature: 2, tile: 4 });
  });
});

describe('GALLERY_IMAGE_SIZES', () => {
  it('memuat tiga breakpoint (ponsel, tablet, desktop) per varian', () => {
    for (const variant of ['feature', 'tile'] as const) {
      const sizes = GALLERY_IMAGE_SIZES[variant];
      expect(sizes).toContain('(max-width: 734px)');
      expect(sizes).toContain('(max-width: 1068px)');
      expect(sizes.split(',')).toHaveLength(3);
    }
  });
});
