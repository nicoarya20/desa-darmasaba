/**
 * Urutan putar (play order) pemutar musik: murni, tanpa React, supaya bisa diuji.
 * Urutan berisi id lagu; navigasi next/prev memakai indeks di urutan ini (lihat musicNavigation.ts).
 */

/** Acak salinan daftar dengan Fisher-Yates; `random` disuntik agar test deterministik. */
export function shuffleIds(ids: readonly string[], random: () => number = Math.random): string[] {
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Urutan acak baru: lagu saat ini (bila ada di pustaka) tetap di depan, sisanya diacak sekali.
 * Tanpa lagu saat ini → seluruh pustaka diacak.
 */
export function buildShuffledOrder(
  libraryIds: readonly string[],
  currentId: string | null,
  random: () => number = Math.random
): string[] {
  if (currentId === null || !libraryIds.includes(currentId)) {
    return shuffleIds(libraryIds, random);
  }
  return [currentId, ...shuffleIds(libraryIds.filter((id) => id !== currentId), random)];
}

/**
 * Selaraskan urutan acak yang tersimpan dengan isi pustaka terbaru: id yang sudah tidak ada dibuang,
 * id baru ditambahkan di belakang dengan urutan pustaka. Urutan acak yang sudah ada tidak diacak ulang.
 */
export function reconcileOrder(order: readonly string[], libraryIds: readonly string[]): string[] {
  const library = new Set(libraryIds);
  const kept = order.filter((id) => library.has(id));
  const keptSet = new Set(kept);
  return [...kept, ...libraryIds.filter((id) => !keptSet.has(id))];
}

/**
 * Lagu berikutnya setelah lagu saat ini: dari posisinya sampai ujung urutan, lalu sambung dari awal
 * sampai sebelum lagu saat ini. Tanpa lagu saat ini (atau tidak ada di urutan) → seluruh urutan.
 */
export function computeUpNext(order: readonly string[], currentId: string | null): string[] {
  const pos = currentId === null ? -1 : order.indexOf(currentId);
  if (pos < 0) return [...order];
  return [...order.slice(pos + 1), ...order.slice(0, pos)];
}

/** Ubah daftar id menjadi lagu dari pustaka (urutan id dipertahankan); id yang sudah tidak ada dibuang. */
export function resolveIds<T extends { id: string }>(ids: readonly string[], library: readonly T[]): T[] {
  const byId = new Map(library.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}
