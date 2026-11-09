// @vitest-environment node
// Helper murni ZIP dokumen DAK: sanitasi, dedupe nama, path entri, batas 413, header unduhan.
import { describe, expect, it } from 'vitest';
import {
  attachmentDisposition,
  DAK_ZIP_DEFAULT_MAX_BYTES,
  dakZipMaxBytes,
  dedupeName,
  entryFileName,
  planZipEntries,
  sanitizeEntryName,
  slugify,
  zipFileName,
  zipLimitError,
} from '@/lib/desa-anti-korupsi-zip';

describe('sanitizeEntryName', () => {
  it.each([
    ['../../etc/passwd', '_.._etc_passwd'],
    ['..\\windows\\x.pdf', '_windows_x.pdf'],
    ['a:b*c?"d"<e>|f.pdf', 'a_b_c__d__e__f.pdf'],
    ['  ..  ', 'dokumen'],
    ['nama\u0000\u0007 berkas.pdf', 'nama berkas.pdf'],
    ['Laporan   APBDes\t2025.pdf', 'Laporan APBDes 2025.pdf'],
  ])('%j → %j', (input, expected) => {
    expect(sanitizeEntryName(input)).toBe(expected);
  });

  it('hasil tidak pernah memuat pemisah path dan panjang dibatasi dengan ekstensi dipertahankan', () => {
    const long = sanitizeEntryName(`${'x'.repeat(300)}.pdf`);
    expect(long.length).toBe(150);
    expect(long.endsWith('.pdf')).toBe(true);
    expect(sanitizeEntryName('a/b\\c')).not.toMatch(/[\\/]/);
  });
});

describe('dedupeName & entryFileName', () => {
  it('nama kembar (tanpa beda kapital) diberi akhiran " (2)", " (3)" sebelum ekstensi', () => {
    const used = new Set<string>();
    expect(['a.pdf', 'A.pdf', 'a.pdf', 'b'].map((n) => dedupeName(n, used))).toEqual(['a.pdf', 'A (2).pdf', 'a (3).pdf', 'b']);
  });

  it('judul + ekstensi berkas asli; ekstensi tidak digandakan; judul kosong → nama berkas', () => {
    expect(entryFileName('Laporan / 2025', 'x.PDF')).toBe('Laporan _ 2025.pdf');
    expect(entryFileName('Perdes.pdf', 'x.pdf')).toBe('Perdes.pdf');
    expect(entryFileName('Tanpa ekstensi', 'berkas')).toBe('Tanpa ekstensi');
    expect(entryFileName('  ', 'asli.docx')).toBe('asli.docx');
  });
});

describe('planZipEntries', () => {
  const f = (realName: string) => ({ realName, id: realName });

  it('subfolder per folder, nama kembar di-dedupe per folder, folder bernama sama setelah sanitasi dibedakan', () => {
    const entries = planZipEntries([
      { judul: 'Laporan', folderNama: 'Keuangan', file: f('a.pdf') },
      { judul: 'Laporan', folderNama: 'Keuangan', file: f('b.pdf') },
      { judul: 'Laporan', folderNama: 'Umum', file: f('c.pdf') },
      { judul: 'X', folderNama: 'A/B', file: f('d.pdf') },
      { judul: 'Y', folderNama: 'A_B', file: f('e.pdf') },
    ]);
    expect(entries.map((e) => e.path)).toEqual([
      'Keuangan/Laporan.pdf',
      'Keuangan/Laporan (2).pdf',
      'Umum/Laporan.pdf',
      'A_B/X.pdf',
      'A_B (2)/Y.pdf',
    ]);
    expect(entries[1].file.id).toBe('b.pdf');
  });

  it('folderNama null → entri di akar arsip', () => {
    expect(planZipEntries([{ judul: 'SK', folderNama: null, file: f('sk.pdf') }]).map((e) => e.path)).toEqual(['SK.pdf']);
  });
});

describe('batas ukuran', () => {
  it('default 100 MB; env bilangan bulat positif menimpa, nilai rusak diabaikan', () => {
    expect(DAK_ZIP_DEFAULT_MAX_BYTES).toBe(100 * 1024 * 1024);
    expect(dakZipMaxBytes(undefined)).toBe(DAK_ZIP_DEFAULT_MAX_BYTES);
    expect(dakZipMaxBytes('2048')).toBe(2048);
    expect(dakZipMaxBytes('abc')).toBe(DAK_ZIP_DEFAULT_MAX_BYTES);
    expect(dakZipMaxBytes('-5')).toBe(DAK_ZIP_DEFAULT_MAX_BYTES);
    expect(dakZipMaxBytes('1.5')).toBe(DAK_ZIP_DEFAULT_MAX_BYTES);
  });

  it('tepat di batas lolos; melebihi batas → pesan menyarankan unduh per dokumen', () => {
    expect(zipLimitError(100, 100)).toBeNull();
    expect(zipLimitError(150 * 1024 * 1024, 100 * 1024 * 1024)).toBe(
      'Ukuran total dokumen (150 MB) melebihi batas unduhan ZIP (100 MB). Silakan unduh per dokumen.',
    );
  });
});

describe('nama berkas ZIP & header', () => {
  it('slug program (+ "-<slug folder>")', () => {
    expect(slugify('Program Pencegahan Korupsi Désa 2025!')).toBe('program-pencegahan-korupsi-desa-2025');
    expect(slugify('***')).toBe('dokumen');
    expect(zipFileName('Program A')).toBe('program-a.zip');
    expect(zipFileName('Program A', 'Laporan Keuangan')).toBe('program-a-laporan-keuangan.zip');
  });

  it('Content-Disposition attachment dengan filename* RFC 5987', () => {
    expect(attachmentDisposition('program-a.zip')).toBe(`attachment; filename="program-a.zip"; filename*=UTF-8''program-a.zip`);
    expect(attachmentDisposition("dés'a (1).zip")).toBe(`attachment; filename="d_s'a (1).zip"; filename*=UTF-8''d%C3%A9s%27a%20%281%29.zip`);
  });
});
