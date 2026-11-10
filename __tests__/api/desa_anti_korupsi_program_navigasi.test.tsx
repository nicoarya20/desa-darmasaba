// @vitest-environment node
// Publik DAK halaman program: folder tunggal langsung dibuka, tujuan tombol Kembali, daftar folder berbentuk panel baris.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ProgramIsi } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramIsi';
import {
  folderTunggalBerisi,
  tujuanKembali,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-folder';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

// test-only fixture
const dok = (id: string, judul: string): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  createdAt: '2026-11-09T00:00:00.000Z',
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size: 1024 },
});

const noop = () => undefined;
const now = new Date();
const KATEGORI_HREF = 'href="/darmasaba/desa-anti-korupsi/detail?kategori=PENGUATAN%20TATA%20LAKSANA"';
const DAFTAR_FOLDER_HREF = 'href="/darmasaba/desa-anti-korupsi/program/p1"';

// test-only fixture: seperti data 1.1 — folder "2026" kosong, satu dokumen di "Umum".
const tunggal: DesaAntiKorupsiDetail = {
  id: 'p1',
  name: '1.1 ADANYA PERDES TENTANG APBDES',
  deskripsi: '',
  kategoriId: 'k1',
  kategori: { id: 'k1', name: 'PENGUATAN TATA LAKSANA', createdAt: now, updatedAt: now, deletedAt: now, isActive: true },
  createdAt: now,
  updatedAt: now,
  deletedAt: now,
  isActive: true,
  folders: [{ id: 'f2026', nama: '2026', urutan: 0, dokumen: [] }],
  dokumenUmum: [dok('u1', 'riset-pm-tool-untuk-tim-rnd')],
};

// test-only fixture: dua folder berisi → daftar folder tetap tampil.
const banyak: DesaAntiKorupsiDetail = {
  ...tunggal,
  folders: [
    { id: 'fa', nama: 'Laporan', urutan: 0, dokumen: [dok('a1', 'Laporan 1')] },
    { id: 'fb', nama: 'Kosong', urutan: 1, dokumen: [] },
  ],
};

const isi = (detail: DesaAntiKorupsiDetail, folderParam: string | null) =>
  render(<ProgramIsi detail={detail} folderParam={folderParam} urutParam={null} onUrutChange={noop} />);
const kembaliTag = (html: string) => /<a[^>]*data-testid="program-kembali"[^>]*>/.exec(html)?.[0] ?? '';

describe('folderTunggalBerisi', () => {
  it('satu-satunya folder berisi dikembalikan; folder kosong tidak dihitung', () => {
    expect(folderTunggalBerisi(folderGroups(tunggal))?.key).toBe('umum');
  });

  it('≥2 folder berisi atau tanpa dokumen sama sekali → null', () => {
    expect(folderTunggalBerisi(folderGroups({ ...banyak, dokumenUmum: [dok('u1', 'x')] }))).toBeNull();
    expect(folderTunggalBerisi(folderGroups({ ...tunggal, dokumenUmum: [] }))).toBeNull();
  });
});

describe('tujuanKembali', () => {
  it('folder dibuka → daftar folder program (urut ikut); selain itu → tab kategori; tanpa kategori → halaman DAK', () => {
    expect(tujuanKembali({ programId: 'p1', kategori: 'X', folderDibuka: true, urut: 'judul-asc' })).toEqual({
      href: '/darmasaba/desa-anti-korupsi/program/p1?urut=judul-asc',
      label: 'Kembali ke daftar folder',
    });
    expect(tujuanKembali({ programId: 'p1', kategori: 'PENGUATAN TATA LAKSANA', folderDibuka: false })).toEqual({
      href: '/darmasaba/desa-anti-korupsi/detail?kategori=PENGUATAN%20TATA%20LAKSANA',
      label: 'Kembali ke daftar indikator',
    });
    expect(tujuanKembali({ programId: 'p1', kategori: null, folderDibuka: false }).href).toBe('/darmasaba/desa-anti-korupsi');
  });
});

describe('ProgramIsi navigasi', () => {
  it('satu folder berisi → dokumennya langsung tampil tanpa langkah pilih folder; Kembali → tab kategori', () => {
    const html = isi(tunggal, null);
    expect([...html.matchAll(/data-dokumen-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['u1']);
    expect(html).toMatch(/data-testid="folder-aktif"[^>]*>Umum</);
    expect(html).not.toContain('data-folder-key');
    expect(kembaliTag(html)).toContain(KATEGORI_HREF);
    expect(kembaliTag(html)).toContain('aria-label="Kembali ke daftar indikator"');
    // Folder dibuka otomatis bukan pilihan pengunjung → tidak jadi crumb terakhir.
    expect(html).not.toMatch(/aria-current="page"[^>]*>Umum</);
    // Chip tetap ada untuk menjangkau folder lain (mis. "2026" yang kosong).
    expect([...html.matchAll(/data-folder-chip="([^"]+)"/g)].map((m) => m[1])).toEqual(['f2026', 'umum']);
  });

  it('folder dipilih lewat ?folder= → Kembali ke daftar folder program, bukan ke halaman detail', () => {
    const html = isi(tunggal, 'f2026');
    expect(kembaliTag(html)).toContain(DAFTAR_FOLDER_HREF);
    expect(kembaliTag(html)).toContain('aria-label="Kembali ke daftar folder"');
    expect(kembaliTag(html)).not.toContain('kategori=');
  });

  it('≥2 folder berisi → panel baris folder (bukan kartu), Kembali → tab kategori, ZIP semua di baris alat', () => {
    const html = isi({ ...banyak, dokumenUmum: [dok('u1', 'x')] }, null);
    expect(html).toMatch(/<ul[^>]*aria-label="Folder dokumen"/);
    expect([...html.matchAll(/data-folder-key="([^"]+)"/g)].map((m) => m[1])).toEqual(['fa', 'fb', 'umum']);
    expect(kembaliTag(html)).toContain(KATEGORI_HREF);
    expect(html).toContain('data-zip-folder="semua"');
    expect(html).not.toContain('data-dokumen-id');
  });

  it('?folder= tidak dikenal → daftar folder (tidak dibuka otomatis)', () => {
    const html = isi(tunggal, 'tidak-ada');
    expect(html).toContain('data-folder-key="umum"');
    expect(html).not.toContain('data-dokumen-id');
  });

  it('program dengan satu folder saja tidak menampilkan baris chip', () => {
    const html = isi({ ...tunggal, folders: [] }, null);
    expect(html).toMatch(/data-testid="folder-aktif"[^>]*>Umum</);
    expect(html).not.toContain('data-testid="folder-chips"');
  });
});
