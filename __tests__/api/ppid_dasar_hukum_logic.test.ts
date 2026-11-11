// @vitest-environment node
// Pengurai isi Dasar Hukum PPID: HTML daftar dari CMS → butir { nomor, perihal }.
import { describe, expect, it } from 'vitest';
import { parseDasarHukumItems } from '@/app/darmasaba/(pages)/ppid/dasar-hukum/_com/dasar-hukum.logic';

// test-only: semua isi di bawah fiktif.
describe('parseDasarHukumItems', () => {
  it('memisah penanda dan perihal pada "tentang" pertama saja', () => {
    const html = '<ul><li>PP Nomor 61 Tahun 2010 tentang Pelaksanaan UU 14 Tahun 2008 tentang Keterbukaan</li></ul>';
    expect(parseDasarHukumItems(html)).toEqual([
      { nomor: 'PP Nomor 61 Tahun 2010', perihal: 'Pelaksanaan UU 14 Tahun 2008 tentang Keterbukaan' },
    ]);
  });

  it('butir tanpa "tentang" → perihal null; pemisah tidak peka huruf besar', () => {
    expect(parseDasarHukumItems('<ol><li>UU Uji Nomor 1</li><li>Perda Uji TENTANG Arsip</li></ol>')).toEqual([
      { nomor: 'UU Uji Nomor 1', perihal: null },
      { nomor: 'Perda Uji', perihal: 'Arsip' },
    ]);
  });

  it('membuang tag sebaris, entitas, spasi berlebih, dan butir kosong', () => {
    const html = ' <ul class="x"><li><p><strong>UU&nbsp;Uji</strong>  Nomor 1 tentang A &amp; B</p></li><li><p></p></li></ul> ';
    expect(parseDasarHukumItems(html)).toEqual([{ nomor: 'UU Uji Nomor 1', perihal: 'A & B' }]);
  });

  it.each([
    ['paragraf biasa', '<p>UU Uji Nomor 1 tentang Arsip</p>'],
    ['dua daftar', '<ul><li>A</li></ul><ul><li>B</li></ul>'],
    ['daftar bersarang', '<ul><li>A<ul><li>B</li></ul></li></ul>'],
    ['butir bertautan', '<ul><li><a href="https://contoh.test">UU Uji</a></li></ul>'],
    ['teks di luar butir', '<ul>Catatan<li>A</li></ul>'],
    ['daftar kosong', '<ul></ul>'],
    ['string kosong', ''],
  ])('%s → null (pemanggil merender HTML apa adanya)', (_name, html) => {
    expect(parseDasarHukumItems(html)).toBeNull();
  });
});
