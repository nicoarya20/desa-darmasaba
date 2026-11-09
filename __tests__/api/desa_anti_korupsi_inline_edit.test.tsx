// @vitest-environment node
// Admin DAK: ganti nama inline judul dokumen & nama folder — aturan commit murni (trim, validasi, tak berubah)
// dan render komponen mode teks vs mode input. Interaksi keyboard/klik tidak teruji (env jsdom repo rusak).
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenDraftRow } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenDraftRow';
import { FolderManager } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/FolderManager';
import { InlineEditText } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/InlineEditText';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import { folderNamaError, renameFolder, type IsiDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';
import {
  judulDokumenError,
  resolveInlineCommit,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/inline-edit';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

// test-only fixture
const isi: IsiDraft = {
  folders: [
    { key: 'fa', id: 'fa', nama: 'Laporan' },
    { key: 'fb', id: 'fb', nama: 'Peraturan' },
  ],
  dokumen: [{ key: 'a1', id: 'a1', folderKey: 'fa', fileId: 'f1', judul: 'APBDes', realName: 'apbdes.pdf' }],
};
const folderValidate = (key: string) => (nama: string) => folderNamaError(renameFolder(isi, key, nama).folders, key);

describe('resolveInlineCommit', () => {
  it('nilai berubah → save dengan nilai ter-trim', () => {
    expect(resolveInlineCommit('Lama', '  Baru  ', judulDokumenError)).toEqual({ action: 'save', value: 'Baru' });
  });

  it('sama setelah trim → unchanged (tidak menulis draft)', () => {
    expect(resolveInlineCommit('Laporan', ' Laporan ', judulDokumenError)).toEqual({ action: 'unchanged' });
  });

  it('judul kosong → reject dengan pesan (nilai lama dipertahankan pemanggil)', () => {
    expect(resolveInlineCommit('APBDes', '   ', judulDokumenError)).toEqual({ action: 'reject', message: 'Judul wajib diisi' });
  });

  it('nama folder divalidasi folderNamaError: kosong & bentrok ditolak, nama unik disimpan', () => {
    const validate = folderValidate('fb');
    expect(resolveInlineCommit('Peraturan', '', validate)).toEqual({ action: 'reject', message: 'Nama folder wajib diisi' });
    expect(resolveInlineCommit('Peraturan', ' laporan ', validate)).toEqual({
      action: 'reject',
      message: 'Nama folder sudah dipakai',
    });
    expect(resolveInlineCommit('Peraturan', 'SK Kades', validate)).toEqual({ action: 'save', value: 'SK Kades' });
  });

  it('tanpa validate → hanya trim & bandingkan', () => {
    expect(resolveInlineCommit('a', '', undefined)).toEqual({ action: 'save', value: '' });
  });
});

describe('InlineEditText — mode tampilan vs input', () => {
  const base = { value: 'APBDes 2025', label: 'Judul dokumen 1', onSave: vi.fn(), validate: judulDokumenError };

  it('mode tampilan: teks dalam tombol ber-aria-label + ikon pensil, tanpa <input>', () => {
    const html = render(<InlineEditText {...base} />);
    expect(html).toContain('data-inline-edit="view"');
    expect(html).toContain('aria-label="Judul dokumen 1: APBDes 2025. Ganti nama"');
    expect(html).toContain('aria-label="Ganti Judul dokumen 1"');
    expect(html).toContain('>APBDes 2025<');
    expect(html).not.toContain('<input');
  });

  it('mode input (editing): <input> berisi nilai lama + petunjuk Enter/Esc', () => {
    const html = render(<InlineEditText {...base} editing />);
    const input = html.match(/<input[^>]*>/)?.[0] ?? '';
    expect(input).toContain('aria-label="Judul dokumen 1"');
    expect(input).toContain('value="APBDes 2025"');
    expect(input).toContain('data-inline-edit="input"');
    expect(html).toContain('Enter simpan · Esc batal');
    expect(html).not.toContain('data-inline-edit="view"');
  });

  it('error nilai saat ini tampil di mode tampilan (role="alert")', () => {
    const html = render(<InlineEditText {...base} value="" error="Judul wajib diisi" />);
    expect(html).toMatch(/role="alert"[^>]*>Judul wajib diisi</);
    expect(html).toContain('Judul dokumen 1: kosong. Ganti nama');
  });
});

describe('Pemakaian di editor', () => {
  it('baris draft menampilkan judul sebagai teks (bukan input) dengan aksi ganti nama', () => {
    const draft: DokumenDraft = isi.dokumen[0];
    const html = render(
      <DokumenDraftRow
        draft={draft}
        index={0}
        total={1}
        folderOptions={[{ value: 'fa', label: 'Laporan' }]}
        folderValue="fa"
        selected={false}
        onToggleSelect={vi.fn()}
        onJudul={vi.fn()}
        onFolder={vi.fn()}
        onMove={vi.fn()}
        onPreview={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(html).toContain('aria-label="Judul dokumen 1: APBDes. Ganti nama"');
    expect(html).not.toMatch(/<input[^>]*aria-label="Judul dokumen 1"/);
  });

  it('FolderManager: nama folder tampil sebagai teks + jumlah dokumen, tanpa input nama', () => {
    const html = render(<FolderManager value={isi} onChange={vi.fn()} />);
    expect(html).toContain('aria-label="Nama folder 1: Laporan. Ganti nama"');
    expect(html).toContain('aria-label="Ganti Nama folder 2"');
    expect(html).toContain('aria-label="1 dokumen"');
    expect(html).not.toMatch(/<input[^>]*aria-label="Nama folder/);
  });
});
