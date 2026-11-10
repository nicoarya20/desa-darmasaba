/** Pegawai PPID sebagaimana dikirim `pegawai/find-many` (hanya field yang dipakai bagan). */
export type PegawaiItem = {
  id: string;
  namaLengkap: string;
  isActive: boolean;
  image?: { link?: string | null } | null;
  posisi: { id: string; nama: string; hierarki: number; parentId?: string | null };
};

/** Jabatan dari `posisiorganisasi/find-many-all` — API ini tidak mengirim `parentId`. */
export type PosisiItem = { id: string; nama: string; hierarki: number };

/** Satu kotak bagan: satu jabatan beserta pegawai pertamanya (`person` null = belum ditugaskan). */
export type OrgNode = {
  posisiId: string;
  title: string;
  hierarki: number;
  person: { id: string; name: string; image: string | null } | null;
  children: OrgNode[];
};

type Draft = OrgNode & { parentId: string | null };

function sortNodes(nodes: OrgNode[]): OrgNode[] {
  return nodes.sort((a, b) => a.hierarki - b.hierarki || a.title.localeCompare(b.title, 'id'));
}

/**
 * Susun pohon bagan dari pegawai aktif. Jabatan induk yang belum punya pegawai diambil dari `posisiList`
 * dan digambar sebagai kotak "belum ditugaskan" agar bawahannya tetap tampil di bawah induknya. Induk dari
 * kotak itu tidak diketahui (API jabatan tidak mengirim `parentId`), jadi kotak tanpa induk ditempel ke akar
 * utama bila tingkatnya lebih rendah; selain itu tetap jadi akar terpisah.
 */
export function buildOrgTree(pegawai: readonly PegawaiItem[], posisiList: readonly PosisiItem[]): OrgNode[] {
  const drafts = new Map<string, Draft>();
  for (const p of pegawai) {
    if (!p.isActive || drafts.has(p.posisi.id)) continue; // satu kotak per jabatan, pegawai pertama
    drafts.set(p.posisi.id, {
      posisiId: p.posisi.id,
      title: p.posisi.nama,
      hierarki: p.posisi.hierarki,
      parentId: p.posisi.parentId ?? null,
      person: { id: p.id, name: p.namaLengkap, image: p.image?.link || null },
      children: [],
    });
  }

  const posisiById = new Map(posisiList.map((pos) => [pos.id, pos]));
  for (const draft of [...drafts.values()]) {
    const parent = draft.parentId ? posisiById.get(draft.parentId) : undefined;
    if (!parent || drafts.has(parent.id)) continue;
    drafts.set(parent.id, {
      posisiId: parent.id,
      title: parent.nama,
      hierarki: parent.hierarki,
      parentId: null,
      person: null,
      children: [],
    });
  }

  const roots: OrgNode[] = [];
  for (const draft of drafts.values()) {
    const parent = draft.parentId ? drafts.get(draft.parentId) : undefined;
    (parent ? parent.children : roots).push(draft);
  }

  sortNodes(roots);
  const [main, ...rest] = roots;
  const attached = main ? rest.filter((node) => node.hierarki > main.hierarki) : [];
  if (main) main.children.push(...attached);

  const strip = (node: OrgNode): OrgNode => ({
    posisiId: node.posisiId,
    title: node.title,
    hierarki: node.hierarki,
    person: node.person,
    children: sortNodes(node.children.map(strip)),
  });
  return roots.filter((node) => !attached.includes(node)).map(strip);
}

/** Saring bagan: kotak tetap tampil bila nama/jabatannya cocok atau ada keturunan yang cocok. */
export function filterOrgTree(nodes: readonly OrgNode[], query: string): OrgNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...nodes];
  return nodes.flatMap((node) => {
    const children = filterOrgTree(node.children, q);
    const hit = node.title.toLowerCase().includes(q) || Boolean(node.person?.name.toLowerCase().includes(q));
    return hit || children.length > 0 ? [{ ...node, children }] : [];
  });
}

/** Tingkat warna kartu: 0 akar, 1 bawahan langsung, 2 sisanya. */
export function toneForDepth(depth: number): 0 | 1 | 2 {
  return depth <= 0 ? 0 : depth === 1 ? 1 : 2;
}

/**
 * Posisi kotak ke-`index` di grup bawahan daun (`count` kotak, maksimal `maxCols` kolom per baris).
 * - `shift`  : geser baris terakhir yang tidak penuh ke tengah, dalam satuan lebar kolom + celah.
 * - `offset` : jarak garis induk (tengah grid) dari tengah kotak setelah digeser, dalam satuan yang sama;
 *              positif = garis induk di kanan kotak. Dipakai CSS untuk menggambar palang ke garis induk.
 */
export function leafSlot(
  index: number,
  count: number,
  maxCols: number,
): { cols: number; offset: number; shift: number } {
  const cols = Math.max(1, Math.min(count, maxCols));
  const column = (index % cols) + 1;
  const lastRowStart = (Math.ceil(count / cols) - 1) * cols;
  const shift = index >= lastRowStart ? (cols - (count - lastRowStart)) / 2 : 0;
  return { cols, offset: (cols + 1) / 2 - column - shift, shift };
}
