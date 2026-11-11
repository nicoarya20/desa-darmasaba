// @vitest-environment node
// Admin DAK: hasil murni aksi massal editor (pindah/salin/hapus → isi baru, seleksi kosong, notifikasi),
// aksi folder (duplikat, salin isi), urutan Shift+klik, folder tujuan disabled, dan validasi Simpan.
import { describe, expect, it } from 'vitest';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import {
  bulkCopy,
  bulkDelete,
  bulkMove,
  copyFolderContentsAction,
  copyNotice,
  duplicateFolderAction,
  folderLabel,
  isIsiDraftValid,
  orderedDokumenKeys,
  sharedFolderKeys,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-bulk-actions';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import { groupDrafts, type IsiDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';

// test-only: dokumen tersimpan dengan fileId default unik per key.
const saved = (key: string, folderKey: string | null, fileId = `f-${key}`): DokumenDraft => ({
  key,
  id: key,
  folderKey,
  fileId,
  judul: `Judul ${key}`,
  mimeType: 'application/pdf',
  realName: `${fileId}.pdf`,
});

const isi = (): IsiDraft => ({
  folders: [
    { key: 'fa', id: 'fa', nama: 'Laporan' },
    { key: 'fb', id: 'fb', nama: 'Peraturan' },
  ],
  dokumen: [saved('a1', 'fa'), saved('a2', 'fa'), saved('b1', 'fb'), saved('u1', null)],
});

const keysIn = (value: IsiDraft, folderKey: string | null) =>
  value.dokumen.filter((d) => d.folderKey === folderKey).map((d) => d.key);

describe('orderedDokumenKeys', () => {
  it('urutan tampilan: folder berurutan lalu Umum terakhir, walau urutan array berbeda', () => {
    const value: IsiDraft = { ...isi(), dokumen: [saved('u1', null), saved('b1', 'fb'), saved('a1', 'fa')] };
    expect(orderedDokumenKeys(groupDrafts(value))).toEqual(['a1', 'b1', 'u1']);
  });
});

describe('sharedFolderKeys', () => {
  it('semua terpilih di satu folder → folder itu (termasuk Umum = null)', () => {
    expect(sharedFolderKeys(isi(), new Set(['a1', 'a2']))).toEqual(['fa']);
    expect(sharedFolderKeys(isi(), new Set(['u1']))).toEqual([null]);
  });

  it('terpilih di beberapa folder atau kosong → tidak ada yang disabled', () => {
    expect(sharedFolderKeys(isi(), new Set(['a1', 'b1']))).toEqual([]);
    expect(sharedFolderKeys(isi(), new Set())).toEqual([]);
  });
});

describe('copyNotice', () => {
  it('"N dokumen disalin" + jumlah dilewati bila ada', () => {
    expect(copyNotice({ copied: 3, skipped: 0 })).toEqual({ message: '3 dokumen disalin', tone: 'success' });
    expect(copyNotice({ copied: 2, skipped: 1 })).toEqual({
      message: '2 dokumen disalin, 1 dilewati karena sudah ada di folder tujuan',
      tone: 'success',
    });
  });

  it('tidak ada yang tersalin → nada info', () => {
    expect(copyNotice({ copied: 0, skipped: 2 })).toEqual({
      message: '0 dokumen disalin, 2 dilewati karena sudah ada di folder tujuan',
      tone: 'info',
    });
    expect(copyNotice({ copied: 0, skipped: 0 }).tone).toBe('info');
  });
});

describe('bulkMove', () => {
  it('memindahkan terpilih ke folder tujuan, mengosongkan seleksi, pesan memakai nama folder', () => {
    const out = bulkMove(isi(), new Set(['a1', 'u1']), 'fb');
    expect(keysIn(out.isi, 'fb')).toEqual(['b1', 'a1', 'u1']);
    expect(keysIn(out.isi, 'fa')).toEqual(['a2']);
    expect(out.selection.size).toBe(0);
    expect(out).toMatchObject({ message: '2 dokumen dipindahkan ke "Peraturan"', tone: 'success' });
  });

  it('yang sudah di folder tujuan tidak dihitung; semua sudah di sana → isi sama + info', () => {
    expect(bulkMove(isi(), new Set(['a1', 'b1']), 'fb').message).toBe('1 dokumen dipindahkan ke "Peraturan"');
    const awal = isi();
    const out = bulkMove(awal, new Set(['a1', 'a2']), 'fa');
    expect(out.isi).toBe(awal);
    expect(out.tone).toBe('info');
    expect(out.selection.size).toBe(0);
  });

  it('pindah ke Umum memakai label "Umum"', () => {
    expect(bulkMove(isi(), new Set(['a1']), null).message).toBe('1 dokumen dipindahkan ke "Umum"');
  });
});

describe('bulkCopy', () => {
  it('menyalin ke folder tujuan sebagai draft baru tanpa id, seleksi kosong, pesan copied', () => {
    const out = bulkCopy(isi(), new Set(['a1', 'u1']), 'fb');
    const copies = out.isi.dokumen.filter((d) => d.folderKey === 'fb' && d.key !== 'b1');
    expect(copies.map((d) => d.fileId)).toEqual(['f-a1', 'f-u1']);
    expect(copies.every((d) => d.id === undefined)).toBe(true);
    expect(out.isi.dokumen).toHaveLength(6);
    expect(out.selection.size).toBe(0);
    expect(out).toMatchObject({ message: '2 dokumen disalin', tone: 'success' });
  });

  it('berkas yang sudah ada di folder tujuan dilewati dan disebut di pesan', () => {
    const value: IsiDraft = { ...isi(), dokumen: [...isi().dokumen, saved('b2', 'fb', 'f-a1')] };
    const out = bulkCopy(value, new Set(['a1', 'a2']), 'fb');
    expect(out.message).toBe('1 dokumen disalin, 1 dilewati karena sudah ada di folder tujuan');
    expect(out.isi.dokumen).toHaveLength(value.dokumen.length + 1);
  });
});

describe('bulkDelete', () => {
  it('menghapus terpilih dari draft, seleksi kosong, pesan jumlah', () => {
    const out = bulkDelete(isi(), new Set(['a1', 'b1']));
    expect(out.isi.dokumen.map((d) => d.key)).toEqual(['a2', 'u1']);
    expect(out.selection.size).toBe(0);
    expect(out).toMatchObject({ message: '2 dokumen dihapus', tone: 'success' });
  });
});

describe('aksi folder', () => {
  it('duplikat folder → folder "(salinan)" tepat setelah asal berisi salinan dokumennya', () => {
    const out = duplicateFolderAction(isi(), 'fa');
    expect(out.tone).toBe('success');
    expect(out.message).toBe('Folder "Laporan (salinan)" dibuat');
    expect(out.isi.folders.map((f) => f.nama)).toEqual(['Laporan', 'Laporan (salinan)', 'Peraturan']);
    const baru = out.isi.folders[1].key;
    expect(out.isi.dokumen.filter((d) => d.folderKey === baru).map((d) => d.fileId)).toEqual(['f-a1', 'f-a2']);
  });

  it('duplikat saat folder sudah maksimal → isi tidak berubah + notifikasi error', () => {
    const penuh: IsiDraft = {
      folders: Array.from({ length: FOLDER_MAX_PER_PROGRAM }, (_, i) => ({ key: `f${i}`, nama: `Folder ${i}` })),
      dokumen: [],
    };
    const out = duplicateFolderAction(penuh, 'f0');
    expect(out.isi).toBe(penuh);
    expect(out).toMatchObject({ message: `Maksimal ${FOLDER_MAX_PER_PROGRAM} folder per program`, tone: 'error' });
  });

  it('salin isi folder ke folder lain → copied/skipped di pesan', () => {
    const value: IsiDraft = { ...isi(), dokumen: [...isi().dokumen, saved('b2', 'fb', 'f-a2')] };
    const out = copyFolderContentsAction(value, 'fa', 'fb');
    expect(out.message).toBe('1 dokumen disalin, 1 dilewati karena sudah ada di folder tujuan');
    expect(out.isi.dokumen.filter((d) => d.folderKey === 'fb').map((d) => d.fileId)).toEqual(['f-b1', 'f-a2', 'f-a1']);
  });

  it('folderLabel: Umum untuk null, "(tanpa nama)" untuk nama kosong', () => {
    const value: IsiDraft = { folders: [{ key: 'x', nama: '  ' }], dokumen: [] };
    expect(folderLabel(value, null)).toBe('Umum');
    expect(folderLabel(value, 'x')).toBe('(tanpa nama)');
  });
});

describe('isIsiDraftValid (validasi Simpan create & edit)', () => {
  it('isi normal valid', () => {
    expect(isIsiDraftValid(isi())).toBe(true);
  });

  it('dua dokumen berkas sama di satu folder (mis. hasil pindah massal) → tidak bisa disimpan', () => {
    const value: IsiDraft = { ...isi(), dokumen: [...isi().dokumen, saved('c1', null, 'f-a1')] };
    const moved = bulkMove(value, new Set(['c1']), 'fa').isi;
    expect(isIsiDraftValid(value)).toBe(true);
    expect(isIsiDraftValid(moved)).toBe(false);
  });

  it('judul kosong atau nama folder ganda tetap ditolak seperti sebelumnya', () => {
    expect(isIsiDraftValid({ ...isi(), dokumen: [{ ...saved('a1', 'fa'), judul: ' ' }] })).toBe(false);
    expect(isIsiDraftValid({ folders: [{ key: 'x', nama: 'A' }, { key: 'y', nama: 'a ' }], dokumen: [] })).toBe(false);
  });
});
