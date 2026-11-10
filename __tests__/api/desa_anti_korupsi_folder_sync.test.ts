// @vitest-environment node
// Folder dokumen DAK: validasi folder, rencana sinkron folder + dokumen (fungsi murni), bentuk respons.
import { describe, expect, it } from 'vitest';
import {
  FOLDER_MAX_PER_PROGRAM,
  FOLDER_NAMA_MAX_LENGTH,
  isFolderChanged,
  parseFolderList,
  parseFolderRef,
  planFolderSync,
  resolveFolderId,
  type FolderTersimpan,
} from '@/lib/desa-anti-korupsi-folder';
import { planProgramSync, type ProgramIsiTersimpan } from '@/lib/desa-anti-korupsi-sync';
import { toProgramDetail, toProgramRingkas } from '@/lib/desa-anti-korupsi-view';

const folders: FolderTersimpan[] = [
  { id: 'fa', nama: 'Laporan', urutan: 0 },
  { id: 'fb', nama: 'SK', urutan: 1 },
];
const existing: ProgramIsiTersimpan = {
  folders,
  dokumen: [
    { id: 'd1', fileId: 'f1', judul: 'Laporan 2025', urutan: 0, folderId: 'fa' },
    { id: 'd2', fileId: 'f2', judul: 'SK Tim', urutan: 0, folderId: 'fb' },
    { id: 'd3', fileId: 'f3', judul: 'Umum A', urutan: 0, folderId: null },
  ],
};
const keepDokumen = existing.dokumen.map(({ folderId, ...d }) => ({ ...d, folder: folderId ? { id: folderId } : null }));

describe('parseFolderRef', () => {
  it('kosong/null → Umum; id atau tempKey diterima', () => {
    expect(parseFolderRef(undefined)).toEqual({ ok: true, ref: null });
    expect(parseFolderRef(null)).toEqual({ ok: true, ref: null });
    expect(parseFolderRef({ id: 'fa' })).toEqual({ ok: true, ref: { id: 'fa' } });
    expect(parseFolderRef({ tempKey: 't1' })).toEqual({ ok: true, ref: { tempKey: 't1' } });
  });

  it('menolak id+tempKey sekaligus, objek kosong, string kosong, dan bukan objek', () => {
    expect(parseFolderRef({ id: 'a', tempKey: 'b' }).ok).toBe(false);
    expect(parseFolderRef({}).ok).toBe(false);
    expect(parseFolderRef({ id: ' ' })).toEqual({ ok: false, message: 'id folder tidak valid' });
    expect(parseFolderRef('fa')).toEqual({ ok: false, message: 'folder tidak valid' });
  });
});

describe('parseFolderList', () => {
  it('nama di-trim, id/tempKey dipertahankan', () => {
    expect(parseFolderList([{ id: 'fa', nama: ' Laporan ', urutan: 0 }, { tempKey: 't1', nama: 'Baru', urutan: 1 }])).toEqual({
      ok: true,
      data: [
        { id: 'fa', nama: 'Laporan', urutan: 0 },
        { tempKey: 't1', nama: 'Baru', urutan: 1 },
      ],
    });
  });

  it.each([
    ['bukan array', 'x', 'Daftar folder tidak valid'],
    ['nama kosong', [{ tempKey: 't', nama: '  ', urutan: 0 }], 'Folder #1: nama folder wajib diisi'],
    ['tanpa id/tempKey', [{ nama: 'A', urutan: 0 }], 'Folder #1: folder harus berisi id atau tempKey'],
    ['urutan negatif', [{ tempKey: 't', nama: 'A', urutan: -1 }], 'Folder #1: urutan harus bilangan bulat >= 0'],
    [
      'nama duplikat (abaikan kapital & spasi)',
      [{ id: 'fa', nama: 'Laporan', urutan: 0 }, { tempKey: 't', nama: '  laporan ', urutan: 1 }],
      'Folder #2: nama folder "laporan" sudah dipakai',
    ],
    ['tempKey ganda', [{ tempKey: 't', nama: 'A', urutan: 0 }, { tempKey: 't', nama: 'B', urutan: 1 }], 'Folder #2: folder terkirim dua kali'],
  ])('menolak %s', (_label, input, message) => {
    expect(parseFolderList(input)).toEqual({ ok: false, message });
  });

  it('menolak nama terlalu panjang dan lebih dari batas folder', () => {
    expect(parseFolderList([{ tempKey: 't', nama: 'a'.repeat(FOLDER_NAMA_MAX_LENGTH + 1), urutan: 0 }])).toEqual({
      ok: false,
      message: `Folder #1: nama folder maksimal ${FOLDER_NAMA_MAX_LENGTH} karakter`,
    });
    const many = Array.from({ length: FOLDER_MAX_PER_PROGRAM + 1 }, (_, i) => ({ tempKey: `t${i}`, nama: `F${i}`, urutan: i }));
    expect(parseFolderList(many)).toEqual({ ok: false, message: `Maksimal ${FOLDER_MAX_PER_PROGRAM} folder per program` });
    expect(parseFolderList(many.slice(0, FOLDER_MAX_PER_PROGRAM)).ok).toBe(true);
  });
});

describe('planFolderSync', () => {
  it('tempKey → create, rename & reorder → update, yang tidak dikirim → remove', () => {
    const res = planFolderSync(folders, [
      { tempKey: 't1', nama: 'Baru', urutan: 0 },
      { id: 'fa', nama: 'Laporan Tahunan', urutan: 1 },
    ]);
    expect(res).toEqual({
      ok: true,
      plan: {
        create: [{ tempKey: 't1', nama: 'Baru', urutan: 0 }],
        update: [{ id: 'fa', nama: 'Laporan Tahunan', urutan: 1 }],
        remove: ['fb'],
      },
    });
  });

  it('tanpa perubahan → rencana kosong; folder milik program lain ditolak', () => {
    expect(planFolderSync(folders, folders)).toEqual({ ok: true, plan: { create: [], update: [], remove: [] } });
    expect(planFolderSync(folders, [{ id: 'asing', nama: 'X', urutan: 0 }])).toEqual({
      ok: false,
      message: 'Folder tidak ditemukan pada program ini',
    });
  });
});

describe('planProgramSync', () => {
  it('hapus folder → dokumennya dikirim ke Umum (folder null) dan tercatat di update', () => {
    const res = planProgramSync(existing, {
      folders: [{ id: 'fa', nama: 'Laporan', urutan: 0 }],
      dokumen: keepDokumen.map((d) => (d.id === 'd2' ? { ...d, folder: null } : d)),
    });
    expect(res).toEqual({
      ok: true,
      plan: {
        folders: { create: [], update: [], remove: ['fb'] },
        dokumen: { create: [], update: [{ id: 'd2', judul: 'SK Tim', urutan: 0, folder: null }], remove: [] },
      },
    });
  });

  it('pindah dokumen antar folder lama dan ke folder baru (tempKey)', () => {
    const res = planProgramSync(existing, {
      folders: [...folders, { tempKey: 'baru', nama: 'Arsip', urutan: 2 }],
      dokumen: [
        { ...keepDokumen[0], folder: { id: 'fb' } },
        { ...keepDokumen[1], folder: { tempKey: 'baru' } },
        keepDokumen[2],
        { fileId: 'f9', judul: 'Dokumen Baru', urutan: 1, folder: { tempKey: 'baru' } },
      ],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.plan.folders?.create).toEqual([{ tempKey: 'baru', nama: 'Arsip', urutan: 2 }]);
    expect(res.plan.dokumen?.update).toEqual([
      { id: 'd1', judul: 'Laporan 2025', urutan: 0, folder: { id: 'fb' } },
      { id: 'd2', judul: 'SK Tim', urutan: 0, folder: { tempKey: 'baru' } },
    ]);
    expect(res.plan.dokumen?.create).toEqual([{ fileId: 'f9', judul: 'Dokumen Baru', urutan: 1, folder: { tempKey: 'baru' } }]);
  });

  it('folders tidak dikirim → folder tidak disentuh, rujukan id dicek ke folder tersimpan', () => {
    const ok = planProgramSync(existing, { dokumen: [{ ...keepDokumen[2], folder: { id: 'fa' } }, keepDokumen[0], keepDokumen[1]] });
    expect(ok.ok && ok.plan.folders).toBeNull();
    expect(ok.ok && ok.plan.dokumen?.update).toEqual([{ id: 'd3', judul: 'Umum A', urutan: 0, folder: { id: 'fa' } }]);
  });

  it('salinan berkas tersimpan ke folder lain → dokumen baru dengan fileId sama; di folder yang sama ditolak', () => {
    const salin = { fileId: 'f1', judul: 'Laporan 2025', urutan: 1 };
    const ok = planProgramSync(existing, { dokumen: [...keepDokumen, { ...salin, folder: { id: 'fb' } }] });
    expect(ok).toEqual({
      ok: true,
      plan: { folders: null, dokumen: { create: [{ ...salin, folder: { id: 'fb' } }], update: [], remove: [] } },
    });
    expect(planProgramSync(existing, { dokumen: [...keepDokumen, { ...salin, folder: { id: 'fa' } }] })).toEqual({
      ok: false,
      message: 'Dokumen #4: file yang sama dipakai dua kali di folder yang sama',
    });
  });

  it('dokumen tidak dikirim → hanya folder yang disinkronkan', () => {
    const res = planProgramSync(existing, { folders: [] });
    expect(res).toEqual({ ok: true, plan: { folders: { create: [], update: [], remove: ['fa', 'fb'] }, dokumen: null } });
  });

  it.each([
    ['folder yang dihapus', { folders: [folders[0]], dokumen: [{ ...keepDokumen[1] }] }, 'Dokumen #1: folder tidak ditemukan pada program ini'],
    ['folder program lain', { dokumen: [{ ...keepDokumen[0], folder: { id: 'asing' } }] }, 'Dokumen #1: folder tidak ditemukan pada program ini'],
    ['tempKey tidak ada di folders', { folders, dokumen: [{ ...keepDokumen[0], folder: { tempKey: 'x' } }] }, 'Dokumen #1: folder baru tidak ada di daftar folder'],
    ['tempKey tanpa daftar folders', { dokumen: [{ ...keepDokumen[0], folder: { tempKey: 'x' } }] }, 'Dokumen #1: folder baru tidak ada di daftar folder'],
    ['nama folder duplikat', { folders: [{ tempKey: 'a', nama: 'SK', urutan: 0 }, { id: 'fb', nama: 'sk', urutan: 1 }] }, 'Folder #2: nama folder "sk" sudah dipakai'],
  ])('menolak rujukan ke %s', (_label, input, message) => {
    expect(planProgramSync(existing, input)).toEqual({ ok: false, message });
  });
});

describe('isFolderChanged & resolveFolderId', () => {
  it('membandingkan folder tersimpan dengan rujukan', () => {
    expect(isFolderChanged(null, null)).toBe(false);
    expect(isFolderChanged('fa', { id: 'fa' })).toBe(false);
    expect(isFolderChanged('fa', null)).toBe(true);
    expect(isFolderChanged(null, { id: 'fa' })).toBe(true);
    expect(isFolderChanged('fa', { tempKey: 't' })).toBe(true);
  });

  it('tempKey diganti id folder yang baru dibuat; tempKey tak dikenal = error', () => {
    const created = new Map([['t1', 'folder-baru']]);
    expect(resolveFolderId(null, created)).toBeNull();
    expect(resolveFolderId({ id: 'fa' }, created)).toBe('fa');
    expect(resolveFolderId({ tempKey: 't1' }, created)).toBe('folder-baru');
    expect(() => resolveFolderId({ tempKey: 'x' }, created)).toThrow('tempKey "x"');
  });
});

describe('bentuk respons', () => {
  const kategori = { id: 'k1', name: 'KEARIFAN LOKAL', createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date(), isActive: true };
  const program = { id: 'p1', name: 'Program', deskripsi: '-', kategoriId: 'k1', kategori, createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date(), isActive: true };
  const file = (id: string) => ({ id, link: `/l/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size: 2048 });
const createdAt = new Date('2026-11-09T01:02:03.000Z');

  it('toProgramRingkas mengganti _count dengan jumlahFolder & jumlahDokumen', () => {
    const res = toProgramRingkas({ ...program, _count: { folders: 2, dokumen: 7 } });
    expect(res).toMatchObject({ id: 'p1', jumlahFolder: 2, jumlahDokumen: 7 });
    expect(res).not.toHaveProperty('_count');
  });

  it('toProgramDetail mengelompokkan dokumen per folder (urutan dipertahankan) dan sisanya ke dokumenUmum', () => {
    const res = toProgramDetail({
      ...program,
      folders: [
        { id: 'fa', nama: 'Laporan', urutan: 0 },
        { id: 'fb', nama: 'Kosong', urutan: 1 },
      ],
      dokumen: [
        { id: 'd1', judul: 'A', urutan: 0, fileId: 'x1', folderId: 'fa', createdAt, file: file('x1') },
        { id: 'd2', judul: 'B', urutan: 0, fileId: 'x2', folderId: null, createdAt, file: file('x2') },
        { id: 'd3', judul: 'C', urutan: 1, fileId: 'x3', folderId: 'fa', createdAt, file: file('x3') },
        { id: 'd4', judul: 'D', urutan: 0, fileId: 'x4', folderId: 'nonaktif', createdAt, file: file('x4') },
      ],
    });
    expect(res.folders.map((f) => [f.id, f.dokumen.map((d) => d.id)])).toEqual([
      ['fa', ['d1', 'd3']],
      ['fb', []],
    ]);
    expect(res.dokumenUmum.map((d) => d.id)).toEqual(['d2', 'd4']);
    expect(res.folders[0].dokumen[0]).toEqual({
      id: 'd1',
      judul: 'A',
      urutan: 0,
      fileId: 'x1',
      createdAt: '2026-11-09T01:02:03.000Z', // Date Prisma → ISO string
      file: { ...file('x1'), size: 2048 },
    });
    expect(res).not.toHaveProperty('dokumen');
  });
});
