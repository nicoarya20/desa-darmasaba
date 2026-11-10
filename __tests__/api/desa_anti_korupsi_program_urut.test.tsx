// @vitest-environment node
// Publik DAK halaman program: ?urut (parse/serialisasi), urut + cari, info dokumen, total ukuran folder, tombol ZIP.
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenRingkasList } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/DokumenRingkasList';
import { ProgramIsi } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/ProgramIsi';
import { UnduhZipButton } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/UnduhZipButton';
import {
  dokumenInfo,
  formatTanggalUnggah,
  ringkasInfo,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/dokumen-info';
import {
  programHref,
  searchDokumen,
  totalUkuranFolder,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-folder';
import {
  parseUrut,
  serializeUrut,
  URUT_DEFAULT,
  URUT_OPTIONS,
  urutkanItems,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-urut';
import { jalankanUnduhZip, ZIP_HINT } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/program-zip';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

// test-only fixture
const dok = (
  id: string,
  judul: string,
  opts: { urutan?: number; createdAt?: string; realName?: string; mimeType?: string; size?: number | null } = {},
): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: opts.urutan ?? 0,
  fileId: `f-${id}`,
  createdAt: opts.createdAt ?? '2026-11-09T00:00:00.000Z',
  file: {
    id: `f-${id}`,
    link: `/api/fileStorage/findUnique/${id}`,
    realName: opts.realName ?? `${id}.pdf`,
    mimeType: opts.mimeType ?? 'application/pdf',
    size: opts.size === undefined ? 1024 : opts.size,
  },
});

const now = new Date();
const folderA = [
  dok('a1', 'Laporan 10', { urutan: 0, createdAt: '2026-01-05T00:00:00.000Z', size: 2048 }),
  dok('a2', 'Anggaran', { urutan: 1, createdAt: '2026-03-01T00:00:00.000Z', realName: 'rab.xlsx', mimeType: 'application/vnd.ms-excel', size: 512 }),
  dok('a3', 'Laporan 2', { urutan: 2, createdAt: '2025-12-31T23:00:00.000Z', realName: 'lap.docx', size: 4096 }),
];
const detail: DesaAntiKorupsiDetail = {
  id: 'p1',
  name: 'Program Transparansi',
  deskripsi: '',
  kategoriId: 'k1',
  kategori: { id: 'k1', name: 'PENGUATAN PENGAWASAN', createdAt: now, updatedAt: now, deletedAt: now, isActive: true },
  createdAt: now,
  updatedAt: now,
  deletedAt: now,
  isActive: true,
  folders: [
    { id: 'fa', nama: 'Laporan Keuangan', urutan: 0, dokumen: folderA },
    { id: 'fb', nama: 'Kosong', urutan: 1, dokumen: [] },
    { id: 'fc', nama: 'Arsip Lama', urutan: 2, dokumen: [dok('c1', 'Laporan lama', { size: null })] },
  ],
  dokumenUmum: [dok('u1', 'Pengumuman', { realName: 'laporan-umum.pdf', size: 1536 })],
};
const groups = folderGroups(detail);
const noop = () => undefined;
const ids = (html: string) => [...html.matchAll(/data-dokumen-id="([^"]+)"/g)].map((m) => m[1]);

describe('parseUrut / serializeUrut (?urut=<key>-<dir>)', () => {
  it('nilai yang dikenal dipertahankan; kosong / asing → default urutan asli', () => {
    expect(parseUrut('judul-asc')).toBe('judul-asc');
    expect(parseUrut('tanggal-desc')).toBe('tanggal-desc');
    for (const asing of [null, undefined, '', 'judul', 'judul-desc', 'nama-asc', 'JUDUL-ASC', 'tanggal-asc-x']) {
      expect(parseUrut(asing)).toBe(URUT_DEFAULT);
    }
    expect(URUT_DEFAULT).toBe('urutan-asc');
  });

  it('serialisasi: default → null (tak ditulis ke URL), lainnya apa adanya; round-trip semua opsi', () => {
    expect(serializeUrut('urutan-asc')).toBeNull();
    expect(serializeUrut('ukuran-desc')).toBe('ukuran-desc');
    for (const o of URUT_OPTIONS) expect(parseUrut(serializeUrut(o.value) ?? null)).toBe(o.value);
    expect(URUT_OPTIONS.map((o) => o.label)).toEqual(['Urutan asli', 'Judul A–Z', 'Terbaru', 'Terlama', 'Tipe', 'Ukuran terbesar']);
  });

  it('programHref menyertakan urut non-default di samping folder', () => {
    expect(programHref('p1', 'fa', 'judul-asc')).toBe('/darmasaba/desa-anti-korupsi/program/p1?folder=fa&urut=judul-asc');
    expect(programHref('p1', null, 'tanggal-desc')).toBe('/darmasaba/desa-anti-korupsi/program/p1?urut=tanggal-desc');
    expect(programHref('p1', 'fa', 'urutan-asc')).toBe('/darmasaba/desa-anti-korupsi/program/p1?folder=fa');
  });
});

describe('urut + cari pada data contoh', () => {
  const judul = (list: readonly DokumenDesaAntiKorupsiView[]) => list.map((d) => d.judul);

  it('urutkanItems: urutan asli apa adanya; judul natural; tanggal; ukuran terbesar', () => {
    expect(judul(urutkanItems(folderA, (d) => d, 'urutan-asc'))).toEqual(['Laporan 10', 'Anggaran', 'Laporan 2']);
    expect(judul(urutkanItems(folderA, (d) => d, 'judul-asc'))).toEqual(['Anggaran', 'Laporan 2', 'Laporan 10']);
    expect(judul(urutkanItems(folderA, (d) => d, 'tanggal-desc'))).toEqual(['Anggaran', 'Laporan 10', 'Laporan 2']);
    expect(judul(urutkanItems(folderA, (d) => d, 'tanggal-asc'))).toEqual(['Laporan 2', 'Laporan 10', 'Anggaran']);
    expect(judul(urutkanItems(folderA, (d) => d, 'tipe-asc'))).toEqual(['Laporan 2', 'Laporan 10', 'Anggaran']); // DOCX < PDF < XLSX
    expect(judul(urutkanItems(folderA, (d) => d, 'ukuran-desc'))).toEqual(['Laporan 2', 'Laporan 10', 'Anggaran']);
    expect(judul(folderA)).toEqual(['Laporan 10', 'Anggaran', 'Laporan 2']); // input tidak berubah
  });

  it('searchDokumen memakai filterDokumen (judul atau nama berkas), lalu hasil lintas folder bisa diurutkan', () => {
    const hasil = searchDokumen(groups, ' LAPORAN ');
    // u1 cocok lewat nama berkas "laporan-umum.pdf", sama seperti aturan cari admin
    expect(hasil.map((h) => [h.folder.key, h.dokumen.id])).toEqual([
      ['fa', 'a1'],
      ['fa', 'a3'],
      ['fc', 'c1'],
      ['umum', 'u1'],
    ]);
    const urutJudul = urutkanItems(hasil, (h) => h.dokumen, 'judul-asc');
    expect(urutJudul.map((h) => h.dokumen.judul)).toEqual(['Laporan 2', 'Laporan 10', 'Laporan lama', 'Pengumuman']);
    expect(urutJudul.map((h) => h.folder.nama)).toEqual(['Laporan Keuangan', 'Laporan Keuangan', 'Arsip Lama', 'Umum']);
    // ukuran null selalu di akhir
    expect(urutkanItems(hasil, (h) => h.dokumen, 'ukuran-desc').map((h) => h.dokumen.id)).toEqual(['a3', 'a1', 'u1', 'c1']);
  });

  it('ProgramIsi: ?urut=judul-asc mengurutkan isi folder dan menampilkan Select "Urutkan"', () => {
    const html = render(<ProgramIsi detail={detail} folderParam="fa" urutParam="judul-asc" onUrutChange={noop} />);
    expect(ids(html)).toEqual(['a2', 'a3', 'a1']);
    expect(html).toContain('aria-label="Urutkan dokumen"');
    expect(html).toContain('value="Judul A–Z"');
    // urut ikut di tautan kembali ke daftar folder
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi/program/p1?urut=judul-asc"');
  });

  it('ProgramIsi: ?urut asing → urutan asli; grid folder tanpa Select, tautan folder membawa urut', () => {
    expect(ids(render(<ProgramIsi detail={detail} folderParam="fa" urutParam="acak" onUrutChange={noop} />))).toEqual(['a1', 'a2', 'a3']);
    const grid = render(<ProgramIsi detail={detail} folderParam={null} urutParam="tanggal-desc" onUrutChange={noop} />);
    expect(grid).not.toContain('aria-label="Urutkan dokumen"');
    expect(grid).toContain('href="/darmasaba/desa-anti-korupsi/program/p1?folder=fa&amp;urut=tanggal-desc"');
  });
});

describe('total ukuran folder', () => {
  it('jumlah byte bila semua size diketahui; ada null atau folder kosong → null', () => {
    expect(totalUkuranFolder(folderA)).toBe(2048 + 512 + 4096);
    expect(totalUkuranFolder([dok('x', 'x', { size: 10 }), dok('y', 'y', { size: null })])).toBeNull();
    expect(totalUkuranFolder([])).toBeNull();
  });

  it('grid folder: total tampil hanya untuk folder yang semua ukurannya diketahui', () => {
    const html = render(<ProgramIsi detail={detail} folderParam={null} urutParam={null} onUrutChange={noop} />);
    const ukuran = [...html.matchAll(/data-folder-key="([^"]+)"[\s\S]*?(?=data-folder-key=|$)/g)].map((m) => [
      m[1],
      /data-testid="ukuran-folder"[^>]*>\s*· ([^<]+)</.exec(m[0])?.[1] ?? null,
    ]);
    expect(ukuran).toEqual([
      ['fa', '7 KB'],
      ['fb', null],
      ['fc', null],
      ['umum', '2 KB'],
    ]);
  });
});

describe('info dokumen (tipe · ukuran · tanggal unggah)', () => {
  it('format tanggal WITA ringkas & info satu baris', () => {
    // 23:00 UTC 31 Des = 07:00 WITA 1 Jan
    expect(formatTanggalUnggah('2025-12-31T23:00:00.000Z')).toBe('1 Jan 2026');
    expect(formatTanggalUnggah('bukan-tanggal')).toBe('—');
    const info = dokumenInfo(folderA[1]);
    expect(info).toEqual({ tipe: 'XLSX', ukuran: '512 B', tanggal: '1 Mar 2026' });
    expect(ringkasInfo(dokumenInfo(dok('n', 'n', { size: null })))).toBe('PDF · — · 9 Nov 2026');
  });

  it('baris dokumen merender kolom tipe/ukuran/tanggal (desktop) + satu baris keterangan (mobile)', () => {
    const html = render(<DokumenRingkasList items={[{ dokumen: folderA[2] }]} onPreview={noop} />);
    expect(html).toMatch(/data-testid="dokumen-info"[\s\S]*>DOCX<[\s\S]*>4 KB<[\s\S]*>1 Jan 2026</);
    expect(html).toMatch(/data-testid="dokumen-info-ringkas"[^>]*>DOCX · 4 KB · 1 Jan 2026</);
    expect(html).toContain('title="Tanggal unggah"');
  });
});

describe('tombol unduh ZIP', () => {
  const zipButton = (html: string, folder: string) =>
    new RegExp(`<button[^>]*data-zip-folder="${folder}"[^>]*>`).exec(html)?.[0] ?? '';

  it('header: "Unduh semua (ZIP)" + petunjuk 100 MB; folder terbuka: "Unduh folder (ZIP)"', () => {
    expect(ZIP_HINT).toBe('Maks. 100 MB per unduhan');
    const html = render(<ProgramIsi detail={detail} folderParam="fa" urutParam={null} onUrutChange={noop} />);
    expect(html).toContain('Unduh semua (ZIP)');
    expect(html).toContain('Unduh folder (ZIP)');
    expect(html).toMatch(/data-testid="zip-hint"[^>]*>Maks\. 100 MB per unduhan</);
    expect(zipButton(html, 'fa')).not.toContain('disabled');
    expect(zipButton(html, 'semua')).not.toContain('disabled');
    expect(render(<ProgramIsi detail={detail} folderParam="umum" urutParam={null} onUrutChange={noop} />)).toContain(
      'data-zip-folder="umum"',
    );
  });

  it('folder kosong: tombol ZIP folder tidak dirender; program kosong: tanpa baris alat & ZIP; tombol disabled tetap bisa', () => {
    const kosong = render(<ProgramIsi detail={detail} folderParam="fb" urutParam={null} onUrutChange={noop} />);
    expect(kosong).not.toContain('data-zip-folder="fb"');
    expect(kosong).not.toContain('Unduh folder (ZIP)');
    const program = render(
      <ProgramIsi detail={{ ...detail, folders: [], dokumenUmum: [] }} folderParam={null} urutParam={null} onUrutChange={noop} />,
    );
    // Program tanpa folder & dokumen: baris alat (cari + ZIP) tidak dirender, hanya empty state.
    expect(program).not.toContain('data-zip-folder="semua"');
    expect(program).not.toContain('Unduh folder (ZIP)');
    expect(render(<UnduhZipButton programId="p1" folder="fa" label="Unduh" disabled />)).toMatch(/<button[^>]*disabled/);
  });

  it('jalankanUnduhZip: gagal → onGagal(pesan dari result.message); sukses → tidak memanggil onGagal', async () => {
    const onGagal = vi.fn();
    const gagal = vi.fn().mockResolvedValue({ ok: false, message: 'Ukuran ZIP terlalu besar.' });
    await expect(jalankanUnduhZip('p1', 'fa', { unduh: gagal, onGagal })).resolves.toEqual({ ok: false, message: 'Ukuran ZIP terlalu besar.' });
    expect(gagal).toHaveBeenCalledWith('p1', 'fa');
    expect(onGagal).toHaveBeenCalledWith('Ukuran ZIP terlalu besar.');

    onGagal.mockClear();
    const sukses = vi.fn().mockResolvedValue({ ok: true, fileName: 'p.zip' });
    await jalankanUnduhZip('p1', null, { unduh: sukses, onGagal });
    expect(sukses).toHaveBeenCalledWith('p1', null);
    expect(onGagal).not.toHaveBeenCalled();
  });
});
