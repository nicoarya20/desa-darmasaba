// @vitest-environment node
// Tampilan publik Pengumuman: gambar utama, galeri, dan daftar dokumen PDF (pratinjau + unduh);
// bagian kosong tidak dirender. Kabar Desa memakai tanggalTerbit. Markup via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PengumumanDokumenList } from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/PengumumanDokumenList';
import {
  PengumumanGambarUtama,
  PengumumanLampiranBawah,
  PengumumanThumbnail,
} from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/PengumumanLampiran';
import { toPengumumanItem } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (html: string, attr: string) => html.split(attr).length - 1;

// test-only: berkas lampiran
const file = (id: string, mimeType = 'application/pdf', size: number | null = 2 * 1024 ** 2) => ({
  id,
  link: `/api/fileStorage/findUnique/${id}`,
  realName: `${id}.pdf`,
  mimeType,
  size,
});
const gambar = (id: string) => ({ ...file(id, 'image/webp'), link: `/api/img/${id}.webp`, realName: `${id}.webp` });

describe('PengumumanDokumenList', () => {
  it('satu baris per dokumen dengan nama, ukuran, tombol pratinjau & unduh', () => {
    const html = render(<PengumumanDokumenList dokumen={[file('lelang'), file('kpm', 'application/pdf', null)]} />);
    expect(count(html, 'data-pengumuman-dokumen')).toBe(2);
    expect(html).toContain('Lampiran Dokumen');
    expect(html).toContain('lelang.pdf');
    expect(html).toContain('PDF · 2 MB');
    expect(count(html, 'Pratinjau')).toBe(2);
    expect(html).toContain('href="/api/fileStorage/findUnique/lelang"');
    expect(html).toContain('download="lelang.pdf"');
    // ukuran tidak diketahui → baris ukuran tidak ditampilkan
    expect(count(html, 'PDF · ')).toBe(1);
  });

  it('kosong / null tidak merender apa pun; judul null → tanpa heading', () => {
    expect(render(<PengumumanDokumenList dokumen={[]} />)).not.toContain('<section');
    expect(render(<PengumumanDokumenList dokumen={null} />)).not.toContain('Lampiran');
    expect(render(<PengumumanDokumenList dokumen={[file('a')]} judul={null} />)).not.toContain('<h2');
  });
});

describe('gambar & lampiran', () => {
  it('gambar utama dirender bila ada, dengan tautan ukuran penuh', () => {
    const html = render(<PengumumanGambarUtama image={gambar('poster')} judul="Lelang" />);
    expect(html).toContain('data-pengumuman-gambar-utama');
    expect(html).toContain('src="/api/img/poster.webp"');
    expect(render(<PengumumanGambarUtama image={null} judul="Lelang" />)).toBe(render(<></>));
  });

  it('thumbnail kartu hanya bila ada gambar', () => {
    expect(render(<PengumumanThumbnail image={gambar('t')} judul="x" />)).toContain('data-pengumuman-thumbnail');
    expect(render(<PengumumanThumbnail image={null} judul="x" />)).not.toContain('data-pengumuman-thumbnail');
  });

  it('lampiran bawah: galeri + dokumen; tanpa keduanya tidak dirender', () => {
    const html = render(<PengumumanLampiranBawah images={[gambar('g1'), gambar('g2')]} dokumen={[file('d1')]} />);
    expect(html).toContain('Galeri');
    expect(count(html, 'data-dokumentasi-item')).toBe(2);
    expect(count(html, 'data-pengumuman-dokumen')).toBe(1);

    const hanyaDokumen = render(<PengumumanLampiranBawah images={[]} dokumen={[file('d1')]} />);
    expect(hanyaDokumen).not.toContain('Galeri');
    expect(render(<PengumumanLampiranBawah images={[]} dokumen={[]} />)).toBe(render(<></>));
  });
});

describe('Kabar Desa', () => {
  it('tanggal pengumuman memakai tanggalTerbit, fallback createdAt', () => {
    const base = { id: 'p1', judul: 'Lelang', createdAt: '2026-11-10T00:00:00.000Z' };
    expect(toPengumumanItem({ ...base, tanggalTerbit: '2023-05-01T00:00:00.000Z' }).createdAt).toBe(
      Date.parse('2023-05-01T00:00:00.000Z'),
    );
    expect(toPengumumanItem(base).createdAt).toBe(Date.parse(base.createdAt));
  });
});
