// @vitest-environment node
// Overlay detail Program Inovasi di beranda: baca respons findUnique, jumlah foto dari item rel, keadaan
// tampilan (kerangka / tidak tersedia / detail + galeri) dan navigasi foto tampilan besar.
import { describe, expect, it } from 'vitest';
import type { ProgramInovasiItem } from '@/app/(public)/_com/main-page/landing-page/HeroPrograms';
import {
  GALLERY_SKELETON_FALLBACK,
  GALLERY_SKELETON_MAX,
  SWIPE_THRESHOLD,
  dokumentasiPhotos,
  gallerySkeletonCount,
  overlayView,
  previewPhotoCount,
  readProgramDetail,
  stepPhoto,
  swipeStep,
  toProgramHead,
  type ProgramInovasiDetail,
} from '@/app/(public)/_com/main-page/landing-page/program-overlay/program-overlay.logic';

// test-only: berkas & program fiktif berbentuk respons API.
const file = (id: string, link: string) => ({
  id,
  name: `${id}.webp`,
  realName: `${id}.webp`,
  path: `/x/${id}`,
  mimeType: 'image/webp',
  size: 1,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  deletedAt: null,
  isActive: true,
  link,
  category: 'image',
});
const base = {
  id: 'p1',
  name: 'ANAK EMAS',
  description: '<p>Asuhan anak.</p>',
  imageId: 'logo',
  link: '-',
  createdAt: new Date(0),
  updatedAt: new Date(0),
  deletedAt: null,
  isActive: true,
};
const preview: ProgramInovasiItem = { ...base, image: file('logo', '/api/img/logo') };
const previewWithCount = (images: unknown) => ({ ...preview, _count: { images } }) as ProgramInovasiItem;
const detail: ProgramInovasiDetail = {
  ...base,
  name: 'ANAK EMAS (detail)',
  image: file('logo', '/api/img/logo'),
  images: [file('a', '/api/img/a'), file('b', ' '), file('c', '/api/img/c')],
};

describe('readProgramDetail', () => {
  it('200 + success + data aktif → data', () => {
    expect(readProgramDetail('p1', 200, { success: true, data: detail })).toBe(detail);
  });

  it('404, success:false, tanpa data, atau nonaktif → null (tidak ditemukan)', () => {
    expect(readProgramDetail('p1', 404, null)).toBeNull();
    expect(readProgramDetail('p1', 200, { success: false, message: 'x' })).toBeNull();
    expect(readProgramDetail('p1', 200, { success: true, data: null })).toBeNull();
    expect(readProgramDetail('p1', 200, { success: true, data: { ...detail, isActive: false } })).toBeNull();
  });

  it('status lain atau badan bukan objek → Error berkonteks id + HTTP', () => {
    expect(() => readProgramDetail('p9', 500, null)).toThrow(/program inovasi p9 .*HTTP 500/);
    expect(() => readProgramDetail('p9', 200, 'teks')).toThrow(/HTTP 200/);
  });
});

describe('jumlah foto dari item rel & kerangka galeri', () => {
  it('_count.images dibaca lewat type guard; bentuk lain → null', () => {
    expect(previewPhotoCount(previewWithCount(4))).toBe(4);
    expect(previewPhotoCount(previewWithCount(0))).toBe(0);
    expect(previewPhotoCount(preview)).toBeNull();
    expect(previewPhotoCount(previewWithCount('4'))).toBeNull();
    expect(previewPhotoCount(previewWithCount(-1))).toBeNull();
    expect(previewPhotoCount(null)).toBeNull();
  });

  it('kerangka: 0 → 0, tak diketahui → fallback, banyak → dibatasi', () => {
    expect(gallerySkeletonCount(0)).toBe(0);
    expect(gallerySkeletonCount(2)).toBe(2);
    expect(gallerySkeletonCount(null)).toBe(GALLERY_SKELETON_FALLBACK);
    expect(gallerySkeletonCount(40)).toBe(GALLERY_SKELETON_MAX);
  });
});

describe('dokumentasiPhotos & toProgramHead', () => {
  it('foto tanpa tautan dibuang, tautan di-trim, kunci = id', () => {
    expect(dokumentasiPhotos(detail.images)).toEqual([
      { key: 'a', link: '/api/img/a' },
      { key: 'c', link: '/api/img/c' },
    ]);
    expect(dokumentasiPhotos(undefined)).toEqual([]);
  });

  it('kepala: logo kosong → null, deskripsi null tetap null', () => {
    expect(toProgramHead(preview)).toEqual({ name: 'ANAK EMAS', logo: '/api/img/logo', description: '<p>Asuhan anak.</p>' });
    expect(toProgramHead({ ...preview, image: null, description: null })).toEqual({
      name: 'ANAK EMAS',
      logo: null,
      description: null,
    });
  });
});

describe('overlayView', () => {
  it('memuat tanpa preview → kerangka; galat/tidak ditemukan tanpa preview → tidak tersedia', () => {
    expect(overlayView('p1', undefined, null)).toEqual({ kind: 'skeleton' });
    expect(overlayView('p1', undefined, { id: 'p1', status: 'error' })).toEqual({ kind: 'unavailable' });
    expect(overlayView('p1', preview, { id: 'p1', status: 'ready', data: null })).toEqual({ kind: 'unavailable' });
  });

  it('memuat + preview → kepala preview seketika, kerangka sebanyak _count (0 → tanpa galeri)', () => {
    const view = overlayView('p1', previewWithCount(2), null);
    expect(view).toEqual({ kind: 'detail', head: toProgramHead(preview), gallery: { kind: 'loading', count: 2 } });
    expect(overlayView('p1', previewWithCount(0), null)).toMatchObject({ gallery: { kind: 'none' } });
    expect(overlayView('p1', preview, null)).toMatchObject({ gallery: { kind: 'loading', count: GALLERY_SKELETON_FALLBACK } });
  });

  it('galat + preview → detail tetap; kotak galat galeri hanya bila _count > 0', () => {
    const err = { id: 'p1', status: 'error' } as const;
    expect(overlayView('p1', previewWithCount(3), err)).toMatchObject({ kind: 'detail', gallery: { kind: 'error' } });
    expect(overlayView('p1', previewWithCount(0), err)).toMatchObject({ kind: 'detail', gallery: { kind: 'none' } });
    expect(overlayView('p1', preview, err)).toMatchObject({ kind: 'detail', gallery: { kind: 'none' } });
  });

  it('detail siap menggantikan preview; tanpa foto → galeri tidak dirender', () => {
    const ready = overlayView('p1', preview, { id: 'p1', status: 'ready', data: detail });
    expect(ready).toMatchObject({ kind: 'detail', head: { name: 'ANAK EMAS (detail)' }, gallery: { kind: 'photos' } });
    expect(overlayView('p1', undefined, { id: 'p1', status: 'ready', data: { ...detail, images: [] } })).toMatchObject({
      gallery: { kind: 'none' },
    });
  });

  it('hasil muat atau preview untuk id lain diabaikan (respons basi)', () => {
    expect(overlayView('p2', undefined, { id: 'p1', status: 'ready', data: detail })).toEqual({ kind: 'skeleton' });
    expect(overlayView('p2', preview, null)).toEqual({ kind: 'skeleton' });
  });
});

describe('navigasi tampilan besar', () => {
  it('sebelumnya/berikutnya berhenti di ujung', () => {
    expect(stepPhoto(0, -1, 3)).toBe(0);
    expect(stepPhoto(0, 1, 3)).toBe(1);
    expect(stepPhoto(2, 1, 3)).toBe(2);
    expect(stepPhoto(0, 1, 0)).toBe(0);
  });

  it('geser kiri = berikutnya, kanan = sebelumnya; pendek atau vertikal = diam', () => {
    expect(swipeStep(-SWIPE_THRESHOLD, 0)).toBe(1);
    expect(swipeStep(SWIPE_THRESHOLD + 10, 5)).toBe(-1);
    expect(swipeStep(SWIPE_THRESHOLD - 1, 0)).toBe(0);
    expect(swipeStep(-60, 80)).toBe(0);
  });
});
