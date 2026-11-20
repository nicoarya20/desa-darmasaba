import { cardsOf, type OrgCardItem, type OrgNode } from './struktur.logic';
import { TIER_CLUSTER_MAX } from './struktur.meta';

/*
 * Bagan bertingkat (Perangkat Desa & PPID): satu batang tegak turun dari akar, bawahan langsung akar dikelompokkan per
 * `hierarki` menjadi klaster ≤ TIER_CLUSTER_MAX kartu yang digantung di kiri/kanan batang. Aturan susun:
 * 1. Tingkat = bawahan langsung akar dengan `hierarki` sama, urut naik.
 * 2. Dalam satu tingkat, jabatan yang punya bawahan → klaster berkepala (kartu jabatan + bawahannya berpalang);
 *    jabatan tanpa bawahan yang berurutan → kartunya dibagi rata jadi klaster datar (6 → 3+3, 4 → 2+2, 5 → 3+2).
 * 3. Klaster ditaruh berpasangan per band (kiri, kanan) sesuai urutan. Klaster sisa tanpa pasangan berbagi band
 *    dengan tingkat berikutnya bila tingkat itu hanya satu klaster (Sekdes + Kasi di gambar referensi).
 * 4. Pasangan berkepala + datar: berkepala di KANAN, datar di KIRI dan diturunkan sejajar baris bawahan kepala
 *    (`lower`). Pasangan sejenis: yang lebih dulu di kiri. Klaster sendirian: berkepala kanan, datar kiri.
 * 5. Satu bawahan akar yang tidak muat satu klaster (bawahannya > maks kartu, atau punya cucu berbawahan) jadi
 *    kartu DI batang (band `trunk`) setelah semua klaster saudaranya, lalu bawahannya disusun ulang dengan aturan
 *    yang sama di bawah kartu itu (PPID: Kepala Desa → Sekdes → 6 staf). Garis yang menempel batang di atas kartu
 *    itu = bawahan akar, di bawahnya = bawahan kartu itu.
 * Bentuk yang tidak muat aturan ini (lebih dari satu bawahan akar seperti aturan 5, kepala > maks kartu) → `null`,
 * pemakai kembali ke bagan pohon biasa.
 */

/** Satu klaster: kartu kepala (kosong = klaster datar) + kartu bawahan berpalang (≤ TIER_CLUSTER_MAX). */
export type TierUnit = { key: string; head: OrgCardItem[]; cards: OrgCardItem[] };

export type TierSide = 'left' | 'right';

/** Klaster di band: sisi batang + `lower` = sejajar baris bawahan klaster berkepala di sisi seberang. */
export type TierPlacement = { unit: TierUnit; side: TierSide; lower: boolean };

/** Satu band (baris bagan) berisi 1-2 klaster, urut pangkat (bukan urut kiri/kanan). */
export type TierUnitBand = { kind: 'units'; key: string; units: TierPlacement[] };

/** Kartu jabatan yang duduk di batang (aturan 5); band sesudahnya = bawahannya. */
export type TierTrunkBand = { kind: 'trunk'; key: string; cards: OrgCardItem[] };

export type TierBand = TierUnitBand | TierTrunkBand;

/** Bagi `items` jadi potongan berurutan ≤ `max` dengan ukuran serata mungkin: 6 → 3+3, 5 → 3+2, 7 → 3+2+2. */
export function splitBalanced<T>(items: readonly T[], max: number): T[][] {
  const parts = Math.ceil(items.length / Math.max(1, max));
  const base = Math.floor(items.length / Math.max(1, parts));
  const extra = items.length % Math.max(1, parts);
  const out: T[][] = [];
  for (let i = 0, start = 0; i < parts; i++) {
    const size = base + (i < extra ? 1 : 0);
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
}

/** Bawahan langsung akar per `hierarki`, urut naik; urutan dalam tingkat mengikuti pohon. */
function tiersOf(root: OrgNode): OrgNode[][] {
  const byLevel = new Map<number, OrgNode[]>();
  for (const child of root.children) byLevel.set(child.hierarki, [...(byLevel.get(child.hierarki) ?? []), child]);
  return [...byLevel.entries()].sort(([a], [b]) => a - b).map(([, nodes]) => nodes);
}

/** Klaster satu tingkat (aturan 2); `null` bila ada jabatan berbawahan yang tidak muat satu klaster. */
function unitsOf(tier: readonly OrgNode[], max: number): TierUnit[] | null {
  const units: TierUnit[] = [];
  let run: OrgCardItem[] = [];
  const flush = () => {
    for (const cards of splitBalanced(run, max)) units.push({ key: cards[0].key, head: [], cards });
    run = [];
  };
  for (const node of tier) {
    if (node.children.length === 0) {
      run.push(...cardsOf(node));
      continue;
    }
    const head = cardsOf(node);
    const cards = node.children.flatMap(cardsOf);
    if (node.children.some((child) => child.children.length > 0) || head.length > max || cards.length > max) return null;
    flush();
    units.push({ key: node.posisiId, head, cards });
  }
  flush();
  return units;
}

const isHead = (unit: TierUnit) => unit.head.length > 0;

/** Sisi klaster yang sendirian di band (aturan 4). */
function alone(unit: TierUnit): TierPlacement[] {
  return [{ unit, side: isHead(unit) ? 'right' : 'left', lower: false }];
}

/** Sisi dua klaster sebanding (aturan 4); urutan hasil tetap urut pangkat. */
function pair(first: TierUnit, second: TierUnit): TierPlacement[] {
  if (isHead(first) === isHead(second)) {
    return [
      { unit: first, side: 'left', lower: false },
      { unit: second, side: 'right', lower: false },
    ];
  }
  return [first, second].map((unit) => ({ unit, side: isHead(unit) ? 'right' : 'left', lower: !isHead(unit) }));
}

/** Bawahan berbawahan yang tidak muat satu klaster berkepala (calon kartu di batang, aturan 5). */
function overflows(node: OrgNode, max: number): boolean {
  if (node.children.length === 0) return false;
  return node.children.some((child) => child.children.length > 0) || node.children.flatMap(cardsOf).length > max;
}

/** Band klaster untuk bawahan akar yang semuanya muat klaster (aturan 1-4); `null` bila ada yang tidak muat. */
function planUnitBands(root: OrgNode, max: number): TierUnitBand[] | null {
  const tiers: TierUnit[][] = [];
  for (const tier of tiersOf(root)) {
    const units = unitsOf(tier, max);
    if (!units) return null;
    tiers.push(units);
  }

  const bands: TierPlacement[][] = [];
  let carry: TierUnit | null = null;
  for (const units of tiers) {
    const queue = [...units];
    if (carry) {
      if (queue.length === 1) {
        bands.push(pair(carry, queue[0]));
        carry = null;
        continue;
      }
      bands.push(alone(carry));
      carry = null;
    }
    while (queue.length >= 2) bands.push(pair(queue.shift() as TierUnit, queue.shift() as TierUnit));
    carry = queue.shift() ?? null;
  }
  if (carry) bands.push(alone(carry));
  return bands.map((units) => ({ kind: 'units', key: units.map((p) => p.unit.key).join('|'), units }));
}

/**
 * Rencana band bagan bertingkat untuk satu akar (aturan di atas berkas). Akar tanpa bawahan → `[]` (hanya kartu
 * akar). `null` = bentuk pohon tidak cocok untuk bagan bertingkat → pakai bagan pohon biasa.
 */
export function planTierBands(root: OrgNode, max: number = TIER_CLUSTER_MAX): TierBand[] | null {
  const trunk = root.children.filter((child) => overflows(child, max));
  if (trunk.length > 1) return null;
  const [mid] = trunk;
  const siblings = planUnitBands(mid ? { ...root, children: root.children.filter((c) => c !== mid) } : root, max);
  if (!siblings || !mid) return siblings;
  const cards = cardsOf(mid);
  const below = cards.length <= max ? planTierBands(mid, max) : null;
  if (!below) return null;
  return [...siblings, { kind: 'trunk', key: `trunk:${mid.posisiId}`, cards }, ...below];
}
