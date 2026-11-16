// @vitest-environment node
// Modul bersama halaman program CMS Pendidikan: validasi respons, pemisah istilah, isi bagian, keadaan halaman,
// penggabungan hasil muat, dan loader Program Pendidikan Anak.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  tujuan: vi.fn(),
  unggulan: vi.fn(),
}));

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      pendidikan: {
        programpendidikananak: {
          tujuanprogram: { 'find-by-id': { get: h.tujuan } },
          programunggulan: { 'find-by-id': { get: h.unggulan } },
        },
      },
    },
  },
}));

import {
  programInfoOverall,
  readProgramInfoRecord,
  splitTerm,
  toProgramInfoContent,
  type ProgramInfoEntry,
} from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.logic';
import { toProgramInfoEntries } from '@/app/(public)/(pages)/pendidikan/_com/program-info/use-program-info';
import { PROGRAM_PENDIDIKAN_ANAK_LOADERS } from '@/app/(public)/(pages)/pendidikan/program-pendidikan-anak/_com/program-pendidikan-anak.source';

const passThrough = (html: string) => html;
const entry = (over: Partial<ProgramInfoEntry> = {}): ProgramInfoEntry => ({
  key: 'tujuan',
  title: 'Tujuan Program',
  html: '<ul><li><p>Satu</p></li></ul>',
  failed: false,
  ...over,
});

describe('readProgramInfoRecord', () => {
  it('mengembalikan judul + deskripsi dari respons sukses', () => {
    const body = { success: true, data: { id: 'edit', judul: 'Tujuan Program', deskripsi: '<p>x</p>', isActive: true } };
    expect(readProgramInfoRecord('tujuan', 200, body)).toEqual({ judul: 'Tujuan Program', deskripsi: '<p>x</p>' });
  });

  it('data null → null (CMS kosong, bukan galat)', () => {
    expect(readProgramInfoRecord('tujuan', 200, { success: true, data: null })).toBeNull();
  });

  it('success:false walau HTTP 200 → Error berkonteks', () => {
    expect(() => readProgramInfoRecord('tujuan', 200, { success: false, message: 'Record not found' })).toThrow(
      'find-by-id tujuan gagal (HTTP 200): Record not found',
    );
  });

  it('HTTP 500 tanpa body → Error dengan pesan cadangan', () => {
    expect(() => readProgramInfoRecord('unggulan', 500, null)).toThrow('find-by-id unggulan gagal (HTTP 500): respons tidak valid');
  });
});

describe('splitTerm', () => {
  it('memisahkan istilah pendek sebelum ": "', () => {
    expect(splitTerm('Bimbingan Belajar Gratis: Untuk siswa kurang mampu')).toEqual({
      term: 'Bimbingan Belajar Gratis',
      text: 'Untuk siswa kurang mampu',
    });
  });

  it('hanya memakai titik dua pertama', () => {
    expect(splitTerm('Jadwal: Senin pukul 16.00: tepat waktu')).toEqual({ term: 'Jadwal', text: 'Senin pukul 16.00: tepat waktu' });
  });

  it('tanpa titik dua, titik dua tanpa spasi, atau istilah bertanda baca → utuh', () => {
    expect(splitTerm('Pelatihan Digital untuk Anak dan Remaja')).toEqual({ term: null, text: 'Pelatihan Digital untuk Anak dan Remaja' });
    expect(splitTerm('Pukul 16:00 WITA')).toEqual({ term: null, text: 'Pukul 16:00 WITA' });
    expect(splitTerm('Bila hujan, kegiatan pindah: ke balai')).toEqual({ term: null, text: 'Bila hujan, kegiatan pindah: ke balai' });
  });

  it('istilah lebih dari 40 karakter atau keterangan kosong → utuh', () => {
    const long = `${'a'.repeat(41)}: isi`;
    expect(splitTerm(long)).toEqual({ term: null, text: long });
    expect(splitTerm('Lokasi: ')).toEqual({ term: null, text: 'Lokasi: ' });
  });
});

describe('toProgramInfoContent', () => {
  it('satu <ul> dengan <li><p> → butir teks polos, istilah dipisah', () => {
    const html =
      '<ul><li><p>Bimbingan Belajar Gratis: Untuk siswa kurang mampu</p></li><li><p>Beasiswa Anak Berprestasi &amp; Kurang Mampu</p></li></ul>';
    expect(toProgramInfoContent(html, passThrough)).toEqual({
      kind: 'list',
      items: [
        { term: 'Bimbingan Belajar Gratis', text: 'Untuk siswa kurang mampu' },
        { term: null, text: 'Beasiswa Anak Berprestasi & Kurang Mampu' },
      ],
    });
  });

  it('isi campuran (paragraf + daftar) → HTML lewat sanitizer', () => {
    const html = '<p>Pengantar</p><ul><li><p>Butir</p></li></ul>';
    const sanitize = vi.fn(() => '<p>bersih</p>');
    expect(toProgramInfoContent(html, sanitize)).toEqual({ kind: 'html', html: '<p>bersih</p>' });
    expect(sanitize).toHaveBeenCalledWith(html);
  });

  it('null, string kosong, atau tersaring habis → empty', () => {
    expect(toProgramInfoContent(null, passThrough)).toEqual({ kind: 'empty' });
    expect(toProgramInfoContent('   ', passThrough)).toEqual({ kind: 'empty' });
    expect(toProgramInfoContent('<p></p>', () => '')).toEqual({ kind: 'empty' });
  });
});

describe('programInfoOverall', () => {
  it('semua gagal → error', () => {
    expect(programInfoOverall([entry({ failed: true }), entry({ key: 'b', failed: true })], passThrough)).toBe('error');
  });

  it('semua kosong → empty; gagal + kosong → tiap bagian tampil', () => {
    expect(programInfoOverall([entry({ html: null }), entry({ key: 'b', html: '' })], passThrough)).toBe('empty');
    expect(programInfoOverall([entry({ html: null }), entry({ key: 'b', failed: true })], passThrough)).toBe('sections');
  });

  it('render kustom (content) dihitung berisi', () => {
    expect(programInfoOverall([{ ...entry({ html: null }), content: 'x' }], passThrough)).toBe('sections');
  });
});

describe('toProgramInfoEntries', () => {
  const loaders = [
    { key: 'a', title: 'Cadangan A', load: vi.fn() },
    { key: 'b', title: 'Cadangan B', load: vi.fn() },
    { key: 'c', title: 'Cadangan C', load: vi.fn() },
  ];

  it('judul CMS dipakai bila ada; kosong/gagal → label cadangan; urutan = urutan loader', () => {
    const entries = toProgramInfoEntries(loaders, [
      { status: 'fulfilled', value: { judul: ' Tujuan Program ', deskripsi: '<p>x</p>' } },
      { status: 'fulfilled', value: null },
      { status: 'rejected', reason: new Error('x') },
    ]);
    expect(entries).toEqual([
      { key: 'a', title: 'Tujuan Program', html: '<p>x</p>', failed: false },
      { key: 'b', title: 'Cadangan B', html: null, failed: false },
      { key: 'c', title: 'Cadangan C', html: null, failed: true },
    ]);
  });
});

describe('PROGRAM_PENDIDIKAN_ANAK_LOADERS', () => {
  beforeEach(() => {
    h.tujuan.mockReset();
    h.unggulan.mockReset();
  });

  it('urutan Tujuan → Unggulan, memanggil find-by-id dengan id baris CMS', async () => {
    h.tujuan.mockResolvedValue({ status: 200, data: { success: true, data: { judul: 'Tujuan Program', deskripsi: '<p>t</p>' } } });
    h.unggulan.mockResolvedValue({ status: 200, data: { success: true, data: { judul: 'Program Unggulan', deskripsi: '<p>u</p>' } } });
    expect(PROGRAM_PENDIDIKAN_ANAK_LOADERS.map((l) => l.key)).toEqual(['tujuan', 'unggulan']);
    await expect(PROGRAM_PENDIDIKAN_ANAK_LOADERS[0].load()).resolves.toEqual({ judul: 'Tujuan Program', deskripsi: '<p>t</p>' });
    await expect(PROGRAM_PENDIDIKAN_ANAK_LOADERS[1].load()).resolves.toEqual({ judul: 'Program Unggulan', deskripsi: '<p>u</p>' });
    expect(h.tujuan).toHaveBeenCalledWith({ query: { id: 'edit' } });
    expect(h.unggulan).toHaveBeenCalledWith({ query: { id: 'edit' } });
  });

  it('respons gagal → loader menolak dengan Error berkonteks', async () => {
    h.tujuan.mockResolvedValue({ status: 500, data: null });
    await expect(PROGRAM_PENDIDIKAN_ANAK_LOADERS[0].load()).rejects.toThrow('program pendidikan anak: tujuan program');
  });
});
