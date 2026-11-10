// @vitest-environment node
// Pengurai daftar CMS bersama halaman PPID: HTML satu daftar → teks polos per butir.
import { describe, expect, it } from 'vitest';
import { parsePlainListItems } from '@/app/darmasaba/(pages)/ppid/_com/cms-list.logic';

// test-only: semua isi di bawah fiktif.
describe('parsePlainListItems', () => {
  it('<ol> dan <ul> → teks tiap butir, urutan dipertahankan', () => {
    expect(parsePlainListItems('<ol><li>Satu</li><li>Dua</li></ol>')).toEqual(['Satu', 'Dua']);
    expect(parsePlainListItems('<ul><li>A</li></ul>')).toEqual(['A']);
  });

  it('membuang tag sebaris, entitas, spasi berlebih, dan butir kosong', () => {
    const html = ' <ol class="x"><li><p><strong>Misi&nbsp;uji</strong>  A &amp; B</p></li><li><p></p></li></ol> ';
    expect(parsePlainListItems(html)).toEqual(['Misi uji A & B']);
  });

  it.each([
    ['paragraf biasa', '<p>Misi uji</p>'],
    ['dua daftar', '<ol><li>A</li></ol><ol><li>B</li></ol>'],
    ['daftar bersarang', '<ol><li>A<ul><li>B</li></ul></li></ol>'],
    ['butir bertautan', '<ol><li><a href="https://contoh.test">A</a></li></ol>'],
    ['teks di luar butir', '<ol>teks<li>A</li></ol>'],
    ['daftar kosong', '<ol></ol>'],
  ])('%s → null', (_name, html) => {
    expect(parsePlainListItems(html)).toBeNull();
  });
});
