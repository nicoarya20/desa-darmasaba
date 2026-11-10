// @vitest-environment node
// Admin DAK: modal pilih folder tujuan, konfirmasi hapus massal, dan menu aksi folder.
// Pendekatan: MantineProvider env="test" mematikan portal & transisi sehingga isi Modal ikut
// ter-render di renderToStaticMarkup. Dropdown Menu hanya ter-render saat terbuka, jadi isinya
// diuji lewat `FolderActionsDropdown` di dalam <Menu defaultOpened>; trigger diuji lewat
// `FolderActionsMenu` (tertutup). Interaksi klik tidak teruji (env jsdom repo rusak) — logika
// pilihan diuji lewat helper murni.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, MantineProvider, Menu } from '@mantine/core';
import {
  FolderPickerModal,
  folderPickerKey,
  folderPickerOptionsFromGroups,
  folderPickerValue,
  selectableFolderOptions,
  type FolderPickerOption,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/FolderPickerModal';
import {
  KonfirmasiHapusDokumenModal,
  konfirmasiHapusDokumenText,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/KonfirmasiHapusDokumenModal';
import {
  FolderActionsDropdown,
  FolderActionsMenu,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/FolderActionsMenu';
import { groupDrafts } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const noop = () => {};

const options: FolderPickerOption[] = [
  { key: 'fa', nama: 'Laporan Keuangan', jumlah: 3 },
  { key: 'fb', nama: 'Peraturan Desa', jumlah: 0 },
  { key: null, nama: 'Umum', jumlah: 5 },
];

const picker = (opts: FolderPickerOption[], disabledKeys?: ReadonlyArray<string | null>) =>
  render(
    <FolderPickerModal
      opened
      title="Pindahkan ke folder"
      confirmLabel="Pindahkan"
      options={opts}
      disabledKeys={disabledKeys}
      onConfirm={noop}
      onClose={noop}
    />,
  );

/** Tag pembuka elemen opsi ber-`data-folder-option` = value (Radio meneruskan data-* ke root). */
const optionTag = (html: string, value: string) => html.match(new RegExp(`<[^>]*data-folder-option="${value}"[^>]*>`))?.[0] ?? '';

describe('FolderPickerModal', () => {
  it('menampilkan judul, semua opsi termasuk Umum beserta jumlah dokumen, Batal & tombol konfirmasi disabled', () => {
    const html = picker(options);
    expect(html).toContain('Pindahkan ke folder');
    expect([...html.matchAll(/data-folder-option="([^"]+)"/g)].map((m) => m[1])).toEqual(['fa', 'fb', '__umum__']);
    for (const nama of ['Laporan Keuangan', 'Peraturan Desa', 'Umum']) expect(html).toContain(nama);
    expect(html).toContain('3 dokumen');
    expect(html).toContain('0 dokumen');
    expect(html).toContain('5 dokumen');
    expect(html).toContain('>Batal<');
    // belum ada pilihan → tombol konfirmasi disabled
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>(?:(?!<\/button>)[\s\S])*Pindahkan</);
    expect(html).not.toContain('data-testid="folder-picker-kosong"');
  });

  it('opsi di disabledKeys ditandai dan input radionya disabled; opsi lain tidak', () => {
    const html = picker(options, ['fa']);
    expect(optionTag(html, 'fa')).toContain('data-disabled="true"');
    expect(optionTag(html, 'fb')).not.toContain('data-disabled');
    expect(html).toMatch(/<input[^>]*disabled=""[^>]*value="fa"|<input[^>]*value="fa"[^>]*disabled=""/);
    expect(html).not.toMatch(/<input[^>]*disabled=""[^>]*value="fb"|<input[^>]*value="fb"[^>]*disabled=""/);
    expect(html).toContain('3 dokumen · tidak bisa dipilih');
  });

  it('hanya Umum dan Umum sendiri disabled → pesan kosong, tanpa daftar opsi', () => {
    const html = picker([{ key: null, nama: 'Umum', jumlah: 2 }], [null]);
    expect(html).toContain('data-testid="folder-picker-kosong"');
    expect(html).toContain('Belum ada folder lain yang bisa dipilih.');
    expect(html).not.toContain('data-folder-option');
  });

  it('modal tertutup tidak merender isi', () => {
    const html = render(
      <FolderPickerModal opened={false} title="Judul X" confirmLabel="OK" options={options} onConfirm={noop} onClose={noop} />,
    );
    expect(html).not.toContain('Judul X');
  });
});

describe('FolderPickerModal helpers', () => {
  it('value Radio ↔ key folder bolak-balik, Umum (null) memakai sentinel', () => {
    expect(folderPickerValue(null)).toBe('__umum__');
    expect(folderPickerKey('__umum__')).toBeNull();
    expect(folderPickerKey(folderPickerValue('fa'))).toBe('fa');
  });

  it('selectableFolderOptions membuang disabledKeys (termasuk null)', () => {
    expect(selectableFolderOptions(options, ['fa', null]).map((o) => o.key)).toEqual(['fb']);
    expect(selectableFolderOptions(options).length).toBe(3);
  });

  it('folderPickerOptionsFromGroups menghitung dokumen per folder dari groupDrafts', () => {
    // test-only: groupDrafts hanya membaca key & folderKey, field draft lain tidak relevan.
    const dok = (key: string, folderKey: string | null) => ({ key, folderKey }) as unknown as DokumenDraft;
    const groups = groupDrafts({
      folders: [{ key: 'fa', id: 'fa', nama: 'Laporan' }],
      dokumen: [dok('d1', 'fa'), dok('d2', null), dok('d3', 'fa')],
    });
    expect(folderPickerOptionsFromGroups(groups)).toEqual([
      { key: 'fa', nama: 'Laporan', jumlah: 2 },
      { key: null, nama: 'Umum', jumlah: 1 },
    ]);
  });
});

describe('KonfirmasiHapusDokumenModal', () => {
  it('menampilkan jumlah dokumen, catatan file asli tetap tersimpan, tombol hapus merah & Batal', () => {
    const html = render(<KonfirmasiHapusDokumenModal opened count={4} onConfirm={noop} onClose={noop} />);
    expect(html).toContain('Hapus 4 dokumen?');
    expect(html).toContain('file asli tetap tersimpan');
    expect(html).toContain('>Batal<');
    expect(html).toMatch(/<button[^>]*--button-bg:var\(--mantine-color-red-filled\)[^>]*>[\s\S]*?Yakin Hapus/);
    expect(konfirmasiHapusDokumenText(1)).toMatch(/^Hapus 1 dokumen\?/);
  });
});

describe('FolderActionsMenu', () => {
  it('merender trigger titik tiga dengan aria-label nama folder, dropdown tertutup', () => {
    const html = render(
      <FolderActionsMenu namaFolder="Laporan Keuangan" onRename={noop} onDuplicate={noop} onCopyContents={noop} onDelete={noop} />,
    );
    expect(html).toContain('aria-label="Aksi folder Laporan Keuangan"');
    expect(html).not.toContain('Ganti nama');
  });

  const dropdown = (disableDuplicate?: boolean) =>
    render(
      <Menu defaultOpened>
        <Menu.Target>
          <Button>buka</Button>
        </Menu.Target>
        <FolderActionsDropdown
          onRename={noop}
          onDuplicate={noop}
          onCopyContents={noop}
          onDelete={noop}
          disableDuplicate={disableDuplicate}
        />
      </Menu>,
    );
  const itemTag = (html: string, label: string) =>
    html.match(new RegExp(`<button[^>]*>(?:(?!</button>)[\\s\\S])*${label}`))?.[0].match(/^<button[^>]*>/)?.[0] ?? '';

  it('dropdown berisi Ganti nama, Duplikat folder, Salin isi ke…, Hapus folder (merah + keterangan)', () => {
    const html = dropdown();
    const labels = ['Ganti nama', 'Duplikat folder', 'Salin isi ke…', 'Hapus folder'];
    const pos = labels.map((l) => html.indexOf(l));
    expect(pos.every((p) => p >= 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    expect(html).toContain('dokumen pindah ke Umum');
    expect(itemTag(html, 'Hapus folder')).toContain('--menu-item-color:var(--mantine-color-red');
    expect(itemTag(html, 'Duplikat folder')).not.toContain('data-disabled');
  });

  it('disableDuplicate → item Duplikat folder disabled', () => {
    const html = dropdown(true);
    expect(itemTag(html, 'Duplikat folder')).toContain('data-disabled="true"');
    expect(itemTag(html, 'Ganti nama')).not.toContain('data-disabled');
  });
});
