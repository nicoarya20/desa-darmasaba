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

/** Pegawai yang ditampilkan di kartu. */
export type OrgPerson = { id: string; name: string; image: string | null };

/** Satu jabatan di bagan beserta semua pegawai aktifnya (`people` kosong = belum ditugaskan). */
export type OrgNode = {
  posisiId: string;
  title: string;
  hierarki: number;
  people: OrgPerson[];
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
    if (!p.isActive) continue;
    const person = { id: p.id, name: p.namaLengkap, image: p.image?.link || null };
    const existing = drafts.get(p.posisi.id);
    if (existing) {
      existing.people.push(person); // satu jabatan bisa berisi beberapa pegawai — semuanya tampil
      continue;
    }
    drafts.set(p.posisi.id, {
      posisiId: p.posisi.id,
      title: p.posisi.nama,
      hierarki: p.posisi.hierarki,
      parentId: p.posisi.parentId ?? null,
      people: [person],
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
      people: [],
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
    people: node.people,
    children: sortNodes(node.children.map(strip)),
  });
  return roots.filter((node) => !attached.includes(node)).map(strip);
}

/**
 * Saring bagan: jabatan tetap tampil bila judulnya cocok (semua pegawainya ikut), ada pegawai yang namanya
 * cocok (hanya pegawai itu yang tampil), atau ada keturunan yang cocok (sebagai leluhur, pegawai utuh).
 */
export function filterOrgTree(nodes: readonly OrgNode[], query: string): OrgNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...nodes];
  return nodes.flatMap((node) => {
    const children = filterOrgTree(node.children, q);
    if (node.title.toLowerCase().includes(q)) return [{ ...node, children }];
    const people = node.people.filter((person) => person.name.toLowerCase().includes(q));
    if (people.length > 0) return [{ ...node, people, children }];
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

/** Satu kartu yang digambar: jabatan + satu pegawai (null = belum ditugaskan). */
export type OrgCardItem = { key: string; title: string; person: OrgPerson | null };

/** Kartu-kartu sebuah jabatan: satu per pegawai, atau satu kartu kosong bila belum ditugaskan. */
export function cardsOf(node: OrgNode): OrgCardItem[] {
  if (node.people.length === 0) return [{ key: node.posisiId, title: node.title, person: null }];
  return node.people.map((person) => ({ key: `${node.posisiId}:${person.id}`, title: node.title, person }));
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
