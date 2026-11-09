// @vitest-environment node
// Logika murni tempat sampah & salin dokumen Desa Anti Korupsi: retensi 30 hari (batas tepat),
// sisa hari, tujuan pemulihan, dan rencana salin ke program lain (skip berkas yang sudah ada).
import { describe, expect, it } from 'vitest';
import {
  DAK_SAMPAH_RETENSI_HARI,
  isSampahKedaluwarsa,
  planPulihkan,
  resolveRetensiHari,
  sampahCutoff,
  sampahPurgeWhere,
  sisaHariSampah,
  toSampahItems,
  urutanAkhirFolder,
  type DokumenAktifRingkas,
} from '@/lib/desa-anti-korupsi-sampah';
import { parseSalinInput, planSalin, SALIN_MAX_DOKUMEN, type SalinInput } from '@/lib/desa-anti-korupsi-salin';

const HARI = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-09T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const aktif = (folderId: string | null, fileId: string, urutan: number): DokumenAktifRingkas => ({ folderId, fileId, urutan });

describe('retensi sampah', () => {
  it('konstanta default 30 hari; env valid menimpa, env kosong/tidak valid → 30', () => {
    expect(DAK_SAMPAH_RETENSI_HARI).toBe(30);
    expect(resolveRetensiHari(undefined)).toBe(30);
    expect(resolveRetensiHari('')).toBe(30);
    expect(resolveRetensiHari('abc')).toBe(30);
    expect(resolveRetensiHari('0')).toBe(30);
    expect(resolveRetensiHari('-3')).toBe(30);
    expect(resolveRetensiHari('2.5')).toBe(30);
    expect(resolveRetensiHari('7')).toBe(7);
  });

  it('cutoff = sekarang dikurangi retensi', () => {
    expect(sampahCutoff(NOW, 30).toISOString()).toBe('2026-10-10T12:00:00.000Z');
  });

  it('batas tepat 30 hari ikut kedaluwarsa; 1 ms sebelumnya belum', () => {
    expect(isSampahKedaluwarsa(ago(30 * HARI), NOW, 30)).toBe(true);
    expect(isSampahKedaluwarsa(ago(30 * HARI - 1), NOW, 30)).toBe(false);
    expect(isSampahKedaluwarsa(ago(31 * HARI), NOW, 30)).toBe(true);
    expect(isSampahKedaluwarsa(NOW, NOW, 30)).toBe(false);
  });

  it('sisaHari dibulatkan ke atas: baru dihapus 30, hampir 30 hari 1, tepat 30 hari 0, lewat tetap 0', () => {
    expect(sisaHariSampah(NOW, NOW, 30)).toBe(30);
    expect(sisaHariSampah(ago(1), NOW, 30)).toBe(30);
    expect(sisaHariSampah(ago(1 * HARI), NOW, 30)).toBe(29);
    expect(sisaHariSampah(ago(30 * HARI - 60_000), NOW, 30)).toBe(1);
    expect(sisaHariSampah(ago(30 * HARI), NOW, 30)).toBe(0);
    expect(sisaHariSampah(ago(45 * HARI), NOW, 30)).toBe(0);
  });

  it('filter purge: hanya dokumen nonaktif program ini dengan deletedAt <= cutoff', () => {
    expect(sampahPurgeWhere('p1', NOW, 30)).toEqual({
      desaAntiKorupsiId: 'p1',
      isActive: false,
      deletedAt: { lte: new Date('2026-10-10T12:00:00.000Z') },
    });
  });

  it('toSampahItems: folderNama dari relasi, buang baris tanpa deletedAt / kedaluwarsa', () => {
    const file = { id: 'f1', link: '/l/f1', realName: 'a.pdf', mimeType: 'application/pdf' };
    const items = toSampahItems(
      [
        { id: 'd1', judul: 'A', folderId: 'fo1', folder: { nama: 'Laporan' }, file, deletedAt: ago(2 * HARI) },
        { id: 'd2', judul: 'B', folderId: null, folder: null, file, deletedAt: ago(10 * HARI) },
        { id: 'd3', judul: 'C', folderId: null, folder: null, file, deletedAt: null },
        { id: 'd4', judul: 'D', folderId: null, folder: null, file, deletedAt: ago(30 * HARI) },
      ],
      NOW,
      30,
    );
    expect(items).toEqual([
      { id: 'd1', judul: 'A', folderId: 'fo1', folderNama: 'Laporan', file, deletedAt: ago(2 * HARI), sisaHari: 28 },
      { id: 'd2', judul: 'B', folderId: null, folderNama: null, file, deletedAt: ago(10 * HARI), sisaHari: 20 },
    ]);
  });
});

describe('urutanAkhirFolder', () => {
  it('urutan terbesar + 1 per folder; folder kosong → 0', () => {
    const rows = [aktif('fo1', 'a', 0), aktif('fo1', 'b', 4), aktif(null, 'c', 7)];
    expect(urutanAkhirFolder(rows, 'fo1')).toBe(5);
    expect(urutanAkhirFolder(rows, null)).toBe(8);
    expect(urutanAkhirFolder(rows, 'fo2')).toBe(0);
  });
});

describe('planPulihkan', () => {
  const doc = { fileId: 'f1', folderId: 'fo1', folderAktif: true, fileAktif: true };

  it('folder asal aktif & tanpa duplikat → kembali ke folder asal di urutan akhir', () => {
    expect(planPulihkan(doc, [aktif('fo1', 'f2', 3), aktif(null, 'f1', 9)])).toEqual({ ok: true, folderId: 'fo1', urutan: 4 });
  });

  it('folder asal sudah terhapus → ke Umum (akhir Umum)', () => {
    expect(planPulihkan({ ...doc, folderAktif: false }, [aktif(null, 'f9', 2)])).toEqual({ ok: true, folderId: null, urutan: 3 });
  });

  it('dokumen asal Umum → tetap Umum', () => {
    expect(planPulihkan({ ...doc, folderId: null, folderAktif: false }, [])).toEqual({ ok: true, folderId: null, urutan: 0 });
  });

  it('folder asal aktif sudah berisi berkas sama → gagal (tidak jatuh ke Umum)', () => {
    const res = planPulihkan(doc, [aktif('fo1', 'f1', 0)]);
    expect(res).toMatchObject({ ok: false });
    if (!res.ok) expect(res.message).toContain('folder asal');
  });

  it('folder asal terhapus & Umum sudah berisi berkas sama → gagal', () => {
    const res = planPulihkan({ ...doc, folderAktif: false }, [aktif(null, 'f1', 0)]);
    expect(res).toMatchObject({ ok: false });
    if (!res.ok) expect(res.message).toContain('Umum');
  });

  it('berkas sudah dihapus atau program penuh (50) → gagal', () => {
    expect(planPulihkan({ ...doc, fileAktif: false }, [])).toMatchObject({ ok: false });
    const penuh = Array.from({ length: 50 }, (_, i) => aktif(null, `x${i}`, i));
    expect(planPulihkan(doc, penuh)).toMatchObject({ ok: false });
  });
});

describe('parseSalinInput', () => {
  const body = { dokumenIds: ['d1', 'd2', 'd1'], targetProgramId: 'p2', targetFolderId: null };

  it('body valid → id unik dengan urutan dipertahankan', () => {
    expect(parseSalinInput(body)).toEqual({ ok: true, data: { dokumenIds: ['d1', 'd2'], targetProgramId: 'p2', targetFolderId: null } });
    expect(parseSalinInput({ ...body, targetFolderId: 'fo9' })).toMatchObject({ ok: true, data: { targetFolderId: 'fo9' } });
  });

  it.each([
    ['body bukan objek', null],
    ['dokumenIds kosong', { ...body, dokumenIds: [] }],
    ['dokumenIds bukan array', { ...body, dokumenIds: 'd1' }],
    ['dokumenIds melebihi batas', { ...body, dokumenIds: Array.from({ length: SALIN_MAX_DOKUMEN + 1 }, (_, i) => `d${i}`) }],
    ['id kosong', { ...body, dokumenIds: ['d1', ' '] }],
    ['program tujuan kosong', { ...body, targetProgramId: '' }],
    ['folder tujuan tidak dikirim', { dokumenIds: ['d1'], targetProgramId: 'p2' }],
    ['folder tujuan string kosong', { ...body, targetFolderId: '' }],
  ])('%s → gagal', (_label, input) => {
    expect(parseSalinInput(input)).toMatchObject({ ok: false });
  });

  it('tepat 50 id → valid', () => {
    const ids = Array.from({ length: SALIN_MAX_DOKUMEN }, (_, i) => `d${i}`);
    expect(parseSalinInput({ ...body, dokumenIds: ids })).toMatchObject({ ok: true });
  });
});

describe('planSalin', () => {
  const input: SalinInput = { dokumenIds: ['d1', 'd2', 'd3'], targetProgramId: 'p2', targetFolderId: 'fo2' };
  const sumber = [
    { id: 'd3', desaAntiKorupsiId: 'p1', fileId: 'f3', judul: 'Tiga' },
    { id: 'd1', desaAntiKorupsiId: 'p1', fileId: 'f1', judul: 'Satu' },
    { id: 'd2', desaAntiKorupsiId: 'p1', fileId: 'f2', judul: 'Dua' },
  ];

  it('salin sesuai urutan dokumenIds di akhir folder tujuan; berkas yang sudah ada di folder tujuan dilewati', () => {
    const target = [aktif('fo2', 'f2', 5), aktif(null, 'f1', 9), aktif('fo3', 'f3', 1)];
    expect(planSalin(input, sumber, target)).toEqual({
      ok: true,
      create: [
        { fileId: 'f1', judul: 'Satu', urutan: 6 },
        { fileId: 'f3', judul: 'Tiga', urutan: 7 },
      ],
      skipped: 1,
    });
  });

  it('dua dokumen sumber dengan berkas sama → hanya satu salinan', () => {
    const dobel = [...sumber, { id: 'd4', desaAntiKorupsiId: 'p3', fileId: 'f1', judul: 'Satu lagi' }];
    const res = planSalin({ ...input, dokumenIds: ['d1', 'd4'], targetFolderId: null }, dobel, []);
    expect(res).toEqual({ ok: true, create: [{ fileId: 'f1', judul: 'Satu', urutan: 0 }], skipped: 1 });
  });

  it('semua sudah ada → copied 0, skipped semua', () => {
    const target = [aktif('fo2', 'f1', 0), aktif('fo2', 'f2', 1), aktif('fo2', 'f3', 2)];
    expect(planSalin(input, sumber, target)).toEqual({ ok: true, create: [], skipped: 3 });
  });

  it('dokumen tidak ditemukan/nonaktif → 400', () => {
    expect(planSalin(input, sumber.slice(0, 2), [])).toMatchObject({ ok: false, status: 400 });
  });

  it('dokumen berasal dari program tujuan → 400', () => {
    expect(planSalin({ ...input, targetProgramId: 'p1' }, sumber, [])).toMatchObject({ ok: false, status: 400 });
  });

  it('program tujuan akan melebihi 50 dokumen → 409; tepat 50 masih boleh', () => {
    const isi = (n: number) => Array.from({ length: n }, (_, i) => aktif(null, `x${i}`, i));
    expect(planSalin(input, sumber, isi(48))).toMatchObject({ ok: false, status: 409 });
    expect(planSalin(input, sumber, isi(47))).toMatchObject({ ok: true });
  });
});
