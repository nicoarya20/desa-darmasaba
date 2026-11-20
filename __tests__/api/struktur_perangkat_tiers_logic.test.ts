// @vitest-environment node
// Bagan bertingkat Struktur Perangkat Desa & PPID: pengelompokan bawahan akar per hierarki → klaster ≤3 kiri/kanan batang.
import { describe, expect, it } from 'vitest';
import { buildOrgTree, filterOrgTree, type OrgNode, type PegawaiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import { planTierBands, splitBalanced, type TierBand } from '@/app/(public)/_com/struktur-organisasi/struktur-tiers.logic';
import { TIER_CLUSTER_MAX } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';

// test-only: bentuk data prod 2026-11-18 (nama pegawai disingkat): Perbekel → Sekdes (→ 3 Kaur), 3 Kasi,
// 12 Kelian Banjar Dinas (hierarki 5 & 6), 12 Kelian Banjar Adat (hierarki 7 & 8); semua selain Kaur di bawah Perbekel.
let seq = 0;
const pegawai = (posisiId: string, nama: string, hierarki: number, parentId: string | null, urutan = 0): PegawaiItem => {
  seq += 1;
  return {
    id: `p${seq}`,
    namaLengkap: `Pegawai ${nama}`,
    isActive: true,
    image: null,
    posisi: { id: posisiId, nama, hierarki, parentId, urutan },
  };
};
const BANJAR_5 = ['Cabe', 'Menesa', 'Darmasaba', 'Penenjoan', 'Baler Pasar', 'Bucu'];
const BANJAR_6 = ['Tengah', 'Gulingan', 'Telanga', 'Taman', 'Umahanyar', 'Bersih'];
const kelian = (jenis: string, names: string[], hierarki: number) =>
  names.map((n, i) => pegawai(`kel-${jenis}-${n}`, `Kelian Banjar ${jenis} ${n}`, hierarki, 'per', i + 1));
const PROD: PegawaiItem[] = [
  pegawai('per', 'Perbekel', 1, null),
  pegawai('sek', 'Sekretaris Desa', 2, 'per'),
  pegawai('kaur-tu', 'Kepala Urusan Tata Usaha & Umum', 3, 'sek', 1),
  pegawai('kaur-keu', 'Kepala Urusan Keuangan', 3, 'sek', 2),
  pegawai('kaur-ren', 'Kepala Urusan Perencanaan', 3, 'sek', 3),
  pegawai('kasi-pem', 'Kepala Seksi Pemerintahan', 4, 'per', 1),
  pegawai('kasi-kes', 'Kepala Seksi Kesejahteraan', 4, 'per', 2),
  pegawai('kasi-pel', 'Kepala Seksi Pelayanan', 4, 'per', 3),
  ...kelian('Dinas', BANJAR_5, 5),
  ...kelian('Dinas', BANJAR_6, 6),
  ...kelian('Adat', BANJAR_5, 7),
  ...kelian('Adat', BANJAR_6, 8),
];
const tree = buildOrgTree(PROD, []);

/** Ringkasan band: `sisi[turun]:kepala>kartu,kartu` per klaster, urut pangkat. */
const summary = (bands: readonly TierBand[] | null) =>
  bands?.map((band) =>
    band.kind === 'trunk' ? [`batang:${band.cards.map((card) => card.title).join('+')}`] : band.units.map(({ unit, side, lower }) => {
      const titles = unit.cards.map((card) => card.title.replace(/^(Kepala (Urusan|Seksi)|Kelian Banjar) /, ''));
      const head = unit.head.map((card) => card.title).join('+');
      return `${side}${lower ? '[turun]' : ''}:${head ? `${head}>` : ''}${titles.join(',')}`;
    }),
  );

const node = (id: string, hierarki: number, children: OrgNode[] = [], people = 1): OrgNode => ({
  posisiId: id,
  title: id,
  hierarki,
  people: Array.from({ length: people }, (_, i) => ({ id: `${id}-${i}`, name: `Nama ${id} ${i}`, image: null })),
  children,
});

describe('splitBalanced', () => {
  it('membagi rata berurutan, tiap potongan ≤ maks', () => {
    const sizes = (n: number) => splitBalanced(Array.from({ length: n }, (_, i) => i), 3).map((part) => part.length);
    expect(sizes(0)).toEqual([]);
    expect(sizes(1)).toEqual([1]);
    expect(sizes(3)).toEqual([3]);
    expect(sizes(4)).toEqual([2, 2]);
    expect(sizes(5)).toEqual([3, 2]);
    expect(sizes(6)).toEqual([3, 3]);
    expect(sizes(7)).toEqual([3, 2, 2]);
    expect(splitBalanced(['a', 'b', 'c', 'd'], 3)).toEqual([['a', 'b'], ['c', 'd']]);
  });
});

describe('planTierBands — data prod Perangkat Desa', () => {
  const bands = planTierBands(tree[0]);

  it('satu akar Perbekel, maksimal klaster = konstanta bernama', () => {
    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe('Perbekel');
    expect(TIER_CLUSTER_MAX).toBe(3);
  });

  it('band 1: Sekdes berkepala (3 Kaur) di kanan, 3 Kasi di kiri diturunkan sejajar baris Kaur', () => {
    expect(summary(bands)?.[0]).toEqual([
      'right:Sekretaris Desa>Tata Usaha & Umum,Keuangan,Perencanaan',
      'left[turun]:Pemerintahan,Kesejahteraan,Pelayanan',
    ]);
  });

  it('tiap baris 6 Kelian → 3 kiri + 3 kanan, termasuk 2 baris Kelian Banjar Adat', () => {
    expect(summary(bands)?.slice(1)).toEqual([
      ['left:Dinas Cabe,Dinas Menesa,Dinas Darmasaba', 'right:Dinas Penenjoan,Dinas Baler Pasar,Dinas Bucu'],
      ['left:Dinas Tengah,Dinas Gulingan,Dinas Telanga', 'right:Dinas Taman,Dinas Umahanyar,Dinas Bersih'],
      ['left:Adat Cabe,Adat Menesa,Adat Darmasaba', 'right:Adat Penenjoan,Adat Baler Pasar,Adat Bucu'],
      ['left:Adat Tengah,Adat Gulingan,Adat Telanga', 'right:Adat Taman,Adat Umahanyar,Adat Bersih'],
    ]);
  });

  it('tanpa kartu di batang: semua bawahan akar muat klaster', () => {
    expect(bands?.every((band) => band.kind === 'units')).toBe(true);
  });

  it('semua 31 bawahan tampil tepat sekali, tidak ada klaster > 3 kartu', () => {
    const units = bands?.flatMap((band) => (band.kind === 'units' ? band.units.map((p) => p.unit) : [])) ?? [];
    const cards = units.flatMap((unit) => [...unit.head, ...unit.cards]);
    expect(cards).toHaveLength(31);
    expect(new Set(cards.map((card) => card.key)).size).toBe(31);
    expect(units.every((unit) => unit.cards.length <= 3 && unit.cards.length > 0)).toBe(true);
  });

  it('kunci band unik (dipakai sebagai React key)', () => {
    const keys = bands?.map((band) => band.key) ?? [];
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('planTierBands — hasil pencarian (filterOrgTree)', () => {
  it('"cabe": dua tingkat satu kartu berbagi satu band, kiri lalu kanan', () => {
    const [root] = filterOrgTree(tree, 'cabe');
    expect(summary(planTierBands(root))).toEqual([['left:Dinas Cabe', 'right:Adat Cabe']]);
  });

  it('"perbekel": akar tanpa bawahan → tanpa band (tanpa garis yatim)', () => {
    const [root] = filterOrgTree(tree, 'perbekel');
    expect(planTierBands(root)).toEqual([]);
  });

  it('"keuangan": Sekdes tetap sebagai kepala leluhur dengan satu Kaur, sendirian di kanan', () => {
    const [root] = filterOrgTree(tree, 'keuangan');
    expect(summary(planTierBands(root))).toEqual([['right:Sekretaris Desa>Keuangan']]);
  });

  it('"seksi": klaster datar sendirian → kiri', () => {
    const [root] = filterOrgTree(tree, 'seksi');
    expect(summary(planTierBands(root))).toEqual([['left:Pemerintahan,Kesejahteraan,Pelayanan']]);
  });
});

describe('planTierBands — aturan generik', () => {
  it('klaster sisa berbagi band dengan tingkat berikutnya yang hanya satu klaster', () => {
    const leaves = Array.from({ length: 7 }, (_, i) => node(`a${i}`, 2));
    const root = node('akar', 1, [...leaves, node('b0', 3)]);
    const bands = planTierBands(root) ?? [];
    expect(bands.map((band) => (band.kind === 'units' ? band.units.map((p) => `${p.side}:${p.unit.cards.length}`) : []))).toEqual([
      ['left:3', 'right:2'],
      ['left:2', 'right:1'],
    ]);
  });

  it('dua klaster berkepala setingkat → yang lebih dulu di kiri, tanpa diturunkan', () => {
    const root = node('akar', 1, [node('x', 2, [node('x1', 3)]), node('y', 2, [node('y1', 3)])]);
    const [band] = planTierBands(root) ?? [];
    expect(band.kind === 'units' && band.units.map((p) => [p.unit.key, p.side, p.lower])).toEqual([
      ['x', 'left', false],
      ['y', 'right', false],
    ]);
  });

  it('tingkat berkepala sendirian lalu tingkat berklaster dua → band terpisah, kepala di kanan', () => {
    const root = node('akar', 1, [node('x', 2, [node('x1', 3)]), ...Array.from({ length: 6 }, (_, i) => node(`k${i}`, 4))]);
    expect(planTierBands(root)?.map((band) => (band.kind === 'units' ? band.units.map((p) => p.side) : []))).toEqual([
      ['right'],
      ['left', 'right'],
    ]);
  });

  it('jabatan berisi beberapa pegawai → tiap pegawai satu kartu, ikut dibagi klaster', () => {
    const root = node('akar', 1, [node('staf', 2, [], 4)]);
    const [band] = planTierBands(root) ?? [];
    expect(band.kind === 'units' && band.units.map((p) => p.unit.cards.length)).toEqual([2, 2]);
  });

  it('kepala > 3 bawahan → kartu di batang, bawahannya disusun di bawahnya', () => {
    const wideHead = node('akar', 1, [node('x', 2, Array.from({ length: 4 }, (_, i) => node(`x${i}`, 3)))]);
    expect(summary(planTierBands(wideHead))).toEqual([['batang:x'], ['left:x0,x1', 'right:x2,x3']]);
  });

  it('cucu berbawahan → kartu di batang, cucu jadi klaster berkepala di bawahnya', () => {
    const deep = node('akar', 1, [node('x', 2, [node('x1', 3, [node('x2', 4)])])]);
    expect(summary(planTierBands(deep))).toEqual([['batang:x'], ['right:x1>x2']]);
  });

  it('saudara kartu di batang tetap di atasnya (menempel batang milik akar)', () => {
    const root = node('akar', 1, [node('x', 2, Array.from({ length: 4 }, (_, i) => node(`x${i}`, 3))), node('k', 3)]);
    expect(summary(planTierBands(root))).toEqual([['left:k'], ['batang:x'], ['left:x0,x1', 'right:x2,x3']]);
  });

  it('bentuk tak cocok → null (pemakai kembali ke bagan pohon)', () => {
    const wide = (p: string) => Array.from({ length: 4 }, (_, i) => node(`${p}${i}`, 3));
    const twoTrunks = node('akar', 1, [node('x', 2, wide('x')), node('y', 2, wide('y'))]);
    const crowdedHead = node('akar', 1, [node('x', 2, [node('x1', 3)], 4)]);
    const crowdedTrunk = node('akar', 1, [node('x', 2, wide('x'), 4)]);
    expect(planTierBands(twoTrunks)).toBeNull();
    expect(planTierBands(crowdedHead)).toBeNull();
    expect(planTierBands(crowdedTrunk)).toBeNull();
  });
});

// test-only: bentuk data Struktur PPID 2026-11-20 (nama disingkat). Prod: Kepala Desa → Sekdes → 6 staf (hierarki
// 3-5). Stg: Kepala Desa → Kaur Umum & TU (kosong, → Kaur Keuangan) + Sekdes (→ 5 Kepala Dusun).
describe('planTierBands — Struktur PPID', () => {
  const staf = (id: string, nama: string, hierarki: number) => pegawai(id, nama, hierarki, 'sekretaris_desa');
  const KADES = pegawai('kepala_desa', 'Kepala Desa', 1, null);
  const SEKDES = pegawai('sekretaris_desa', 'Sekretaris Desa', 2, 'kepala_desa');

  it('prod: Sekdes di batang, 6 staf dikelompokkan per hierarki di bawahnya', () => {
    const [root] = buildOrgTree(
      [
        KADES,
        SEKDES,
        staf('it', 'Staf IT', 3),
        staf('kaur-tu', 'Kaur TU dan Umum', 3),
        staf('staf-tu', 'Staff TU dan Umum', 4),
        staf('kaur-ren', 'Kaur Perencanaan', 4),
        staf('kasi-pel', 'Kasi Pelayanan', 5),
        staf('kasi-pem', 'Kasi Pemerintahan', 5),
      ],
      [],
    );
    expect(summary(planTierBands(root))).toEqual([
      ['batang:Sekretaris Desa'],
      ['left:Kaur TU dan Umum,Staf IT', 'right:Kaur Perencanaan,Staff TU dan Umum'],
      ['left:Kasi Pelayanan,Kasi Pemerintahan'],
    ]);
  });

  it('stg: Kaur Umum & TU (kosong) berkepala di atas, Sekdes di batang, 5 Kepala Dusun 3+2 di bawahnya', () => {
    const kadus = ['Taman', 'Gulingan', 'Menesa', 'Darmasaba', 'Bucu'].map((n) => staf(`kadus-${n}`, `Kadus ${n}`, 3));
    const posisi = [
      { id: 'kepala_desa', nama: 'Kepala Desa', hierarki: 1, parentId: null },
      { id: 'kaur_umum', nama: 'Kaur Umum & TU', hierarki: 2, parentId: 'kepala_desa' },
      { id: 'sekretaris_desa', nama: 'Sekretaris Desa', hierarki: 2, parentId: 'kepala_desa' },
    ];
    const [root] = buildOrgTree([KADES, SEKDES, ...kadus, pegawai('kaur_keu', 'Kaur Keuangan', 3, 'kaur_umum')], posisi);
    expect(summary(planTierBands(root))).toEqual([
      ['right:Kaur Umum & TU>Kaur Keuangan'],
      ['batang:Sekretaris Desa'],
      ['left:Kadus Bucu,Kadus Darmasaba,Kadus Gulingan', 'right:Kadus Menesa,Kadus Taman'],
    ]);
  });
});
