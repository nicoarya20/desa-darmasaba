import { buildOrgTree, type OrgNode, type PegawaiItem, type PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';

/** Awalan id pegawai bayangan; tidak mungkin bentrok dengan id cuid dari database. */
const VACANT_PREFIX = '__kosong__:';

function stripVacant(node: OrgNode): OrgNode {
  return {
    ...node,
    people: node.people.filter((person) => !person.id.startsWith(VACANT_PREFIX)),
    children: node.children.map(stripVacant),
  };
}

/**
 * Pohon bagan admin: semua pegawai aktif per jabatan + SEMUA jabatan aktif, termasuk yang belum punya pegawai
 * ("Belum ditugaskan"). `buildOrgTree` (bagan publik) hanya menampilkan jabatan yang berpegawai beserta
 * leluhurnya, jadi tiap jabatan kosong diberi satu pegawai bayangan lalu dibuang lagi setelah pohon tersusun —
 * susunan induk, urutan, dan penanganan siklus tetap sepenuhnya milik `buildOrgTree`.
 */
export function buildAdminOrgTree(pegawai: readonly PegawaiItem[], posisi: readonly (PosisiItem & { isActive?: boolean })[]): OrgNode[] {
  const aktif = posisi.filter((pos) => pos.isActive !== false);
  const terisi = new Set(pegawai.filter((p) => p.isActive).map((p) => p.posisi.id));
  const bayangan: PegawaiItem[] = aktif
    .filter((pos) => !terisi.has(pos.id))
    .map((pos) => ({ id: `${VACANT_PREFIX}${pos.id}`, namaLengkap: '', isActive: true, image: null, posisi: pos }));
  return buildOrgTree([...pegawai, ...bayangan], aktif).map(stripVacant);
}
