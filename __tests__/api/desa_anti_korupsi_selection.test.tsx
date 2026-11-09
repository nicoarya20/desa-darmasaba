// @vitest-environment node
// Admin DAK: seleksi banyak dokumen (toggle, Shift+klik rentang, pilih semua per folder, prune),
// toolbar aksi terpilih, dan checkbox di DokumenDraftRow.
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import {
  pruneSelection,
  selectRange,
  selectionStateOf,
  setSelected,
  toggleSelection,
  type Selection,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-selection';
import { DokumenSelectionToolbar } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenSelectionToolbar';
import { DokumenDraftRow } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenDraftRow';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const sorted = (sel: Selection) => [...sel].sort();
const ORDER = ['a', 'b', 'c', 'd', 'e'];

describe('toggleSelection', () => {
  it('menambah key yang belum dipilih dan menghapus yang sudah, tanpa mengubah Set asal', () => {
    const awal: Selection = new Set(['a']);
    const tambah = toggleSelection(awal, 'b');
    expect(sorted(tambah)).toEqual(['a', 'b']);
    expect(sorted(toggleSelection(tambah, 'a'))).toEqual(['b']);
    expect(sorted(awal)).toEqual(['a']);
    expect(tambah).not.toBe(awal);
  });
});

describe('selectRange', () => {
  it('rentang maju: anchor b → d memilih b, c, d (inklusif)', () => {
    expect(sorted(selectRange(new Set(['b']), ORDER, 'b', 'd'))).toEqual(['b', 'c', 'd']);
  });

  it('rentang mundur: anchor d → a memilih a sampai d dan mempertahankan pilihan lain', () => {
    const hasil = selectRange(new Set(['e']), ORDER, 'd', 'a');
    expect(sorted(hasil)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('anchor null → toggle biasa', () => {
    expect(sorted(selectRange(new Set(), ORDER, null, 'c'))).toEqual(['c']);
    expect(sorted(selectRange(new Set(['c']), ORDER, null, 'c'))).toEqual([]);
  });

  it('anchor sudah tidak ada di urutan (dihapus/dipindah) → toggle biasa', () => {
    expect(sorted(selectRange(new Set(['x']), ORDER, 'hilang', 'b'))).toEqual(['b', 'x']);
  });

  it('tidak mengubah Set asal', () => {
    const awal: Selection = new Set(['a']);
    selectRange(awal, ORDER, 'a', 'e');
    expect(sorted(awal)).toEqual(['a']);
  });
});

describe('setSelected', () => {
  it('pilih semua menambah seluruh key folder, batal pilih semua hanya menghapus key folder itu', () => {
    const awal: Selection = new Set(['x']);
    const semua = setSelected(awal, ['a', 'b'], true);
    expect(sorted(semua)).toEqual(['a', 'b', 'x']);
    expect(sorted(setSelected(semua, ['a', 'b'], false))).toEqual(['x']);
    expect(sorted(awal)).toEqual(['x']);
  });
});

describe('selectionStateOf', () => {
  it('none / some / all sesuai jumlah key folder yang terpilih', () => {
    const sel: Selection = new Set(['a', 'b']);
    expect(selectionStateOf(sel, ['c', 'd'])).toBe('none');
    expect(selectionStateOf(sel, ['a', 'c'])).toBe('some');
    expect(selectionStateOf(sel, ['a', 'b'])).toBe('all');
  });

  it('keys kosong → none walau seleksi berisi', () => {
    expect(selectionStateOf(new Set(['a']), [])).toBe('none');
  });
});

describe('pruneSelection', () => {
  it('membuang key yang sudah tidak ada', () => {
    const sel: Selection = new Set(['a', 'b', 'c']);
    expect(sorted(pruneSelection(sel, ['a', 'c', 'z']))).toEqual(['a', 'c']);
    expect(sorted(pruneSelection(sel, new Set<string>()))).toEqual([]);
    expect(sorted(sel)).toEqual(['a', 'b', 'c']);
  });
});

describe('DokumenSelectionToolbar', () => {
  const noop = vi.fn();
  const props = { onMove: noop, onCopy: noop, onDelete: noop, onClear: noop };

  it('tidak merender apa pun saat count 0', () => {
    expect(render(<DokumenSelectionToolbar count={0} {...props} />)).toBe('');
  });

  it('menampilkan "3 dipilih" dan empat aksi (teks di layar lebar, ikon ber-aria-label di layar sempit)', () => {
    const html = render(<DokumenSelectionToolbar count={3} {...props} />);
    expect(html).toContain('3 dipilih');
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('position:sticky');
    for (const label of ['Pindahkan ke…', 'Salin ke…', 'Hapus', 'Batal']) {
      expect(html).toContain(`>${label}<`);
      expect(html).toContain(`aria-label="${label}"`);
    }
    // 4 Button teks + 4 ActionIcon ikon
    expect(html.match(/<button/g)).toHaveLength(8);
    expect(html).toContain('--button-color:var(--mantine-color-red-light-color)');
  });
});

describe('DokumenDraftRow — checkbox seleksi', () => {
  const draft: DokumenDraft = { key: 'draft-1', folderKey: null, fileId: 'f1', judul: 'APBDes 2025', realName: 'apbdes.pdf', mimeType: 'application/pdf' };
  const row = (selected: boolean) =>
    render(
      <DokumenDraftRow
        draft={draft}
        index={0}
        total={2}
        folderOptions={[{ value: 'umum', label: 'Umum' }]}
        folderValue="umum"
        selected={selected}
        onToggleSelect={vi.fn()}
        onJudul={vi.fn()}
        onFolder={vi.fn()}
        onMove={vi.fn()}
        onPreview={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
  const checkbox = (html: string) => html.match(/<input[^>]*type="checkbox"[^>]*>/)?.[0] ?? '';

  it('terpilih: checkbox checked dengan aria-label "Pilih <judul>" dan baris di-highlight', () => {
    const html = row(true);
    const input = checkbox(html);
    expect(input).toContain('aria-label="Pilih APBDes 2025"');
    expect(input).toMatch(/checked=""/);
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('var(--mantine-primary-color-light)');
  });

  it('tidak terpilih: checkbox unchecked tanpa highlight', () => {
    const html = row(false);
    const input = checkbox(html);
    expect(input).toContain('aria-label="Pilih APBDes 2025"');
    expect(input).not.toMatch(/checked=""/);
    expect(html).not.toContain('data-selected');
    expect(html).not.toContain('var(--mantine-primary-color-light)');
  });
});
