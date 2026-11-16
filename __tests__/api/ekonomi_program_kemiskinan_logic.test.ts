// @vitest-environment node
// Program Pengentasan Kemiskinan publik: adapter item API (statistik diabaikan), cari di klien, URL daftar, pesan kosong.
import { describe, expect, it } from 'vitest';
import {
  filterProgramKemiskinan,
  programKemiskinanEmptyMessage,
  programKemiskinanListHref,
  toProgramKemiskinan,
  type ProgramKemiskinanApiItem,
} from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.logic';
import { PROGRAM_KEMISKINAN_TEXT as T } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.text';

// test-only: sanitize identitas karena DOMPurify butuh DOM.
const same = (html: string) => html;
const program = (over: Partial<ProgramKemiskinanApiItem> = {}) =>
  toProgramKemiskinan({ id: 'pk1', nama: 'Bantuan Langsung Tunai', deskripsi: '<p>Bantuan tunai bulanan</p>', icon: 'ekonomi', ...over }, same);

describe('toProgramKemiskinan', () => {
  it('judul dirapikan, HTML lewat sanitize, ikon dikenal dipertahankan, searchText huruf kecil', () => {
    expect(program({ nama: '  Bantuan Langsung Tunai ' })).toEqual({
      id: 'pk1',
      title: 'Bantuan Langsung Tunai',
      html: '<p>Bantuan tunai bulanan</p>',
      icon: 'ekonomi',
      searchText: 'bantuan langsung tunai bantuan tunai bulanan',
    });
  });

  it('sanitize dipanggil untuk deskripsi berisi', () => {
    const item = toProgramKemiskinan({ id: 'x', nama: 'A', deskripsi: '<p>x</p><script>1</script>' }, () => '<p>x</p>');
    expect(item.html).toBe('<p>x</p>');
  });

  it('ikon tak dikenal / kosong → tanpa ikon; deskripsi kosong / hanya tag → tanpa html', () => {
    expect(program({ icon: 'icon-test' }).icon).toBeUndefined();
    expect(program({ icon: null }).icon).toBeUndefined();
    expect(program({ deskripsi: '<p></p>' }).html).toBeUndefined();
    expect(program({ deskripsi: null }).html).toBeUndefined();
    expect(program({ deskripsi: null }).searchText).toBe('bantuan langsung tunai');
  });

  it('relasi statistik dari API tidak ikut ke bentuk tampilan', () => {
    const raw = { id: 'pk1', nama: 'A', statistik: { tahun: 2024, jumlah: 20 } } as ProgramKemiskinanApiItem;
    const item = toProgramKemiskinan(raw, same);
    expect(item).not.toHaveProperty('statistik');
    expect(JSON.stringify(item)).not.toContain('2024');
  });
});

describe('filterProgramKemiskinan', () => {
  const items = [
    program(),
    program({ id: 'pk2', nama: 'Bedah Rumah', deskripsi: '<p>Perbaikan rumah tidak layak huni</p>' }),
  ];

  it('semua kata harus cocok di nama atau deskripsi, tidak peka huruf besar', () => {
    expect(filterProgramKemiskinan(items, 'RUMAH layak').map((i) => i.id)).toEqual(['pk2']);
    expect(filterProgramKemiskinan(items, 'tunai').map((i) => i.id)).toEqual(['pk1']);
    expect(filterProgramKemiskinan(items, 'tunai rumah')).toEqual([]);
  });

  it('cari kosong → semua', () => {
    expect(filterProgramKemiskinan(items, '   ')).toHaveLength(2);
  });
});

describe('URL & pesan kosong', () => {
  it('programKemiskinanListHref: query hanya bila perlu', () => {
    expect(programKemiskinanListHref()).toBe('/ekonomi/program-kemiskinan');
    expect(programKemiskinanListHref({ search: ' ', page: 1 })).toBe('/ekonomi/program-kemiskinan');
    expect(programKemiskinanListHref({ search: 'bedah rumah', page: 2 })).toBe('/ekonomi/program-kemiskinan?search=bedah+rumah&page=2');
  });

  it('galat / cari tanpa hasil / belum ada data', () => {
    expect(programKemiskinanEmptyMessage('', true)).toBe(T.error);
    expect(programKemiskinanEmptyMessage(' zzz ', false)).toBe('Tidak ada program yang cocok dengan “zzz”.');
    expect(programKemiskinanEmptyMessage('', false)).toBe(T.empty);
  });
});
