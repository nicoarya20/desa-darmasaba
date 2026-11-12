// Logika murni (tanpa I/O) untuk validasi atasan (parent) jabatan di bagan organisasi.

/** Simpul minimal bagan: id jabatan dan id atasannya (null = puncak). */
export type HierarchyNode = { id: string; parentId: string | null };

export type ParentValidation =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "SELF" | "CYCLE"; message: string };

/**
 * Validasi `parentId` untuk jabatan `id` (undefined saat create): atasan harus ada,
 * bukan dirinya sendiri, dan tidak boleh membentuk siklus (atasan ternyata bawahannya).
 */
export function validateParent({
  id,
  parentId,
  nodes,
}: {
  id?: string;
  parentId: string | null | undefined;
  nodes: readonly HierarchyNode[];
}): ParentValidation {
  if (!parentId) return { ok: true };
  if (id && parentId === id) {
    return { ok: false, reason: "SELF", message: "Jabatan tidak boleh menjadi atasan dirinya sendiri" };
  }

  const parentOf = new Map(nodes.map((node) => [node.id, node.parentId]));
  if (!parentOf.has(parentId)) {
    return { ok: false, reason: "NOT_FOUND", message: "Jabatan atasan tidak ditemukan" };
  }
  if (!id) return { ok: true };

  // Telusuri rantai atasan dari parent baru; bila bertemu `id`, berarti siklus.
  // `visited` menjaga loop tak berujung bila data lama sudah mengandung siklus.
  const visited = new Set<string>();
  let current: string | null | undefined = parentId;
  while (current && !visited.has(current)) {
    if (current === id) {
      return {
        ok: false,
        reason: "CYCLE",
        message: "Atasan tidak valid: jabatan tersebut adalah bawahan dari jabatan ini",
      };
    }
    visited.add(current);
    current = parentOf.get(current);
  }
  return { ok: true };
}
