// @vitest-environment node
// Form admin DAK: kelola folder (tambah, ganti nama, hapus → Umum, urutan), pindah dokumen, payload satu PUT.
import { describe, expect, it } from 'vitest';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import {
  addFolder,
  folderNamaError,
  groupDrafts,
  isFolderListValid,
  isiDraftFromDetail,
  moveDraftToFolder,
  moveDraftWithinFolder,
  moveFolder,
  removeFolder,
  renameFolder,
  toIsiPayload,
  type IsiDraft,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';

const file = (id: string) => ({ id, link: `/l/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf' });
const dok = (id: string, judul: string) => ({ id, judul, urutan: 0, fileId: `x-${id}`, file: file(`x-${id}`) });

const saved = isiDraftFromDetail({
  folders: [
    { id: 'fa', nama: 'Laporan', urutan: 0, dokumen: [dok('a1', 'A1'), dok('a2', 'A2')] },
    { id: 'fb', nama: 'SK', urutan: 1, dokumen: [dok('b1', 'B1')] },
  ],
  dokumenUmum: [dok('u1', 'U1')],
});
const keys = (isi: IsiDraft) => groupDrafts(isi).map((g) => [g.key, g.dokumen.map((d) => d.key)]);

describe('isiDraftFromDetail & groupDrafts', () => {
  it('folder tersimpan memakai id sebagai key; Umum (null) selalu di akhir', () => {
    expect(saved.folders).toEqual([
      { key: 'fa', id: 'fa', nama: 'Laporan' },
      { key: 'fb', id: 'fb', nama: 'SK' },
    ]);
    expect(keys(saved)).toEqual([
      ['fa', ['a1', 'a2']],
      ['fb', ['b1']],
      [null, ['u1']],
    ]);
  });
});

describe('kelola folder', () => {
  it('addFolder memberi nama default unik', () => {
    const once = addFolder(saved);
    const twice = addFolder(once);
    expect(once.folders.at(-1)?.nama).toBe('Folder baru');
    expect(twice.folders.at(-1)?.nama).toBe('Folder baru 2');
    expect(twice.folders.at(-1)?.id).toBeUndefined();
  });

  it('removeFolder memindah dokumennya ke Umum, tidak menghapus dokumen', () => {
    const res = removeFolder(saved, 'fa');
    expect(res.folders.map((f) => f.key)).toEqual(['fb']);
    expect(res.dokumen).toHaveLength(saved.dokumen.length);
    expect(keys(res)).toEqual([
      ['fb', ['b1']],
      [null, ['u1', 'a1', 'a2']],
    ]);
  });

  it('renameFolder + folderNamaError: wajib, unik tanpa beda kapital/spasi', () => {
    expect(folderNamaError(renameFolder(saved, 'fb', '  ').folders, 'fb')).toBe('Nama folder wajib diisi');
    expect(folderNamaError(renameFolder(saved, 'fb', ' laporan ').folders, 'fb')).toBe('Nama folder sudah dipakai');
    expect(folderNamaError(renameFolder(saved, 'fb', 'Surat').folders, 'fb')).toBeNull();
    expect(isFolderListValid(renameFolder(saved, 'fb', 'LAPORAN').folders)).toBe(false);
  });

  it('isFolderListValid menolak lebih dari batas folder', () => {
    let isi: IsiDraft = { folders: [], dokumen: [] };
    for (let i = 0; i < FOLDER_MAX_PER_PROGRAM; i++) isi = addFolder(isi);
    expect(isFolderListValid(isi.folders)).toBe(true);
    expect(isFolderListValid(addFolder(isi).folders)).toBe(false);
  });

  it('moveFolder menukar urutan folder', () => {
    expect(moveFolder(saved, 1, -1).folders.map((f) => f.key)).toEqual(['fb', 'fa']);
  });
});

describe('pindah dokumen', () => {
  it('moveDraftToFolder memindah ke akhir folder tujuan (termasuk ke/dari Umum)', () => {
    expect(keys(moveDraftToFolder(saved, 'u1', 'fa'))).toEqual([
      ['fa', ['a1', 'a2', 'u1']],
      ['fb', ['b1']],
      [null, []],
    ]);
    expect(keys(moveDraftToFolder(saved, 'a1', null)).at(-1)).toEqual([null, ['u1', 'a1']]);
  });

  it('moveDraftWithinFolder hanya menukar dengan tetangga di folder yang sama', () => {
    expect(keys(moveDraftWithinFolder(saved, 'a2', -1))[0]).toEqual(['fa', ['a2', 'a1']]);
    expect(moveDraftWithinFolder(saved, 'a1', -1)).toBe(saved);
    expect(moveDraftWithinFolder(saved, 'b1', 1)).toBe(saved);
  });
});

describe('toIsiPayload', () => {
  it('folder lama → id, folder baru → tempKey; dokumen merujuk folder & urutan per folder', () => {
    const withNew = addFolder(renameFolder(saved, 'fa', ' Laporan 2025 '));
    const baru = withNew.folders.at(-1)!;
    const isi = moveDraftToFolder(withNew, 'u1', baru.key);
    const payload = toIsiPayload(isi);

    expect(payload.folders).toEqual([
      { id: 'fa', nama: 'Laporan 2025', urutan: 0 },
      { id: 'fb', nama: 'SK', urutan: 1 },
      { tempKey: baru.key, nama: 'Folder baru', urutan: 2 },
    ]);
    expect(payload.dokumen.map((d) => [d.id, d.urutan, d.folder])).toEqual([
      ['a1', 0, { id: 'fa' }],
      ['a2', 1, { id: 'fa' }],
      ['b1', 0, { id: 'fb' }],
      ['u1', 0, { tempKey: baru.key }],
    ]);
  });

  it('dokumen di Umum → folder null', () => {
    expect(toIsiPayload(saved).dokumen.find((d) => d.id === 'u1')?.folder).toBeNull();
  });
});
