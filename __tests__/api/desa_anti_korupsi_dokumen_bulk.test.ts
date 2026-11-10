// @vitest-environment node
// Form admin DAK: aksi massal dokumen/folder (hapus, pindah, salin, duplikat folder) + upload berkas bersama.
import { describe, expect, it, vi } from 'vitest';
import { FOLDER_MAX_PER_PROGRAM, FOLDER_NAMA_MAX_LENGTH } from '@/lib/desa-anti-korupsi-folder';
import {
  copyDrafts,
  copyFolderContents,
  deleteDrafts,
  duplicateFileError,
  duplicateFolder,
  moveDrafts,
  uniqueFolderNama,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-bulk';
import {
  uploadPendingDrafts,
  type DokumenDraft,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import {
  groupDrafts,
  toIsiPayload,
  type IsiDraft,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';

const saved = (key: string, folderKey: string | null, fileId = `f-${key}`): DokumenDraft => ({
  key,
  id: key,
  folderKey,
  fileId,
  judul: `Judul ${key}`,
  link: `/l/${fileId}`,
  mimeType: 'application/pdf',
  realName: `${fileId}.pdf`,
});
const pending = (key: string, folderKey: string | null, file: File): DokumenDraft => ({
  key,
  folderKey,
  judul: `Judul ${key}`,
  file,
  mimeType: file.type,
  realName: file.name,
});
const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });

const isi = (): IsiDraft => ({
  folders: [
    { key: 'fa', id: 'fa', nama: 'Laporan' },
    { key: 'fb', id: 'fb', nama: 'SK' },
  ],
  dokumen: [saved('a1', 'fa'), saved('b1', 'fb'), saved('a2', 'fa'), saved('u1', null), saved('a3', 'fa')],
});
const keysIn = (draft: IsiDraft, folderKey: string | null) =>
  draft.dokumen.filter((d) => d.folderKey === folderKey).map((d) => d.key);

describe('deleteDrafts', () => {
  it('membuang dokumen terpilih saja, urutan sisanya tetap', () => {
    const res = deleteDrafts(isi(), new Set(['a1', 'u1', 'tidak-ada']));
    expect(res.dokumen.map((d) => d.key)).toEqual(['b1', 'a2', 'a3']);
    expect(res.folders).toEqual(isi().folders);
  });

  it('dokumen tersimpan yang dihapus hilang dari payload (API men-soft-delete)', () => {
    const payload = toIsiPayload(deleteDrafts(isi(), new Set(['a2'])));
    expect(payload.dokumen.map((d) => d.id)).toEqual(['a1', 'b1', 'u1', 'a3']);
  });
});

describe('moveDrafts', () => {
  it('pindah ke akhir folder tujuan dengan urutan relatif terjaga; yang sudah di tujuan tidak bergeser', () => {
    const res = moveDrafts(isi(), new Set(['a3', 'b1', 'a1']), 'fb');
    expect(keysIn(res, 'fb')).toEqual(['b1', 'a1', 'a3']);
    expect(keysIn(res, 'fa')).toEqual(['a2']);
    expect(res.dokumen.find((d) => d.key === 'a1')).toMatchObject({ id: 'a1', folderKey: 'fb' });
  });

  it('pindah ke Umum (null) dan folder tujuan tak dikenal → tidak berubah', () => {
    expect(keysIn(moveDrafts(isi(), new Set(['a2', 'b1']), null), null)).toEqual(['u1', 'b1', 'a2']);
    const awal = isi();
    expect(moveDrafts(awal, new Set(['a1']), 'hilang')).toBe(awal);
    expect(moveDrafts(awal, new Set(['a1', 'a2']), 'fa')).toBe(awal);
  });
});

describe('copyDrafts', () => {
  it('salinan = draft baru tanpa id, berkas sama, di akhir folder tujuan; asli tidak berubah', () => {
    const awal = isi();
    const res = copyDrafts(awal, new Set(['a2', 'a1']), 'fb');
    expect(res).toMatchObject({ copied: 2, skipped: 0 });
    const fb = groupDrafts(res.isi).find((g) => g.key === 'fb')?.dokumen ?? [];
    expect(fb.map((d) => d.fileId)).toEqual(['f-b1', 'f-a1', 'f-a2']);
    const [, c1, c2] = fb;
    expect(c1.id).toBeUndefined();
    expect(c1).toMatchObject({ fileId: 'f-a1', judul: 'Judul a1', link: '/l/f-a1', realName: 'f-a1.pdf', mimeType: 'application/pdf' });
    expect(new Set([c1.key, c2.key, ...awal.dokumen.map((d) => d.key)]).size).toBe(awal.dokumen.length + 2);
    expect(keysIn(res.isi, 'fa')).toEqual(['a1', 'a2', 'a3']);
    expect(awal.dokumen).toHaveLength(5);
  });

  it('lewati dokumen bila folder tujuan sudah berisi fileId sama (termasuk antar salinan)', () => {
    const base: IsiDraft = { ...isi(), dokumen: [...isi().dokumen, saved('b2', 'fb', 'f-a1'), saved('u2', null, 'f-a2')] };
    const res = copyDrafts(base, new Set(['a1', 'a2', 'u2', 'b1']), 'fb');
    // a1 sudah ada di fb (b2), b1 sudah di fb, a2 disalin, u2 (fileId sama dengan a2) dilewati
    expect(res).toMatchObject({ copied: 1, skipped: 3 });
    expect(res.isi.dokumen.filter((d) => d.folderKey === 'fb').map((d) => d.fileId)).toEqual(['f-b1', 'f-a1', 'f-a2']);
  });

  it('draft belum diunggah: salinan berbagi objek File yang sama; File sama di tujuan dilewati', () => {
    const file = pdf('baru.pdf');
    const base: IsiDraft = { ...isi(), dokumen: [pending('n1', 'fa', file)] };
    const res = copyDrafts(base, new Set(['n1']), null);
    expect(res).toMatchObject({ copied: 1, skipped: 0 });
    const copy = res.isi.dokumen[1];
    expect(copy.file).toBe(file);
    expect(copy).toMatchObject({ folderKey: null, realName: 'baru.pdf' });
    expect(copy.fileId).toBeUndefined();
    expect(copyDrafts(res.isi, new Set(['n1']), null)).toMatchObject({ copied: 0, skipped: 1 });
  });

  it('tanpa yang disalin → isi sama persis', () => {
    const awal = isi();
    expect(copyDrafts(awal, new Set(['a1']), 'fa')).toEqual({ isi: awal, copied: 0, skipped: 1 });
    expect(copyDrafts(awal, new Set(['a1']), 'hilang')).toEqual({ isi: awal, copied: 0, skipped: 0 });
  });
});

describe('copyFolderContents', () => {
  it('menyalin seluruh isi folder asal dengan aturan lewati yang sama', () => {
    const base: IsiDraft = { ...isi(), dokumen: [...isi().dokumen, saved('b2', 'fb', 'f-a2')] };
    const res = copyFolderContents(base, 'fa', 'fb');
    expect(res).toMatchObject({ copied: 2, skipped: 1 });
    expect(res.isi.dokumen.filter((d) => d.folderKey === 'fb').map((d) => d.fileId)).toEqual(['f-b1', 'f-a2', 'f-a1', 'f-a3']);
  });

  it('dari Umum ke folder; asal = tujuan → tidak berubah', () => {
    expect(keysIn(copyFolderContents(isi(), null, 'fa').isi, 'fa')).toHaveLength(4);
    const awal = isi();
    expect(copyFolderContents(awal, 'fa', 'fa')).toEqual({ isi: awal, copied: 0, skipped: 0 });
  });
});

describe('uniqueFolderNama', () => {
  const folders = (...nama: string[]) => nama.map((n, i) => ({ key: `k${i}`, nama: n }));

  it('"X (salinan)", lalu "X (salinan 2)", "X (salinan 3)" — unik tanpa beda kapital/spasi', () => {
    expect(uniqueFolderNama(folders('Laporan'), 'Laporan (salinan)')).toBe('Laporan (salinan)');
    expect(uniqueFolderNama(folders('Laporan', ' laporan (SALINAN) '), 'Laporan (salinan)')).toBe('Laporan (salinan 2)');
    expect(uniqueFolderNama(folders('Laporan (salinan)', 'Laporan (salinan 2)'), 'Laporan (salinan)')).toBe('Laporan (salinan 3)');
  });

  it('memotong nama dasar agar ≤ batas panjang nama folder', () => {
    const panjang = 'a'.repeat(FOLDER_NAMA_MAX_LENGTH);
    const pertama = uniqueFolderNama([], `${panjang} (salinan)`);
    expect(pertama).toHaveLength(FOLDER_NAMA_MAX_LENGTH);
    expect(pertama.endsWith(' (salinan)')).toBe(true);
    const kedua = uniqueFolderNama(folders(pertama), `${panjang} (salinan)`);
    expect(kedua).toHaveLength(FOLDER_NAMA_MAX_LENGTH);
    expect(kedua.endsWith(' (salinan 2)')).toBe(true);
  });
});

describe('duplicateFolder', () => {
  it('folder baru tanpa id tepat setelah asal, berisi salinan dokumennya (tanpa id)', () => {
    const res = duplicateFolder(isi(), 'fa');
    expect(res.error).toBeNull();
    expect(res.isi.folders.map((f) => f.nama)).toEqual(['Laporan', 'Laporan (salinan)', 'SK']);
    const baru = res.isi.folders[1];
    expect(baru.id).toBeUndefined();
    expect(baru.key).toBe(res.folderKey);
    const isiBaru = res.isi.dokumen.filter((d) => d.folderKey === res.folderKey);
    expect(isiBaru.map((d) => d.fileId)).toEqual(['f-a1', 'f-a2', 'f-a3']);
    expect(isiBaru.every((d) => d.id === undefined)).toBe(true);
    const payload = toIsiPayload(res.isi);
    expect(payload.folders[1]).toEqual({ tempKey: res.folderKey, nama: 'Laporan (salinan)', urutan: 1 });
    expect(payload.dokumen.filter((d) => d.folder && 'tempKey' in d.folder).map((d) => d.urutan)).toEqual([0, 1, 2]);
  });

  it('duplikat kedua → nama "(salinan 2)"; folder tak dikenal → error', () => {
    const sekali = duplicateFolder(isi(), 'fa').isi;
    expect(duplicateFolder(sekali, 'fa').isi.folders[1].nama).toBe('Laporan (salinan 2)');
    const awal = isi();
    expect(duplicateFolder(awal, 'hilang')).toEqual({ isi: awal, folderKey: null, error: 'Folder tidak ditemukan' });
  });

  it(`di batas ${FOLDER_MAX_PER_PROGRAM} folder → isi tidak berubah, folderKey null, error`, () => {
    const penuh: IsiDraft = {
      folders: Array.from({ length: FOLDER_MAX_PER_PROGRAM }, (_, i) => ({ key: `f${i}`, nama: `Folder ${i}` })),
      dokumen: [saved('d1', 'f0')],
    };
    expect(duplicateFolder(penuh, 'f0')).toEqual({
      isi: penuh,
      folderKey: null,
      error: `Maksimal ${FOLDER_MAX_PER_PROGRAM} folder per program`,
    });
    expect(duplicateFolder({ ...penuh, folders: penuh.folders.slice(1) }, 'f1').error).toBeNull();
  });
});

describe('duplicateFileError', () => {
  it('null bila berkas unik per folder; pesan bila pindah massal membuat berkas ganda di satu folder', () => {
    const copied = copyDrafts(isi(), new Set(['a1']), 'fb').isi;
    expect(duplicateFileError(copied)).toBeNull();
    const ganda = moveDrafts(copied, new Set(['a1']), 'fb');
    expect(duplicateFileError(ganda)).toBe('Berkas dokumen "Judul a1" dipakai dua kali di folder "SK"');
    const file = pdf('x.pdf');
    expect(duplicateFileError({ folders: [], dokumen: [pending('n1', null, file), pending('n2', null, file)] })).toBe(
      'Berkas dokumen "Judul n2" dipakai dua kali di folder "Umum"',
    );
  });
});

describe('uploadPendingDrafts — berkas bersama', () => {
  it('draft yang berbagi objek File diunggah sekali, hasilnya dipakai bersama', async () => {
    const file = pdf('laporan.pdf');
    const lain = pdf('lain.pdf');
    const base: IsiDraft = { folders: isi().folders, dokumen: [pending('n1', 'fa', file), pending('n2', 'fa', lain)] };
    const { isi: disalin } = copyDrafts(base, new Set(['n1']), 'fb');
    const upload = vi.fn(async (f: File) => ({ id: `id-${f.name}`, link: `/l/${f.name}`, mimeType: f.type, realName: f.name }));

    const res = await uploadPendingDrafts([saved('a1', 'fa'), ...disalin.dokumen], upload);

    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload.mock.calls.map((c) => c[0])).toEqual([file, lain]);
    expect(res.map((d) => d.fileId)).toEqual(['f-a1', 'id-laporan.pdf', 'id-lain.pdf', 'id-laporan.pdf']);
    expect(res[3]).toMatchObject({ folderKey: 'fb', file: undefined, link: '/l/laporan.pdf', realName: 'laporan.pdf' });
    expect(toIsiPayload({ folders: isi().folders, dokumen: res }).dokumen.map((d) => d.folder)).toEqual([
      { id: 'fa' },
      { id: 'fa' },
      { id: 'fa' },
      { id: 'fb' },
    ]);
  });
});
