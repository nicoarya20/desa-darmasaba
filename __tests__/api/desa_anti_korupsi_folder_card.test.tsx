// @vitest-environment node
// Halaman publik DAK: kartu program menampilkan isi folder (N dokumen), pratinjau PDF & unduh.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ProgramFolderCard } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramFolderCard';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const dok = (id: string, judul: string, mimeType = 'application/pdf'): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType },
});

const noop = () => undefined;

describe('ProgramFolderCard', () => {
  it('item dengan N dokumen → badge "N dokumen" dan N baris dokumen sesuai urutan', () => {
    const dokumen = [dok('a', 'Perdes APBDes'), dok('b', 'Laporan Realisasi'), dok('c', 'SK Tim', 'application/gzip')];
    const html = render(<ProgramFolderCard name="Program Transparansi" dokumen={dokumen} onPreview={noop} />);

    expect(html).toContain('Program Transparansi');
    expect(html).toContain('3 dokumen');
    expect(html.match(/data-dokumen-id="/g)).toHaveLength(3);
    expect(html.indexOf('Perdes APBDes')).toBeLessThan(html.indexOf('Laporan Realisasi'));
    expect(html.indexOf('Laporan Realisasi')).toBeLessThan(html.indexOf('SK Tim'));
  });

  it('tiap dokumen punya tautan unduh; pratinjau hanya untuk PDF', () => {
    const html = render(
      <ProgramFolderCard name="P" dokumen={[dok('a', 'PDF A'), dok('b', 'Arsip B', 'application/gzip')]} onPreview={noop} />,
    );
    expect(html).toContain('href="/api/fileStorage/findUnique/a"');
    expect(html).toContain('href="/api/fileStorage/findUnique/b"');
    expect(html).toContain('aria-label="Unduh PDF A"');
    expect(html).toContain('aria-label="Unduh Arsip B"');
    expect(html).toContain('aria-label="Pratinjau PDF A"');
    expect(html).not.toContain('aria-label="Pratinjau Arsip B"');
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
  });

  it('folder kosong → "0 dokumen" + pesan belum ada dokumen', () => {
    const html = render(<ProgramFolderCard name="P" dokumen={[]} onPreview={noop} />);
    expect(html).toContain('0 dokumen');
    expect(html).toContain('Belum ada dokumen');
    expect(html).not.toContain('data-dokumen-id');
  });
});

describe('halaman detail publik memakai kartu folder', () => {
  const src = readFileSync(
    path.resolve(__dirname, '../../src/app/darmasaba/(tambahan)/desa-anti-korupsi/detail/page.tsx'),
    'utf8',
  );

  it('kartu diberi daftar dokumen item, bukan lagi item.file tunggal', () => {
    expect(src).toContain('<ProgramFolderCard');
    expect(src).toContain('dokumen={item.dokumen ?? []}');
    expect(src).not.toContain('item.file');
  });
});
