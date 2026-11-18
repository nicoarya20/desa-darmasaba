// @vitest-environment node
// Juknis lomba 5.4: foto /api/img/<nama> ditawarkan dalam beberapa lebar lewat ?size=; URL yang tidak bisa
// di-resize harus tetap apa adanya.
import { describe, expect, it } from 'vitest';
import { RESPONSIVE_IMAGE_WIDTHS, responsiveImageProps } from '@/app/(public)/_com/responsive-image.logic';

const SIZES = '(max-width: 734px) 100vw, 50vw';

describe('responsiveImageProps — foto /api/img', () => {
  it('menghasilkan srcSet 480/768/1280 + sizes pemanggil, src tetap berkas asli', () => {
    expect(responsiveImageProps('/api/img/abc-desktop.webp', SIZES)).toEqual({
      src: '/api/img/abc-desktop.webp',
      srcSet:
        '/api/img/abc-desktop.webp?size=480 480w, /api/img/abc-desktop.webp?size=768 768w, /api/img/abc-desktop.webp?size=1280 1280w',
      sizes: SIZES,
    });
  });

  it('daftar lebar bawaan terurut naik dan unik', () => {
    expect([...RESPONSIVE_IMAGE_WIDTHS]).toEqual([480, 768, 1280]);
  });

  it('lebar kustom diurutkan, diduplikasi, dan angka tidak valid dibuang', () => {
    const { srcSet } = responsiveImageProps('/api/img/a.png', SIZES, [768, 480, 768, 0, -5, 1.5, Number.NaN, 480]);
    expect(srcSet).toBe('/api/img/a.png?size=480 480w, /api/img/a.png?size=768 768w');
  });

  it('tanpa lebar valid → hanya src', () => {
    expect(responsiveImageProps('/api/img/a.webp', SIZES, [])).toEqual({ src: '/api/img/a.webp' });
    expect(responsiveImageProps('/api/img/a.webp', SIZES, [0, -1])).toEqual({ src: '/api/img/a.webp' });
  });

  it.each(['/api/img/a.jpg', '/api/img/a.JPEG', '/api/img/a.PNG'])('ekstensi %s didukung', (src) => {
    expect(responsiveImageProps(src, SIZES).srcSet).toContain(`${src}?size=480 480w`);
  });
});

describe('responsiveImageProps — tanpa srcSet', () => {
  it.each([
    ['URL eksternal', 'https://cdn.example.com/api/img/a.webp'],
    ['path lain', '/assets/images/darmasaba-icon.png'],
    ['sudah ber-query', '/api/img/a.webp?size=300'],
    ['query berakhiran ekstensi gambar', '/api/img/a.webp?next=b.png'],
    ['ber-hash', '/api/img/a.webp#x.png'],
    ['svg', '/api/img/a.svg'],
    ['gif', '/api/img/a.gif'],
    ['tanpa ekstensi', '/api/img/abc'],
    ['hanya prefix', '/api/img/'],
    ['string kosong', ''],
  ])('%s → hanya src apa adanya', (_label, src) => {
    expect(responsiveImageProps(src, SIZES)).toEqual({ src });
  });
});
