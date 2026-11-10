// @vitest-environment node
// Bagan Struktur PPID: susunan pohon dari pegawai aktif + jabatan induk yang belum ditugaskan.
import { describe, expect, it } from 'vitest';
import {
  buildOrgTree,
  filterOrgTree,
  toneForDepth,
  type OrgNode,
  type PegawaiItem,
  type PosisiItem,
} from '@/app/darmasaba/(pages)/ppid/struktur-ppid/_com/struktur.logic';

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
    expect(kaurUmum.person).toBeNull();
    expect(titles(kaurUmum.children)).toEqual(['Kaur Keuangan']);
    expect(kaurUmum.children[0].person?.name).toBe('Pegawai p3');

    // Pegawai nonaktif (Staf Desa) tidak tampil; anak diurut tingkat lalu nama jabatan.
    expect(titles(sekdes.children)).toEqual([
      'Kepala Dusun Banjar Dinas Bucu',
      'Kepala Dusun Banjar Dinas Taman',
    ]);
  });

  it('membawa id pegawai dan link foto (kosong → null)', () => {
    const [kades] = buildOrgTree(STG, POSISI);
    const bucu = kades.children[1].children[0];
    expect(bucu.person).toEqual({ id: 'p5', name: 'Pegawai p5', image: '/api/img/foto.webp' });
    expect(kades.person?.image).toBeNull();
  });

  it('tanpa daftar jabatan, bawahan yang induknya tak berpegawai ditempel ke akar utama (tetap tampil)', () => {
    const [kades, ...rest] = buildOrgTree(STG, []);
    expect(rest).toEqual([]);
    expect(titles(kades.children)).toEqual(['Sekretaris Desa', 'Kaur Keuangan']);
  });

  it('satu kotak per jabatan — pegawai pertama yang aktif', () => {
    const data = [
      pegawai('a', 'kepala_desa', 'Kepala Desa', 1, null, { isActive: false }),
      pegawai('b', 'kepala_desa', 'Kepala Desa', 1, null),
      pegawai('c', 'kepala_desa', 'Kepala Desa', 1, null),
    ];
    const roots = buildOrgTree(data, []);
    expect(roots).toHaveLength(1);
    expect(roots[0].person?.id).toBe('b');
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

  it('kueri kosong → pohon utuh; tak ada yang cocok → kosong', () => {
    expect(filterOrgTree(tree, ' ')).toEqual(tree);
    expect(filterOrgTree(tree, 'zzz')).toEqual([]);
  });
});

describe('toneForDepth', () => {
  it('akar 0, bawahan langsung 1, selebihnya 2', () => {
    expect([0, 1, 2, 5].map(toneForDepth)).toEqual([0, 1, 2, 2]);
  });
});
