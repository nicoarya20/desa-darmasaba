// @vitest-environment node
// Admin DAK: detail menampilkan dokumen sebagai tabel ringkas per folder (Accordion), editor per folder.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenFolderView } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenFolderView';
import { DokumenFolderEditor } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenFolderEditor';
import { isiDraftFromDetail } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const dok = (id: string, judul: string, realName = `${id}.pdf`, mimeType = 'application/pdf'): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  createdAt: '2026-11-09T00:00:00.000Z',
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}`, realName, mimeType, size: 1024 },
});

const detail = {
  folders: [
    { id: 'fa', nama: 'Laporan Keuangan', urutan: 0, dokumen: [dok('a1', 'Laporan 2024'), dok('a2', 'Rekap', 'rekap.xlsx', 'application/gzip')] },
    { id: 'fb', nama: 'Surat Keputusan', urutan: 1, dokumen: [] },
  ],
  dokumenUmum: [dok('u1', 'Pengumuman')],
};

describe('DokumenFolderView (detail admin)', () => {
  it('satu Accordion item per folder + Umum, header berisi nama & jumlah dokumen', () => {
    const html = render(<DokumenFolderView programId="p1" {...detail} />);
    expect(html.match(/data-folder-key="/g)).toHaveLength(3);
    expect(html.indexOf('Laporan Keuangan')).toBeLessThan(html.indexOf('Surat Keputusan'));
    expect(html.indexOf('Surat Keputusan')).toBeLessThan(html.indexOf('>Umum<'));
    const counts = [...html.matchAll(/data-testid="jumlah-dokumen-folder"[\s\S]*?>(\d+)</g)].map((m) => m[1]);
    expect(counts).toEqual(['2', '0', '1']);
  });

  it('hanya folder pertama yang berisi dokumen terbuka; isinya tabel (no, judul, tipe, aksi) tanpa iframe inline', () => {
    const html = render(<DokumenFolderView programId="p1" {...detail} />);
    expect(html).toContain('<table');
    // folder lain tertutup → isinya belum dirender, halaman tidak memanjang
    expect([...html.matchAll(/data-dokumen-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['a1', 'a2']);
    expect(html).not.toContain('Pengumuman');
    expect(html).toContain('>XLSX<');
    expect(html).toContain('aria-label="Pratinjau Laporan 2024"');
    expect(html).toContain('aria-label="Unduh Rekap"');
    expect(html).not.toContain('<iframe');
  });

  it('tanpa folder & dokumen → pesan kosong', () => {
    expect(render(<DokumenFolderView programId="p1" folders={[]} dokumenUmum={[]} />)).toContain('Tidak ada dokumen tersedia');
  });

  it('halaman detail admin memakai DokumenFolderView dengan folders & dokumenUmum', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(__dirname, '../../src/app/admin/(dashboard)/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/[id]/page.tsx'),
      'utf8',
    );
    expect(src).toContain('programId={data.id} folders={data.folders ?? []}');
    expect(src).toContain('dokumenUmum={data.dokumenUmum ?? []}');
  });
});

describe('DokumenFolderEditor (create/edit admin)', () => {
  it('menampilkan pengelola folder, pilihan folder tujuan unggah, dan grup dokumen per folder', () => {
    const html = render(<DokumenFolderEditor value={isiDraftFromDetail(detail)} onChange={() => undefined} />);
    expect(html).toContain('Folder (2/30)');
    expect(html).toContain('Tambah folder');
    // Nama folder tampil sebagai teks ganti-nama-inline (InlineEditText), bukan <input> permanen.
    expect(html).toContain('aria-label="Nama folder 1: Laporan Keuangan. Ganti nama"');
    expect(html).toContain('Unggah ke folder');
    expect(html).toContain('Dokumen (3)');
    // Hapus folder kini lewat menu aksi folder (FolderActionsMenu), bukan tombol tersendiri.
    expect(html).toContain('aria-label="Aksi folder Laporan Keuangan"');
  });
});
