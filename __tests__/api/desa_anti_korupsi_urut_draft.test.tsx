// @vitest-environment node
// Admin DAK: "Urutkan menurut…" per folder (menulis ulang urutan draft satu folder saja) dan pencarian
// editor (hanya menyaring tampilan; "Pilih semua" saat mencari = dokumen yang terlihat saja).
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, Menu } from '@mantine/core';
import { DokumenFolderEditor } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenFolderEditor';
import {
  DokumenGroupAccordion,
  folderValueOf,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenGroupAccordion';
import { UrutFolderDropdown } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/UrutFolderMenu';
import { orderedDokumenKeys } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-bulk-actions';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import { setSelected } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-selection';
import { groupDrafts, type IsiDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';
import {
  filterDraftGroups,
  posisiDraft,
  sortFolderAction,
  sortFolderDrafts,
  URUT_DRAFT_OPTIONS,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/urut-draft';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();
const noop = () => {};

// test-only fixtures
const saved = (key: string, folderKey: string | null, judul: string, size: number | null, createdAt: string): DokumenDraft => ({
  key,
  id: key,
  folderKey,
  fileId: `f-${key}`,
  judul,
  realName: `${key}.pdf`,
  mimeType: 'application/pdf',
  size,
  createdAt,
});
const pending = (key: string, folderKey: string | null, judul: string, bytes: number, realName = `${key}.docx`): DokumenDraft => ({
  key,
  folderKey,
  judul,
  file: new File([new Uint8Array(bytes)], realName),
  realName,
  mimeType: '',
});

const NOW = new Date('2026-11-09T12:00:00.000Z');
const isi: IsiDraft = {
  folders: [
    { key: 'fa', id: 'fa', nama: 'Laporan' },
    { key: 'fb', id: 'fb', nama: 'Peraturan' },
  ],
  dokumen: [
    saved('a1', 'fa', 'Zeta', 300, '2026-10-01T00:00:00.000Z'),
    saved('b1', 'fb', 'Perdes 2', 10, '2026-09-01T00:00:00.000Z'),
    saved('a2', 'fa', 'Alpha', null, '2026-11-01T00:00:00.000Z'),
    saved('u1', null, 'Umum', 5, '2026-08-01T00:00:00.000Z'),
    pending('a3', 'fa', 'Mid', 5000),
    saved('b2', 'fb', 'Perdes 1', 20, '2026-09-02T00:00:00.000Z'),
  ],
};
const keys = (x: IsiDraft) => x.dokumen.map((d) => d.key);
const keysIn = (x: IsiDraft, folderKey: string | null) => x.dokumen.filter((d) => d.folderKey === folderKey).map((d) => d.key);

describe('sortFolderDrafts — menulis ulang urutan satu folder saja', () => {
  it('judul A–Z: isi folder tersusun ulang, dokumen folder lain tetap di slot array yang sama', () => {
    const next = sortFolderDrafts(isi, 'fa', 'judul', 'asc', NOW);
    expect(keysIn(next, 'fa')).toEqual(['a2', 'a3', 'a1']); // Alpha, Mid, Zeta
    expect(keys(next)).toEqual(['a2', 'b1', 'a3', 'u1', 'a1', 'b2']);
    expect(keysIn(next, 'fb')).toEqual(keysIn(isi, 'fb'));
    expect(keysIn(next, null)).toEqual(['u1']);
    expect(isi.dokumen.map((d) => d.key)).toEqual(['a1', 'b1', 'a2', 'u1', 'a3', 'b2']); // input tidak diubah
  });

  it('ukuran terbesar: berkas belum diunggah memakai File.size; ukuran null di akhir', () => {
    expect(keysIn(sortFolderDrafts(isi, 'fa', 'ukuran', 'desc', NOW), 'fa')).toEqual(['a3', 'a1', 'a2']);
    expect(keysIn(sortFolderDrafts(isi, 'fa', 'ukuran', 'asc', NOW), 'fa')).toEqual(['a1', 'a3', 'a2']);
  });

  it('terbaru: draft belum diunggah dianggap diunggah sekarang (paling atas); terlama sebaliknya', () => {
    expect(keysIn(sortFolderDrafts(isi, 'fa', 'tanggal', 'desc', NOW), 'fa')).toEqual(['a3', 'a2', 'a1']);
    expect(keysIn(sortFolderDrafts(isi, 'fa', 'tanggal', 'asc', NOW), 'fa')).toEqual(['a1', 'a2', 'a3']);
  });

  it('tipe: ekstensi berkas (docx sebelum pdf)', () => {
    expect(keysIn(sortFolderDrafts(isi, 'fa', 'tipe', 'asc', NOW), 'fa')).toEqual(['a3', 'a1', 'a2']);
  });

  it('folder "Umum" (null) bisa diurutkan; urutan tak berubah → objek isi yang sama', () => {
    expect(sortFolderDrafts(isi, null, 'judul', 'asc', NOW)).toBe(isi);
    expect(sortFolderDrafts(isi, 'fb', 'judul', 'desc', NOW)).toBe(isi); // Perdes 2, Perdes 1 sudah Z–A
    expect(keysIn(sortFolderDrafts(isi, 'fb', 'judul', 'asc', NOW), 'fb')).toEqual(['b2', 'b1']);
  });
});

describe('sortFolderAction — notifikasi', () => {
  it('berubah → success; sudah urut → info; pilihan tak dikenal → error tanpa perubahan', () => {
    const ok = sortFolderAction(isi, 'fa', 'judul-asc', NOW);
    expect(ok).toMatchObject({ tone: 'success', message: 'Isi "Laporan" diurutkan menurut Judul A–Z' });
    expect(keysIn(ok.isi, 'fa')).toEqual(['a2', 'a3', 'a1']);
    expect(sortFolderAction(ok.isi, 'fa', 'judul-asc', NOW)).toMatchObject({ tone: 'info', isi: ok.isi });
    expect(sortFolderAction(isi, 'fa', 'acak', NOW)).toMatchObject({ tone: 'error', isi });
  });

  it('pilihan menu mencakup Judul A–Z/Z–A, Terbaru, Terlama, Tipe, Ukuran', () => {
    expect(URUT_DRAFT_OPTIONS.map((o) => o.label)).toEqual([
      'Judul A–Z',
      'Judul Z–A',
      'Terbaru',
      'Terlama',
      'Tipe',
      'Ukuran (terbesar)',
      'Ukuran (terkecil)',
    ]);
  });
});

describe('filterDraftGroups & posisiDraft — saring tampilan', () => {
  const groups = groupDrafts(isi);

  it('kata kunci kosong → semua kelompok (termasuk yang kosong) apa adanya', () => {
    expect(filterDraftGroups(groups, '  ')).toEqual(groups);
  });

  it('cocok judul / nama berkas tanpa beda kapital; kelompok tanpa hasil disembunyikan; draft tak diubah', () => {
    const res = filterDraftGroups(groups, 'perdes');
    expect(res.map((g) => [g.key, g.dokumen.map((d) => d.key)])).toEqual([['fb', ['b1', 'b2']]]);
    expect(filterDraftGroups(groups, 'A3.DOCX').map((g) => g.key)).toEqual(['fa']);
    expect(filterDraftGroups(groups, 'tidak-ada')).toEqual([]);
    expect(groupDrafts(isi)).toEqual(groups);
  });

  it('posisiDraft memberi nomor urut asli walau tampilan disaring', () => {
    const posisi = posisiDraft(groups);
    expect(posisi.get('a3')).toEqual({ index: 2, total: 3 });
    expect(posisi.get('b2')).toEqual({ index: 1, total: 2 });
  });

  it('"Pilih semua" saat mencari hanya memilih dokumen yang terlihat; pilihan tersembunyi tetap', () => {
    const visible = filterDraftGroups(groups, 'alpha');
    const before = new Set(['b1']); // dipilih sebelum mencari, kini tersembunyi
    const after = setSelected(before, visible[0].dokumen.map((d) => d.key), true);
    expect([...after].sort()).toEqual(['a2', 'b1']);
    expect(orderedDokumenKeys(visible)).toEqual(['a2']); // rentang Shift+klik hanya atas yang terlihat
  });
});

describe('Render — menu urut, kelompok tersaring, kotak cari', () => {
  it('UrutFolderDropdown merender semua pilihan', () => {
    const html = render(
      <Menu opened>
        <Menu.Target>
          <button type="button">t</button>
        </Menu.Target>
        <UrutFolderDropdown onSelect={noop} />
      </Menu>,
    );
    for (const o of URUT_DRAFT_OPTIONS) expect(html).toContain(`data-urut="${o.value}"`);
    expect(html).toContain('Urutkan menurut…');
  });

  it('accordion tersaring: header "Pilih semua" menghitung yang terlihat, nomor asli, naik/turun terkunci', () => {
    const visible = filterDraftGroups(groupDrafts(isi), 'mid');
    const html = render(
      <DokumenGroupAccordion
        groups={visible}
        folderOptions={[{ value: 'fa', label: 'Laporan' }]}
        selection={new Set(['a3'])}
        opened={visible.map((g) => folderValueOf(g.key))}
        onOpenedChange={noop}
        onToggleSelect={noop}
        onSelectAll={noop}
        onJudul={noop}
        onFolder={noop}
        onMove={noop}
        onPreview={noop}
        onRemove={noop}
        onSortFolder={noop}
        posisi={posisiDraft(groupDrafts(isi))}
        reorderLocked
      />,
    );
    const header = html.match(/<input[^>]*aria-label="Pilih semua dokumen di Laporan"[^>]*>/)?.[0] ?? '';
    expect(header).toContain('data-selection-state="all"'); // 1 terlihat, 1 terpilih
    expect(html).toContain('aria-label="Urutkan isi Laporan menurut…"');
    expect(html).toContain('aria-label="Judul dokumen 3: Mid. Ganti nama"');
    expect(html.match(/<button[^>]*aria-label="Naikkan urutan"[^>]*>/)?.[0]).toMatch(/disabled=""/);
  });

  it('editor menampilkan kotak cari saat ada dokumen dan menu urut per kelompok', () => {
    const html = render(<DokumenFolderEditor value={isi} onChange={noop} />);
    expect(html).toContain('aria-label="Cari dokumen di editor"');
    expect(html).toContain('aria-label="Urutkan isi Peraturan menurut…"');
    expect(html).not.toContain('data-cari-info');
    const kosong = render(<DokumenFolderEditor value={{ folders: [], dokumen: [] }} onChange={noop} />);
    expect(kosong).not.toContain('aria-label="Cari dokumen di editor"');
  });
});
