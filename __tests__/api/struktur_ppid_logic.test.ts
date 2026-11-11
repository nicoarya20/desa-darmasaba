// @vitest-environment node
// Bagan Struktur PPID: susunan pohon dari pegawai aktif + jabatan induk yang belum ditugaskan.
import { describe, expect, it } from 'vitest';
import {
  buildOrgTree,
  cardsOf,
  filterOrgTree,
  leafSlot,
  toneForDepth,
  type OrgNode,
  type PegawaiItem,
  type PosisiItem,
} from '@/app/(public)/_com/struktur-organisasi/struktur.logic';

// test-only: bentuk data mengikuti respons stg 2026-11-10 (nama disingkat).
const pegawai = (
  id: string,
  posisiId: string,
  nama: string,
  hierarki: number,
  parentId: string | null,
  extra: Partial<PegawaiItem> = {},
): PegawaiItem => ({
  id,
  namaLengkap: `Pegawai ${id}`,
  isActive: true,
  image: null,
  posisi: { id: posisiId, nama, hierarki, parentId },
  ...extra,
});

const STG: PegawaiItem[] = [
  pegawai('p1', 'kepala_desa', 'Kepala Desa', 1, null),
  pegawai('p2', 'sekretaris_desa', 'Sekretaris Desa', 2, 'kepala_desa'),
  pegawai('p3', 'kaur_keuangan', 'Kaur Keuangan', 3, 'kaur_umum'),
  pegawai('p4', 'kadus_taman', 'Kepala Dusun Banjar Dinas Taman', 3, 'sekretaris_desa'),
  pegawai('p5', 'kadus_bucu', 'Kepala Dusun Banjar Dinas Bucu', 3, 'sekretaris_desa', {
    image: { link: '/api/img/foto.webp' },
  }),
  pegawai('p6', 'staf_desa', 'Staf Desa', 3, 'sekretaris_desa', { isActive: false }),
];

const POSISI: PosisiItem[] = [
  { id: 'kepala_desa', nama: 'Kepala Desa', hierarki: 1 },
  { id: 'sekretaris_desa', nama: 'Sekretaris Desa', hierarki: 2 },
  { id: 'kaur_umum', nama: 'Kaur Umum & TU', hierarki: 2 },
  { id: 'kaur_keuangan', nama: 'Kaur Keuangan', hierarki: 3 },
];

const titles = (nodes: OrgNode[]) => nodes.map((n) => n.title);

describe('buildOrgTree', () => {
  it('menyusun satu akar Kepala Desa dengan jabatan induk kosong sebagai kotak "belum ditugaskan"', () => {
    const roots = buildOrgTree(STG, POSISI);
    expect(titles(roots)).toEqual(['Kepala Desa']);

    const [kades] = roots;
    expect(titles(kades.children)).toEqual(['Kaur Umum & TU', 'Sekretaris Desa']);

    const [kaurUmum, sekdes] = kades.children;
    expect(kaurUmum.people).toEqual([]);
    expect(titles(kaurUmum.children)).toEqual(['Kaur Keuangan']);
    expect(kaurUmum.children[0].people.map((p) => p.name)).toEqual(['Pegawai p3']);

    // Pegawai nonaktif (Staf Desa) tidak tampil; anak diurut tingkat lalu nama jabatan.
    expect(titles(sekdes.children)).toEqual([
      'Kepala Dusun Banjar Dinas Bucu',
      'Kepala Dusun Banjar Dinas Taman',
    ]);
  });

  it('membawa id pegawai dan link foto (kosong → null)', () => {
    const [kades] = buildOrgTree(STG, POSISI);
    const bucu = kades.children[1].children[0];
    expect(bucu.people).toEqual([{ id: 'p5', name: 'Pegawai p5', image: '/api/img/foto.webp' }]);
    expect(kades.people[0].image).toBeNull();
  });

  it('tanpa daftar jabatan, bawahan yang induknya tak berpegawai ditempel ke akar utama (tetap tampil)', () => {
    const [kades, ...rest] = buildOrgTree(STG, []);
    expect(rest).toEqual([]);
    expect(titles(kades.children)).toEqual(['Sekretaris Desa', 'Kaur Keuangan']);
  });

  it('satu jabatan berisi beberapa pegawai → satu simpul dengan semua pegawai aktif, urutan data', () => {
    const data = [
      pegawai('a', 'kepala_desa', 'Kepala Desa', 1, null),
      pegawai('b', 'staf_desa', 'Staf Desa', 2, 'kepala_desa', { isActive: false }),
      pegawai('c', 'staf_desa', 'Staf Desa', 2, 'kepala_desa'),
      pegawai('d', 'staf_desa', 'Staf Desa', 2, 'kepala_desa'),
    ];
    const [kades] = buildOrgTree(data, []);
    expect(titles(kades.children)).toEqual(['Staf Desa']);
    expect(kades.children[0].people.map((p) => p.id)).toEqual(['c', 'd']);
  });

  it('akar setingkat dengan akar utama tetap terpisah', () => {
    const data = [
      pegawai('a', 'kepala_desa', 'Kepala Desa', 1, null),
      pegawai('b', 'bpd', 'Ketua BPD', 1, null),
    ];
    expect(titles(buildOrgTree(data, []))).toEqual(['Kepala Desa', 'Ketua BPD']);
  });

  it('data kosong → tanpa akar', () => {
    expect(buildOrgTree([], POSISI)).toEqual([]);
  });
});

describe('buildOrgTree — jabatan dengan parentId & urutan (Perangkat Desa)', () => {
  // test-only: mengikuti seed bagan resmi — perbekel → sekdes → kaur; kasi & sekdes selevel di bawah perbekel.
  const pd = (id: string, nama: string, hierarki: number, parentId: string | null, urutan: number): PosisiItem => ({
    id, nama, hierarki, parentId, urutan,
  });
  const JABATAN: PosisiItem[] = [
    pd('pd-perbekel', 'Perbekel', 1, null, 1),
    pd('pd-sekretaris-desa', 'Sekretaris Desa', 2, 'pd-perbekel', 1),
    pd('pd-kasi-pemerintahan', 'Kasi Pemerintahan', 2, 'pd-perbekel', 2),
    pd('pd-kasi-kesejahteraan', 'Kasi Kesejahteraan', 2, 'pd-perbekel', 3),
    pd('pd-kasi-pelayanan', 'Kasi Pelayanan', 2, 'pd-perbekel', 4),
    pd('pd-kaur-tata-usaha-umum', 'Kaur Tata Usaha & Umum', 3, 'pd-sekretaris-desa', 5),
    pd('pd-kaur-keuangan', 'Kaur Keuangan', 3, 'pd-sekretaris-desa', 6),
  ];
  const at = (id: string, posisiId: string, extra: Partial<PegawaiItem['posisi']> = {}): PegawaiItem => {
    const pos = JABATAN.find((j) => j.id === posisiId)!;
    return pegawai(id, posisiId, pos.nama, pos.hierarki, pos.parentId ?? null, { posisi: { ...pos, ...extra } });
  };

  it('jabatan kosong ditempel ke induk sebenarnya dari posisiList, bukan ke akar', () => {
    // Kaur TU kosong; bawahannya (Staf TU) berpegawai. Tanpa parentId Kaur TU akan menempel ke Perbekel.
    const staf: PosisiItem = pd('pd-staf-tu', 'Staf Tata Usaha', 4, 'pd-kaur-tata-usaha-umum', 1);
    const data = [at('a', 'pd-perbekel'), at('b', 'pd-sekretaris-desa'), pegawai('c', staf.id, staf.nama, 4, staf.parentId!)];
    const [perbekel, ...rest] = buildOrgTree(data, [...JABATAN, staf]);
    expect(rest).toEqual([]);
    expect(titles(perbekel.children)).toEqual(['Sekretaris Desa']);
    const [kaurTu] = perbekel.children[0].children;
    expect(kaurTu.title).toBe('Kaur Tata Usaha & Umum');
    expect(kaurTu.people).toEqual([]);
    expect(titles(kaurTu.children)).toEqual(['Staf Tata Usaha']);
  });

  it('rantai leluhur kosong ikut digambar sampai akar (Perbekel & Sekdes belum ditugaskan)', () => {
    const [perbekel] = buildOrgTree([at('k', 'pd-kaur-keuangan')], JABATAN);
    expect(perbekel.title).toBe('Perbekel');
    expect(perbekel.people).toEqual([]);
    expect(titles(perbekel.children)).toEqual(['Sekretaris Desa']);
    expect(titles(perbekel.children[0].children)).toEqual(['Kaur Keuangan']);
  });

  it('urutan dihormati untuk jabatan selevel (bukan abjad)', () => {
    const data = ['pd-kasi-pelayanan', 'pd-kasi-kesejahteraan', 'pd-sekretaris-desa', 'pd-kasi-pemerintahan', 'pd-perbekel'].map(
      (posisiId, i) => at(`p${i}`, posisiId),
    );
    const [perbekel] = buildOrgTree(data, JABATAN);
    expect(titles(perbekel.children)).toEqual(['Sekretaris Desa', 'Kasi Pemerintahan', 'Kasi Kesejahteraan', 'Kasi Pelayanan']);
  });

  it('urutan dari posisi pegawai dipakai walau posisiList kosong; tanpa urutan di belakang lalu abjad', () => {
    const data = [
      at('a', 'pd-perbekel'),
      at('b', 'pd-kasi-pelayanan', { urutan: 1 }),
      at('c', 'pd-kasi-kesejahteraan', { urutan: null }),
      at('d', 'pd-kasi-pemerintahan', { urutan: 2 }),
      at('e', 'pd-sekretaris-desa', { urutan: null }),
    ];
    const [perbekel] = buildOrgTree(data, []);
    expect(titles(perbekel.children)).toEqual(['Kasi Pelayanan', 'Kasi Pemerintahan', 'Kasi Kesejahteraan', 'Sekretaris Desa']);
  });

  it('parentId bersiklus: siklus diputus, semua jabatan tetap tergambar', () => {
    const siklus = [pd('x', 'X', 2, 'y', 1), pd('y', 'Y', 2, 'x', 2)];
    const [root, ...rest] = buildOrgTree([pegawai('a', 'x', 'X', 2, 'y')], siklus);
    expect(rest).toEqual([]);
    expect([root.title, ...titles(root.children)].sort()).toEqual(['X', 'Y']);
  });
});

describe('filterOrgTree', () => {
  const tree = buildOrgTree(STG, POSISI);

  it('mempertahankan leluhur dari kotak yang cocok (nama jabatan, tanpa beda huruf besar/kecil)', () => {
    const [kades] = filterOrgTree(tree, '  KEUANGAN ');
    expect(titles(kades.children)).toEqual(['Kaur Umum & TU']);
    expect(titles(kades.children[0].children)).toEqual(['Kaur Keuangan']);
  });

  it('mencocokkan nama pegawai', () => {
    const [kades] = filterOrgTree(tree, 'pegawai p4');
    expect(titles(kades.children)).toEqual(['Sekretaris Desa']);
    expect(titles(kades.children[0].children)).toEqual(['Kepala Dusun Banjar Dinas Taman']);
  });

  it('jabatan berisi beberapa pegawai: cocok nama → hanya pegawai itu; cocok jabatan → semua pegawai', () => {
    const shared = buildOrgTree(
      [
        pegawai('a', 'kepala_desa', 'Kepala Desa', 1, null),
        pegawai('c', 'staf_desa', 'Staf Desa', 2, 'kepala_desa'),
        pegawai('d', 'staf_desa', 'Staf Desa', 2, 'kepala_desa'),
      ],
      [],
    );
    const ids = (q: string) => filterOrgTree(shared, q)[0].children[0].people.map((p) => p.id);
    expect(ids('pegawai d')).toEqual(['d']);
    expect(ids('staf')).toEqual(['c', 'd']);
    // Leluhur yang tampil karena keturunannya cocok tetap membawa semua pegawainya.
    expect(filterOrgTree(shared, 'pegawai d')[0].people.map((p) => p.id)).toEqual(['a']);
  });

  it('kueri kosong → pohon utuh; tak ada yang cocok → kosong', () => {
    expect(filterOrgTree(tree, ' ')).toEqual(tree);
    expect(filterOrgTree(tree, 'zzz')).toEqual([]);
  });
});

describe('cardsOf', () => {
  const base = { posisiId: 'staf', title: 'Staf Desa', hierarki: 3, children: [] };

  it('satu kartu per pegawai dengan kunci unik jabatan:pegawai', () => {
    const people = [
      { id: 'c', name: 'C', image: null },
      { id: 'd', name: 'D', image: '/api/img/d.webp' },
    ];
    expect(cardsOf({ ...base, people })).toEqual([
      { key: 'staf:c', title: 'Staf Desa', person: people[0] },
      { key: 'staf:d', title: 'Staf Desa', person: people[1] },
    ]);
  });

  it('jabatan tanpa pegawai → satu kartu kosong', () => {
    expect(cardsOf({ ...base, people: [] })).toEqual([{ key: 'staf', title: 'Staf Desa', person: null }]);
  });
});

describe('toneForDepth', () => {
  it('akar 0, bawahan langsung 1, selebihnya 2', () => {
    expect([0, 1, 2, 5].map(toneForDepth)).toEqual([0, 1, 2, 2]);
  });
});

describe('leafSlot', () => {
  it('satu baris (jumlah ≤ kolom maksimal): palang tiap kotak ke tengah, kotak tengah tepat di bawah induk', () => {
    expect([0, 1, 2].map((i) => leafSlot(i, 3, 4))).toEqual([
      { cols: 3, offset: 1, shift: 0 },
      { cols: 3, offset: 0, shift: 0 },
      { cols: 3, offset: -1, shift: 0 },
    ]);
    expect(leafSlot(0, 1, 2)).toEqual({ cols: 1, offset: 0, shift: 0 });
  });

  it('5 Kadus di 2 kolom: 2 + 2 + 1, kotak terakhir digeser ke tengah tepat di bawah garis induk', () => {
    const slots = [0, 1, 2, 3, 4].map((i) => leafSlot(i, 5, 2));
    expect(slots.map((x) => x.offset)).toEqual([0.5, -0.5, 0.5, -0.5, 0]);
    expect(slots.map((x) => x.shift)).toEqual([0, 0, 0, 0, 0.5]);
  });

  it('5 Kadus di 4 kolom: 4 + 1, kotak kelima digeser 1,5 kolom ke tengah', () => {
    const slots = [0, 1, 2, 3, 4].map((i) => leafSlot(i, 5, 4));
    expect(slots.map((x) => x.offset)).toEqual([1.5, 0.5, -0.5, -1.5, 0]);
    expect(slots[4]).toEqual({ cols: 4, offset: 0, shift: 1.5 });
  });

  it('baris terakhir berisi 2 dari 4 kolom digeser 1 kolom', () => {
    const slots = [4, 5].map((i) => leafSlot(i, 6, 4));
    expect(slots).toEqual([
      { cols: 4, offset: 0.5, shift: 1 },
      { cols: 4, offset: -0.5, shift: 1 },
    ]);
  });
});
