// @vitest-environment node
// Dokumen Desa Anti Korupsi: validasi payload & rencana sinkronisasi (fungsi murni).
import { describe, expect, it } from 'vitest';
import {
  DOKUMEN_JUDUL_MAX_LENGTH,
  DOKUMEN_MAX_PER_PROGRAM,
  fileExtension,
  isPdfMime,
  parseDokumenList,
  planDokumenSync,
  type DokumenParsed,
  type DokumenTersimpan,
} from '@/lib/desa-anti-korupsi-dokumen';

const doc = (over: Record<string, unknown> = {}) => ({ fileId: 'f1', judul: 'Perdes', urutan: 0, ...over });

describe('parseDokumenList', () => {
  it('menerima daftar valid, judul di-trim, id opsional dipertahankan, folder kosong = Umum (null)', () => {
    const res = parseDokumenList([
      doc({ judul: '  Perdes  ' }),
      doc({ id: 'd2', fileId: 'f2', urutan: 1, folder: { id: 'fa' } }),
      doc({ fileId: 'f3', urutan: 2, folder: { tempKey: 't1' } }),
    ]);
    expect(res).toEqual({
      ok: true,
      data: [
        { fileId: 'f1', judul: 'Perdes', urutan: 0, folder: null },
        { id: 'd2', fileId: 'f2', judul: 'Perdes', urutan: 1, folder: { id: 'fa' } },
        { fileId: 'f3', judul: 'Perdes', urutan: 2, folder: { tempKey: 't1' } },
      ],
    });
  });

  it('daftar kosong valid (folder boleh kosong)', () => {
    expect(parseDokumenList([])).toEqual({ ok: true, data: [] });
  });

  it.each([
    ['bukan array', { a: 1 }, 'Daftar dokumen tidak valid'],
    ['item bukan objek', [null], 'Dokumen #1 tidak valid'],
    ['judul kosong', [doc({ judul: '   ' })], 'Dokumen #1: judul wajib diisi'],
    ['fileId kosong', [doc({ fileId: '' })], 'Dokumen #1: file wajib diunggah'],
    ['urutan negatif', [doc({ urutan: -1 })], 'Dokumen #1: urutan harus bilangan bulat >= 0'],
    ['urutan pecahan', [doc({ urutan: 1.5 })], 'Dokumen #1: urutan harus bilangan bulat >= 0'],
    ['id kosong', [doc({ id: '' })], 'Dokumen #1: id tidak valid'],
    ['fileId ganda', [doc(), doc({ urutan: 1 })], 'Dokumen #2: file yang sama dipakai dua kali'],
    ['id ganda', [doc({ id: 'x' }), doc({ id: 'x', fileId: 'f2' })], 'Dokumen #2: dokumen terkirim dua kali'],
    ['folder id+tempKey', [doc({ folder: { id: 'a', tempKey: 'b' } })], 'Dokumen #1: folder harus berisi id atau tempKey'],
    ['folder bukan objek', [doc({ folder: 'fa' })], 'Dokumen #1: folder tidak valid'],
  ])('menolak %s', (_label, input, message) => {
    expect(parseDokumenList(input)).toEqual({ ok: false, message });
  });

  it('menolak judul terlalu panjang', () => {
    const res = parseDokumenList([doc({ judul: 'a'.repeat(DOKUMEN_JUDUL_MAX_LENGTH + 1) })]);
    expect(res).toEqual({ ok: false, message: `Dokumen #1: judul maksimal ${DOKUMEN_JUDUL_MAX_LENGTH} karakter` });
  });

  it('menolak lebih dari batas dokumen per program', () => {
    const input = Array.from({ length: DOKUMEN_MAX_PER_PROGRAM + 1 }, (_, i) => doc({ fileId: `f${i}`, urutan: i }));
    expect(parseDokumenList(input)).toEqual({
      ok: false,
      message: `Maksimal ${DOKUMEN_MAX_PER_PROGRAM} dokumen per program`,
    });
  });
});

describe('planDokumenSync', () => {
  const existing: DokumenTersimpan[] = [
    { id: 'a', fileId: 'fa', judul: 'A', urutan: 0, folderId: null },
    { id: 'b', fileId: 'fb', judul: 'B', urutan: 1, folderId: null },
    { id: 'c', fileId: 'fc', judul: 'C', urutan: 2, folderId: 'f1' },
  ];
  const asInput = (d: DokumenTersimpan): DokumenParsed => ({
    id: d.id,
    fileId: d.fileId,
    judul: d.judul,
    urutan: d.urutan,
    folder: d.folderId ? { id: d.folderId } : null,
  });

  it('tambah baru, ubah judul/urutan, hapus yang tidak dikirim', () => {
    const res = planDokumenSync(existing, [
      { id: 'c', fileId: 'fc', judul: 'C', urutan: 0, folder: { id: 'f1' } }, // naik ke atas
      { id: 'a', fileId: 'fa', judul: 'A revisi', urutan: 1, folder: null }, // ganti judul + turun
      { fileId: 'fn', judul: 'Baru', urutan: 2, folder: null }, // dokumen baru
    ]);
    expect(res).toEqual({
      ok: true,
      plan: {
        create: [{ fileId: 'fn', judul: 'Baru', urutan: 2, folder: null }],
        update: [
          { id: 'c', judul: 'C', urutan: 0, folder: { id: 'f1' } },
          { id: 'a', judul: 'A revisi', urutan: 1, folder: null },
        ],
        remove: ['b'],
      },
    });
  });

  it('tanpa perubahan → rencana kosong', () => {
    expect(planDokumenSync(existing, existing.map(asInput))).toEqual({
      ok: true,
      plan: { create: [], update: [], remove: [] },
    });
  });

  it('daftar kosong → semua dokumen lama dihapus', () => {
    const res = planDokumenSync(existing, []);
    expect(res.ok && res.plan.remove).toEqual(['a', 'b', 'c']);
  });

  it('program baru: semua item tanpa id menjadi create', () => {
    const res = planDokumenSync([], [{ fileId: 'f1', judul: 'X', urutan: 0, folder: null }]);
    expect(res).toEqual({
      ok: true,
      plan: { create: [{ fileId: 'f1', judul: 'X', urutan: 0, folder: null }], update: [], remove: [] },
    });
  });

  it('hanya pindah folder (judul & urutan sama) → tetap update', () => {
    const res = planDokumenSync(existing, [{ ...asInput(existing[0]), folder: { id: 'f1' } }, asInput(existing[1]), asInput(existing[2])]);
    expect(res.ok && res.plan.update).toEqual([{ id: 'a', judul: 'A', urutan: 0, folder: { id: 'f1' } }]);
  });

  it('menolak id yang bukan milik program', () => {
    expect(planDokumenSync(existing, [{ id: 'zz', fileId: 'fz', judul: 'Z', urutan: 0, folder: null }])).toEqual({
      ok: false,
      message: 'Dokumen tidak ditemukan pada program ini',
    });
  });

  it('menolak penggantian file pada dokumen lama', () => {
    const res = planDokumenSync(existing, [{ id: 'a', fileId: 'lain', judul: 'A', urutan: 0, folder: null }]);
    expect(res.ok).toBe(false);
  });
});

describe('isPdfMime', () => {
  it('hanya application/pdf yang bisa dipratinjau', () => {
    expect(isPdfMime('application/pdf')).toBe(true);
    expect(isPdfMime('application/gzip')).toBe(false);
    expect(isPdfMime(undefined)).toBe(false);
  });
});

describe('fileExtension', () => {
  it('ekstensi dari nama berkas, fallback subtipe mime, lalu "-"', () => {
    expect(fileExtension('Laporan.final.docx')).toBe('DOCX');
    expect(fileExtension('tanpa-ekstensi', 'application/pdf')).toBe('PDF');
    expect(fileExtension('.env', undefined)).toBe('-');
    expect(fileExtension(null, null)).toBe('-');
  });
});
