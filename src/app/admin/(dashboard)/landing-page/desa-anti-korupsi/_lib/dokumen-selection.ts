// Logika murni seleksi banyak dokumen di editor admin Desa Anti Korupsi:
// toggle, rentang Shift+klik, pilih semua per folder, status checkbox header, buang key usang.
// Setiap fungsi mengembalikan Set baru; Set masukan tidak pernah diubah.

/** Kumpulan key DokumenDraft yang sedang dipilih (immutable). */
export type Selection = ReadonlySet<string>;

/** Status checkbox header sekumpulan key: tidak ada / sebagian / semua terpilih. */
export type SelectionState = 'none' | 'some' | 'all';

/** Seleksi kosong baru. */
export function emptySelection(): Selection {
  return new Set<string>();
}

/** Balik status pilih satu key. */
export function toggleSelection(sel: Selection, key: string): Selection {
  const next = new Set(sel);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/**
 * Shift+klik: pilih semua key di antara anchor dan key (inklusif) menurut urutan `orderedKeys`.
 * Anchor null / tidak ada di `orderedKeys` (atau key sendiri tidak ada) → toggle biasa.
 */
export function selectRange(
  sel: Selection,
  orderedKeys: readonly string[],
  anchorKey: string | null,
  key: string,
): Selection {
  const from = anchorKey === null ? -1 : orderedKeys.indexOf(anchorKey);
  const to = orderedKeys.indexOf(key);
  if (from < 0 || to < 0) return toggleSelection(sel, key);
  const [start, end] = from <= to ? [from, to] : [to, from];
  return setSelected(sel, orderedKeys.slice(start, end + 1), true);
}

/** Tambah (`checked` true) atau hapus (`checked` false) sekumpulan key sekaligus — "Pilih semua" per folder. */
export function setSelected(sel: Selection, keys: readonly string[], checked: boolean): Selection {
  const next = new Set(sel);
  for (const key of keys) {
    if (checked) next.add(key);
    else next.delete(key);
  }
  return next;
}

/** Status pilih `keys` di dalam seleksi; `keys` kosong → 'none'. */
export function selectionStateOf(sel: Selection, keys: readonly string[]): SelectionState {
  if (keys.length === 0) return 'none';
  let count = 0;
  for (const key of keys) if (sel.has(key)) count++;
  if (count === 0) return 'none';
  return count === keys.length ? 'all' : 'some';
}

/** Buang key yang sudah tidak ada (mis. setelah dokumen dihapus/dipindah). */
export function pruneSelection(sel: Selection, existingKeys: Iterable<string>): Selection {
  const existing = new Set(existingKeys);
  const next = new Set<string>();
  for (const key of sel) if (existing.has(key)) next.add(key);
  return next;
}
