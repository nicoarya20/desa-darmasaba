// @vitest-environment node
// Draft dokumen form admin DAK: urutan naik/turun, judul default, upload tertunda, payload API.
import { describe, expect, it, vi } from 'vitest';
import {
  draftsFromFiles,
  draftsFromSaved,
  isDraftListValid,
  judulFromFileName,
  moveDokumen,
  toDokumenPayload,
  uploadPendingDrafts,
  type DokumenDraft,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';

describe('moveDokumen', () => {
  const list = ['a', 'b', 'c'];

  it('naik (-1) menukar dengan item di atasnya', () => {
    expect(moveDokumen(list, 1, -1)).toEqual(['b', 'a', 'c']);
  });

  it('turun (+1) menukar dengan item di bawahnya', () => {
    expect(moveDokumen(list, 1, 1)).toEqual(['a', 'c', 'b']);
  });

  it('di ujung daftar tidak berubah, dan daftar asli tidak dimutasi', () => {
    expect(moveDokumen(list, 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveDokumen(list, 2, 1)).toEqual(['a', 'b', 'c']);
    expect(moveDokumen(list, 5, 1)).toEqual(['a', 'b', 'c']);
    expect(list).toEqual(['a', 'b', 'c']);
  });
});

describe('judulFromFileName', () => {
  it('membuang ekstensi terakhir', () => {
    expect(judulFromFileName('Laporan Pertanggungjawaban 2025.pdf')).toBe('Laporan Pertanggungjawaban 2025');
    expect(judulFromFileName('arsip.tar.gz')).toBe('arsip.tar');
  });

  it('tanpa ekstensi / file tersembunyi → nama utuh', () => {
    expect(judulFromFileName('README')).toBe('README');
    expect(judulFromFileName('.env')).toBe('.env');
  });
});

describe('draft dari berkas & data tersimpan', () => {
  it('draftsFromFiles: judul default, belum ber-fileId, key unik', () => {
    const files = [new File(['x'], 'a.pdf', { type: 'application/pdf' }), new File(['y'], 'b.docx')];
    const drafts = draftsFromFiles(files);
    expect(drafts.map((d) => d.judul)).toEqual(['a', 'b']);
    expect(drafts.every((d) => d.fileId === undefined && d.file instanceof File)).toBe(true);
    expect(new Set(drafts.map((d) => d.key)).size).toBe(2);
  });

  it('draftsFromSaved memetakan id, fileId, judul & info berkas', () => {
    const [draft] = draftsFromSaved([
      {
        id: 'd1',
        judul: 'Perdes',
        urutan: 0,
        fileId: 'f1',
        file: { id: 'f1', link: '/api/fileStorage/findUnique/x', realName: 'perdes.pdf', mimeType: 'application/pdf' },
      },
    ]);
    expect(draft).toEqual({
      key: 'd1',
      id: 'd1',
      fileId: 'f1',
      judul: 'Perdes',
      link: '/api/fileStorage/findUnique/x',
      mimeType: 'application/pdf',
      realName: 'perdes.pdf',
    });
  });

  it('isDraftListValid menolak judul kosong', () => {
    expect(isDraftListValid([{ key: 'k', judul: 'A' }])).toBe(true);
    expect(isDraftListValid([{ key: 'k', judul: '  ' }])).toBe(false);
  });
});

describe('uploadPendingDrafts + toDokumenPayload', () => {
  it('hanya mengunggah draft baru, lalu payload urutan = posisi', async () => {
    const pending = new File(['x'], 'baru.pdf', { type: 'application/pdf' });
    const drafts: DokumenDraft[] = [
      { key: 'd1', id: 'd1', fileId: 'f1', judul: 'Lama ' },
      { key: 'n1', judul: 'Baru', file: pending },
    ];
    const upload = vi.fn(async () => ({
      id: 'f-new',
      link: '/api/fileStorage/findUnique/new',
      mimeType: 'application/pdf',
      realName: 'baru.pdf',
    }));

    const uploaded = await uploadPendingDrafts(drafts, upload);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(pending);
    expect(uploaded[1]).toMatchObject({ fileId: 'f-new', file: undefined });

    expect(toDokumenPayload(uploaded)).toEqual([
      { id: 'd1', fileId: 'f1', judul: 'Lama', urutan: 0 },
      { fileId: 'f-new', judul: 'Baru', urutan: 1 },
    ]);
  });

  it('upload gagal → error diteruskan (tidak ditelan)', async () => {
    const upload = vi.fn(async () => {
      throw new Error('Gagal mengunggah dokumen "x.pdf"');
    });
    await expect(uploadPendingDrafts([{ key: 'n', judul: 'x', file: new File(['x'], 'x.pdf') }], upload)).rejects.toThrow(
      /x\.pdf/,
    );
  });

  it('toDokumenPayload menolak draft yang belum diunggah', () => {
    expect(() => toDokumenPayload([{ key: 'n', judul: 'Belum' }])).toThrow(/belum diunggah/);
  });
});
