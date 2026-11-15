// @vitest-environment node
// Pengurai isi CMS "Jenis Program" (Pendidikan Non Formal) dan pembaca respons find-by-id.
import { describe, expect, it, vi } from 'vitest';

// test-only: find-by-id palsu per entitas; mencatat query yang dikirim.
const { calls, findById } = vi.hoisted(() => {
  const calls: { entitas: string; query: unknown }[] = [];
  const findById = (entitas: string, judul: string) => ({
    'find-by-id': {
      get: async ({ query }: { query: unknown }) => {
        calls.push({ entitas, query });
        return { status: 200, data: { success: true, data: { judul, deskripsi: `<ul><li>${entitas}</li></ul>` } } };
      },
    },
  });
  return { calls, findById };
});
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      pendidikan: {
        pendidikannonformal: {
          tujuanpendidikannonformal: findById('tujuan', 'Tujuan Program'),
          jenisprogramyangdiselenggarakan: findById('jenis', 'Tempat Kegiatan'),
          tempatkegiatan: findById('tempat', 'Tempat Kegiatan'),
        },
      },
    },
  },
}));

import { parseJenisProgram } from '@/app/(public)/(pages)/pendidikan/pendidikan-non-formal/_com/jenis-program.logic';
import {
  JENIS_PROGRAM_KEY,
  PENDIDIKAN_NON_FORMAL_LOADERS,
} from '@/app/(public)/(pages)/pendidikan/pendidikan-non-formal/_com/pendidikan-non-formal.source';

// test-only: bentuk sama dengan seed/stg (pengantar + pasangan "N) Nama" dan daftar keterangan).
const SEED_HTML =
  '<p>Program uji meliputi:</p>' +
  '<p>1) Keaksaraan Uji</p><ul><li><p>Untuk warga uji</p></li></ul>' +
  '<p>2) Kursus &amp; Pelatihan Uji</p><ul><li><p>Keterangan A</p></li><li><p>Keterangan B</p></li></ul>';

describe('parseJenisProgram', () => {
  it('memisahkan pengantar, nama program (tanpa nomor ketikan), dan keterangan', () => {
    expect(parseJenisProgram(SEED_HTML)).toEqual({
      pengantar: ['Program uji meliputi:'],
      items: [
        { nama: 'Keaksaraan Uji', keterangan: ['Untuk warga uji'] },
        { nama: 'Kursus & Pelatihan Uji', keterangan: ['Keterangan A', 'Keterangan B'] },
      ],
    });
  });

  it('membuang berbagai bentuk nomor ketikan tapi tidak memotong angka di tengah nama', () => {
    const html = '<p>1. Paket A</p><ul><li>x</li></ul><p>2 - Kelas 10 Hari</p><ul><li>y</li></ul>';
    expect(parseJenisProgram(html)?.items.map((i) => i.nama)).toEqual(['Paket A', 'Kelas 10 Hari']);
  });

  it('tanpa pengantar dan dengan <ol> keterangan tetap terurai', () => {
    const html = '<p>Program Uji</p><ol><li>Satu</li></ol>';
    expect(parseJenisProgram(html)).toEqual({ pengantar: [], items: [{ nama: 'Program Uji', keterangan: ['Satu'] }] });
  });

  it('paragraf tanpa daftar setelah program pertama = program tanpa keterangan; <p></p> kosong diabaikan', () => {
    const html = '<p>Intro</p><p></p><p>1) A</p><ul><li>ket</li></ul><p>2) B</p>';
    expect(parseJenisProgram(html)).toEqual({
      pengantar: ['Intro'],
      items: [
        { nama: 'A', keterangan: ['ket'] },
        { nama: 'B', keterangan: [] },
      ],
    });
  });

  it.each([
    ['kosong', ''],
    ['null', null],
    ['hanya paragraf', '<p>Satu</p><p>Dua</p>'],
    ['daftar tanpa nama di atasnya', '<ul><li>Program A</li></ul>'],
    ['tautan di nama', '<p><a href="https://contoh.test">A</a></p><ul><li>x</li></ul>'],
    ['daftar bersarang', '<p>A</p><ul><li>x<ul><li>y</li></ul></li></ul>'],
    ['tag lain', '<h2>Judul</h2><p>A</p><ul><li>x</li></ul>'],
    ['teks liar di luar blok', 'teks<p>A</p><ul><li>x</li></ul>'],
  ])('%s → null (fallback HTML)', (_, html) => {
    expect(parseJenisProgram(html)).toBeNull();
  });
});

describe('PENDIDIKAN_NON_FORMAL_LOADERS', () => {
  it('urut Tujuan → Jenis Program → Tempat Kegiatan dengan label cadangan', () => {
    expect(PENDIDIKAN_NON_FORMAL_LOADERS.map((l) => [l.key, l.title])).toEqual([
      ['tujuan', 'Tujuan Program'],
      [JENIS_PROGRAM_KEY, 'Jenis Program'],
      ['tempat', 'Tempat Kegiatan'],
    ]);
  });

  it('tiap loader memanggil find-by-id entitasnya sendiri (id seed "edit") dan mengembalikan record', async () => {
    calls.length = 0;
    const records = await Promise.all(PENDIDIKAN_NON_FORMAL_LOADERS.map((l) => l.load()));
    expect(calls).toEqual([
      { entitas: 'tujuan', query: { id: 'edit' } },
      { entitas: 'jenis', query: { id: 'edit' } },
      { entitas: 'tempat', query: { id: 'edit' } },
    ]);
    // Judul CMS diteruskan apa adanya (judul Jenis Program yang salah dibetulkan admin, bukan kode).
    expect(records[1]).toEqual({ judul: 'Tempat Kegiatan', deskripsi: '<ul><li>jenis</li></ul>' });
  });
});
