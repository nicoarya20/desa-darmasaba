'use client';
import { useMemo, useState } from 'react';
import type { DokumenDraft } from '../_lib/dokumen-draft';
import {
  emptySelection,
  pruneSelection,
  selectRange,
  setSelected,
  toggleSelection,
  type Selection,
} from '../_lib/dokumen-selection';

/**
 * State seleksi dokumen editor: klik biasa = toggle, Shift+klik = rentang dari anchor (key terakhir diklik)
 * menurut `orderedKeys`. Key yang sudah tidak ada di draft (dihapus/folder dihapus) dibuang otomatis.
 */
export function useDokumenSelection(dokumen: readonly DokumenDraft[], orderedKeys: readonly string[]) {
  const [raw, setRaw] = useState<Selection>(emptySelection);
  const [anchor, setAnchor] = useState<string | null>(null);
  const selection = useMemo(() => pruneSelection(raw, dokumen.map((d) => d.key)), [raw, dokumen]);

  const toggle = (key: string, shiftKey: boolean) => {
    setRaw(shiftKey ? selectRange(selection, orderedKeys, anchor, key) : toggleSelection(selection, key));
    setAnchor(key);
  };
  const selectAll = (keys: readonly string[], checked: boolean) => setRaw(setSelected(selection, keys, checked));

  return { selection, toggle, selectAll, replace: setRaw };
}
