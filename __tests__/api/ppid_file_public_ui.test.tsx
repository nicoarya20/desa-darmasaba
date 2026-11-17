// @vitest-environment node
// Lomba 2.5: halaman publik Dasar Hukum dan Daftar Informasi Publik menampilkan tautan "Unduh PDF" hanya bila baris
// punya berkas; data lama tanpa berkas tampil seperti semula. jsdom gagal start di repo ini → renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dasarHukum = vi.hoisted(() => ({ findById: { data: null as unknown, loading: false, load: vi.fn() } }));

vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum', () => ({ default: dasarHukum }));

import { DaftarDetail } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarDetail';
import { DaftarTable } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarTable';
import type { InformasiItem } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/daftar.logic';
import DasarHukumPage from '@/app/(public)/(pages)/ppid/dasar-hukum/page';
import { PPID_FILE_TEXT } from '@/app/(public)/(pages)/ppid/_com/PpidFileLink';

const PPID_DIR = path.join(process.cwd(), 'src/app/(public)/(pages)/ppid');
const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (source: string, needle: string) => source.split(needle).length - 1;

// test-only: berkas dan baris fiktif.
const FILE = { link: '/api/fileStorage/findUnique/perbup-uji.pdf', realName: 'perbup-uji.pdf' };
const DASAR_HTML = '<ul><li>UU Uji Nomor 1 tentang Keterbukaan Uji</li><li>PP Uji Nomor 2</li></ul>';
const ITEMS: InformasiItem[] = [
  { id: 'a1', jenisInformasi: 'Profil Desa Uji', deskripsi: '<p>Deskripsi satu</p>', tanggal: '2026-11-01', file: { ...FILE } },
  { id: 'b2', jenisInformasi: 'Laporan Uji', deskripsi: '<p>Deskripsi dua</p>', tanggal: '2026-11-02', file: null },
  { id: 'c3', jenisInformasi: 'Data Lama Uji', deskripsi: '<p>Deskripsi tiga</p>', tanggal: '2026-11-03' },
];

beforeEach(() => {
  dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_HTML, file: null };
});

describe('Dasar Hukum publik', () => {
  it('ada berkas: tautan Unduh PDF ke tab baru, daftar peraturan tetap tampil', () => {
    dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_HTML, file: FILE };
    const html = render(<DasarHukumPage />);
    expect(count(html, PPID_FILE_TEXT.unduh)).toBe(2); // data-text + label
    expect(html).toContain(`href="${FILE.link}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(`aria-label="${PPID_FILE_TEXT.unduhLabel(FILE.realName)}"`);
    expect(count(html, '<li')).toBe(2);
    expect(html).toContain('UU Uji Nomor 1');
  });

  it('tanpa berkas (file null): tidak ada tautan unduh, teks lama tetap tampil', () => {
    const html = render(<DasarHukumPage />);
    expect(html).not.toContain(PPID_FILE_TEXT.unduh);
    expect(html).not.toContain('<a ');
    expect(html).toContain('UU Uji Nomor 1');
  });

  it('data lama tanpa properti file sama sekali: tidak ada tautan unduh', () => {
    dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_HTML };
    expect(render(<DasarHukumPage />)).not.toContain(PPID_FILE_TEXT.unduh);
  });

  it('isi bukan daftar polos (HTML apa adanya) tetap mendapat tautan unduh', () => {
    dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: '<p>Isi bebas uji</p>', file: FILE };
    const html = render(<DasarHukumPage />);
    expect(html).toContain('Isi bebas uji');
    expect(html).toContain(`href="${FILE.link}"`);
  });

  it('tautan unduh sejajar kolom isi di desktop dan satu kolom di ponsel', () => {
    const css = readFileSync(path.join(PPID_DIR, 'dasar-hukum/_com/dasar-hukum.module.css'), 'utf8');
    expect(css).toMatch(/\.unduh\s*\{\s*grid-column:\s*2;\s*\}/);
    expect(css).toMatch(/@media \(max-width: 734px\)\s*\{[^@]*\.unduh\s*\{\s*grid-column:\s*1;/);
  });
});

describe('Daftar Informasi Publik publik: tabel', () => {
  it('tautan unduh hanya pada baris yang punya berkas, berlabel jenis informasinya', () => {
    const html = render(<DaftarTable items={ITEMS} page={1} />);
    expect(html.match(/<tr/g)).toHaveLength(1 + ITEMS.length);
    expect(count(html, `href="${FILE.link}"`)).toBe(1);
    expect(count(html, `>${PPID_FILE_TEXT.unduh}</span>`)).toBe(1);
    expect(html).toContain(`aria-label="${PPID_FILE_TEXT.unduhLabel('Profil Desa Uji')}"`);
    expect(html).not.toContain(PPID_FILE_TEXT.unduhLabel('Laporan Uji'));
    expect(html).not.toContain(PPID_FILE_TEXT.unduhLabel('Data Lama Uji'));
  });

  it('semua baris tanpa berkas: tabel tidak memuat tautan unduh', () => {
    const html = render(<DaftarTable items={ITEMS.slice(1)} page={1} />);
    expect(html).not.toContain(PPID_FILE_TEXT.unduh);
    expect(html).toContain('Laporan Uji');
  });

  it('tautan Detail tetap ada di setiap baris', () => {
    const html = render(<DaftarTable items={ITEMS} page={1} />);
    for (const item of ITEMS) expect(html).toContain(`href="/ppid/daftar-informasi-publik/${item.id}"`);
  });
});

describe('Daftar Informasi Publik publik: detail', () => {
  it('ada berkas: baris Berkas dengan tautan unduh', () => {
    const html = render(<DaftarDetail data={ITEMS[0]} />);
    expect(html).toContain('>Berkas</dt>');
    expect(html).toContain(`href="${FILE.link}"`);
    expect(html).toContain('Deskripsi satu');
  });

  it.each([ITEMS[1], ITEMS[2]])('tanpa berkas (%#): tidak ada baris Berkas maupun tautan unduh', (item) => {
    const html = render(<DaftarDetail data={item} />);
    expect(html).not.toContain('Berkas');
    expect(html).not.toContain(PPID_FILE_TEXT.unduh);
    expect(html).toContain(item.jenisInformasi);
  });
});
