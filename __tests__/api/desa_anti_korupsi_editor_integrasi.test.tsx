// @vitest-environment node
// Admin DAK: integrasi seleksi + aksi massal di editor — checkbox per baris & "Pilih semua" per folder
// (none/some/all), toolbar saat ada seleksi, menu aksi per folder, alert berkas ganda, validasi Simpan.
// Interaksi klik tidak teruji (env jsdom repo rusak); state awal diberikan lewat props komponen ter-ekstrak.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenBulkActions } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenBulkActions';
import { DokumenFolderEditor } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenFolderEditor';
import {
  DokumenGroupAccordion,
  folderKeyOfValue,
  folderValueOf,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenGroupAccordion';
import { FolderManager } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/FolderManager';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import type { Selection } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-selection';
import { groupDrafts, type IsiDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';

// env="test": Modal tanpa portal/transisi sehingga ikut ter-render di renderToStaticMarkup.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const noop = () => {};

// test-only: dokumen tersimpan dengan fileId default unik per key.
const saved = (key: string, folderKey: string | null, fileId = `f-${key}`): DokumenDraft => ({
  key,
  id: key,
  folderKey,
  fileId,
  judul: `Judul ${key}`,
  mimeType: 'application/pdf',
  realName: `${fileId}.pdf`,
});

const isi: IsiDraft = {
  folders: [
    { key: 'fa', id: 'fa', nama: 'Laporan' },
    { key: 'fb', id: 'fb', nama: 'Peraturan' },
    { key: 'fc', id: 'fc', nama: 'Kosong' },
  ],
  dokumen: [saved('a1', 'fa'), saved('a2', 'fa'), saved('b1', 'fb'), saved('u1', null)],
};

const accordion = (selection: Selection) => {
  const groups = groupDrafts(isi);
  return render(
    <DokumenGroupAccordion
      groups={groups}
      folderOptions={groups.map((g) => ({ value: folderValueOf(g.key), label: g.nama }))}
      selection={selection}
      opened={groups.map((g) => folderValueOf(g.key))}
      onOpenedChange={noop}
      onToggleSelect={noop}
      onSelectAll={noop}
      onJudul={noop}
      onFolder={noop}
      onMove={noop}
      onPreview={noop}
      onRemove={noop}
    />,
  );
};

/** Tag <input> checkbox ber-aria-label tertentu. */
const checkboxTag = (html: string, label: string) =>
  html.match(new RegExp(`<input[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';

describe('folderValueOf / folderKeyOfValue', () => {
  it('Umum (null) ↔ "umum", folder lain apa adanya', () => {
    expect(folderValueOf(null)).toBe('umum');
    expect(folderKeyOfValue('umum')).toBeNull();
    expect(folderKeyOfValue(folderValueOf('fa'))).toBe('fa');
  });
});

describe('DokumenGroupAccordion — seleksi', () => {
  it('satu checkbox per baris dokumen, checked sesuai seleksi', () => {
    const html = accordion(new Set(['a1', 'b1']));
    expect(html.match(/aria-label="Pilih Judul /g)).toHaveLength(4);
    expect(checkboxTag(html, 'Pilih Judul a1')).toMatch(/checked=""/);
    expect(checkboxTag(html, 'Pilih Judul b1')).toMatch(/checked=""/);
    expect(checkboxTag(html, 'Pilih Judul a2')).not.toMatch(/checked=""/);
    expect(html.match(/data-selected="true"/g)).toHaveLength(2);
  });

  it('"Pilih semua" per folder termasuk Umum, status none/some/all', () => {
    const html = accordion(new Set(['a1', 'b1']));
    const header = (nama: string) => checkboxTag(html, `Pilih semua dokumen di ${nama}`);
    expect(html.match(/aria-label="Pilih semua dokumen di /g)).toHaveLength(4);
    expect(header('Laporan')).toContain('data-selection-state="some"');
    expect(header('Laporan')).not.toMatch(/checked=""/);
    expect(header('Peraturan')).toContain('data-selection-state="all"');
    expect(header('Peraturan')).toMatch(/checked=""/);
    expect(header('Umum')).toContain('data-selection-state="none"');
    expect(header('Umum')).not.toMatch(/checked=""/);
  });

  it('sebagian terpilih → checkbox header indeterminate; folder kosong → disabled', () => {
    const html = accordion(new Set(['a1', 'b1']));
    // SSR: atribut DOM `indeterminate` dipasang lewat effect; yang ter-render adalah ikon garis (viewBox 0 0 32 6).
    const icon = (nama: string) => html.match(new RegExp(`aria-label="Pilih semua dokumen di ${nama}"[\\s\\S]*?</svg>`))?.[0] ?? '';
    expect(icon('Laporan')).toContain('viewBox="0 0 32 6"');
    expect(icon('Peraturan')).not.toContain('viewBox="0 0 32 6"');
    expect(checkboxTag(html, 'Pilih semua dokumen di Kosong')).toMatch(/disabled=""/);
  });

  it('checkbox header berada di luar tombol Accordion.Control (tidak bersarang di <button>)', () => {
    const html = accordion(new Set());
    const header = html.match(/<div[^>]*data-group-key="fa"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
    expect(header.indexOf('Pilih semua dokumen di Laporan')).toBeGreaterThan(-1);
    expect(header.indexOf('Pilih semua dokumen di Laporan')).toBeLessThan(header.indexOf('<button'));
  });
});

describe('DokumenBulkActions — toolbar', () => {
  it('ada seleksi → toolbar dengan jumlah terpilih & aksi; modal tertutup', () => {
    const html = render(<DokumenBulkActions value={isi} selection={new Set(['a1', 'u1'])} onChange={noop} onSelectionChange={noop} />);
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('2 dipilih');
    for (const label of ['Pindahkan ke…', 'Salin ke…', 'Hapus', 'Batal']) expect(html).toContain(label);
    expect(html).not.toContain('Pindahkan 2 dokumen ke…');
    expect(html).not.toContain('Konfirmasi Hapus');
  });

  it('tanpa seleksi → tidak ada toolbar', () => {
    const html = render(<DokumenBulkActions value={isi} selection={new Set()} onChange={noop} onSelectionChange={noop} />);
    expect(html).not.toContain('role="toolbar"');
  });
});

describe('FolderManager — menu aksi folder', () => {
  it('setiap folder punya FolderActionsMenu; tombol hapus lama diganti, naik/turun tetap', () => {
    const html = render(<FolderManager value={isi} onChange={noop} />);
    for (const nama of ['Laporan', 'Peraturan', 'Kosong']) expect(html).toContain(`aria-label="Aksi folder ${nama}"`);
    expect(html).not.toContain('aria-label="Hapus folder"');
    expect(html.match(/aria-label="Naikkan folder"/g)).toHaveLength(3);
    expect(html.match(/aria-label="Turunkan folder"/g)).toHaveLength(3);
    expect(html).not.toContain('Salin isi "');
  });
});

describe('DokumenFolderEditor — integrasi', () => {
  it('merender "Pilih semua" per folder, tanpa toolbar saat belum ada seleksi, tanpa alert bila isi valid', () => {
    const html = render(<DokumenFolderEditor value={isi} onChange={noop} />);
    expect(html.match(/aria-label="Pilih semua dokumen di /g)).toHaveLength(4);
    expect(html).toContain('aria-label="Aksi folder Laporan"');
    expect(html).not.toContain('role="toolbar"');
    expect(html).not.toContain('Belum bisa disimpan');
  });

  it('berkas sama dua kali di satu folder → alert merah berisi pesan duplicateFileError', () => {
    const dup: IsiDraft = { ...isi, dokumen: [...isi.dokumen, saved('a3', 'fa', 'f-a1')] };
    const html = render(<DokumenFolderEditor value={dup} onChange={noop} />);
    expect(html).toContain('Belum bisa disimpan');
    expect(html).toContain('Berkas dokumen &quot;Judul a3&quot; dipakai dua kali di folder &quot;Laporan&quot;');
    expect(html).toMatch(/--alert-color:var\(--mantine-color-red/);
  });
});

describe('Halaman create & edit memakai validasi isi lengkap', () => {
  it('isFormValid memanggil isIsiDraftValid(isi) (termasuk cek berkas ganda)', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const base = path.resolve(__dirname, '../../src/app/admin/(dashboard)/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    for (const file of ['create/page.tsx', '[id]/edit/page.tsx']) {
      expect(readFileSync(path.join(base, file), 'utf8')).toContain('isIsiDraftValid(isi)');
    }
  });
});
