// @vitest-environment node
// Logika Kontak Darurat Kesehatan: jenis nomor, href tel:/wa.me, format tampil, deskripsi → teks, cari di klien.
import { describe, expect, it } from 'vitest';
import {
  filterKontak,
  phoneInfo,
  toPlainText,
  type KontakDarurat,
} from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.logic';

describe('phoneInfo', () => {
  it('seluler 08xx → tel +62, wa.me 628xx, kelompok 4 digit', () => {
    expect(phoneInfo('081239580000')).toEqual({
      kind: 'mobile',
      display: '0812 3958 0000',
      telHref: 'tel:+6281239580000',
      waHref: 'https://wa.me/6281239580000',
    });
  });

  it('seluler dengan +62, spasi, dan tanda hubung tetap dikenali', () => {
    const info = phoneInfo('+62 896-4703-7430');
    expect(info?.kind).toBe('mobile');
    expect(info?.telHref).toBe('tel:+6289647037430');
    expect(info?.waHref).toBe('https://wa.me/6289647037430');
    expect(info?.display).toBe('0896 4703 7430');
  });

  it('telepon tetap 0361 → hanya tel, tanpa WhatsApp, kode wilayah dalam kurung', () => {
    expect(phoneInfo('03618463263')).toEqual({
      kind: 'landline',
      display: '(0361) 846 3263',
      telHref: 'tel:+623618463263',
      waHref: null,
    });
  });

  it('kode wilayah 2 digit (021) dipisah benar', () => {
    expect(phoneInfo('021 5551234')?.display).toBe('(021) 555 1234');
  });

  it('nomor layanan pendek (119) → tel apa adanya, tanpa WhatsApp', () => {
    expect(phoneInfo('119')).toEqual({ kind: 'service', display: '119', telHref: 'tel:119', waHref: null });
  });

  it('kosong / tanpa digit → null', () => {
    expect(phoneInfo('')).toBeNull();
    expect(phoneInfo(null)).toBeNull();
    expect(phoneInfo(undefined)).toBeNull();
    expect(phoneInfo(' - ')).toBeNull();
  });
});

describe('toPlainText', () => {
  it('meratakan tag blok dan entitas', () => {
    expect(toPlainText('<p>Layanan 24&nbsp;jam</p><p>A &amp; B</p>')).toBe('Layanan 24 jam A & B');
  });

  it('&amp;lt; tidak didekode dua kali', () => {
    expect(toPlainText('&amp;lt;b&amp;gt;')).toBe('&lt;b&gt;');
  });

  it('kosong → string kosong', () => {
    expect(toPlainText(null)).toBe('');
  });
});

// test-only: bentuk respons kesehatan/kontakdarurat/find-many.
const items: KontakDarurat[] = [
  { id: 'a', name: 'Kantor Desa Darmasaba', deskripsi: '<p>Kontak awal rujukan</p>', whatsapp: '081239580000' },
  { id: 'b', name: 'UPTD Puskesmas Abiansemal III', deskripsi: '<p>Layanan 24 jam</p>', whatsapp: '03618463263' },
];

describe('filterKontak', () => {
  it('kosong → semua', () => {
    expect(filterKontak(items, '  ')).toHaveLength(2);
  });

  it('nama & deskripsi, abaikan huruf besar/kecil dan spasi ganda', () => {
    expect(filterKontak(items, 'PUSKESMAS   abiansemal').map((i) => i.id)).toEqual(['b']);
    expect(filterKontak(items, '24 jam').map((i) => i.id)).toEqual(['b']);
  });

  it('digit nomor (dengan pemisah) cocok dengan nomor tersimpan', () => {
    expect(filterKontak(items, '0361').map((i) => i.id)).toEqual(['b']);
    expect(filterKontak(items, '0812-3958').map((i) => i.id)).toEqual(['a']);
  });

  it('tag HTML deskripsi tidak ikut dicari', () => {
    expect(filterKontak(items, 'p>')).toHaveLength(0);
  });
});
