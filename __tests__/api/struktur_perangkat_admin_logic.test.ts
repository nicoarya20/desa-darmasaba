// @vitest-environment node
// Admin Struktur Perangkat Desa: menu, validasi form pegawai, opsi atasan jabatan, tampilan nilai kosong, pohon bagan.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import {
  alasanTolakHapus,
  atasanNama,
  isActiveDari,
  isPegawaiFormValid,
  isPosisiFormValid,
  parentOptions,
  pegawaiFormErrors,
  tampil,
  type PegawaiFormValues,
  type PosisiRow,
} from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { buildAdminOrgTree } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.bagan';
import type { OrgNode } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';

const ROOT = path.resolve(__dirname, '../..');
const PATH = '/admin/pemerintahan/struktur-perangkat-desa/pegawai';

// test-only: form kosong + jabatan seed (perbekel → sekdes → kaur, perbekel → kasi)
const form = (over: Partial<PegawaiFormValues> = {}): PegawaiFormValues => ({
  namaLengkap: '',
  imageId: '',
  email: '',
  telepon: '',
  posisiId: '',
  isActive: true,
  ...over,
});
const pos = (id: string, parentId: string | null, hierarki = 1, pegawai = 0): PosisiRow => ({
  id,
  nama: `Jabatan ${id}`,
  hierarki,
  urutan: null,
  parentId,
  isActive: true,
  _count: { pegawai },
});
const LIST = [
  pos('pd-perbekel', null, 1, 1),
  pos('pd-sekretaris-desa', 'pd-perbekel', 2),
  pos('pd-kasi-pemerintahan', 'pd-perbekel', 2, 2),
  pos('pd-kaur-keuangan', 'pd-sekretaris-desa', 3),
];

describe('menu admin Pemerintahan → Struktur Perangkat Desa', () => {
  it('desaMenu punya entri desa.struktur-perangkat-desa dengan path tab Pegawai', () => {
    expect(desaMenu.children).toContainEqual({
      id: 'desa.struktur-perangkat-desa',
      name: 'Struktur Perangkat Desa',
      path: PATH,
      basePath: '/admin/pemerintahan/struktur-perangkat-desa',
    });
  });

  it('halaman tab Pegawai, Jabatan, dan Bagan ada', () => {
    const dir = path.join(ROOT, 'src/app/admin/(dashboard)/pemerintahan/struktur-perangkat-desa');
    for (const tab of ['pegawai', 'jabatan', 'bagan']) expect(existsSync(path.join(dir, tab, 'page.tsx')), tab).toBe(true);
  });
});

describe('validasi form pegawai', () => {
  it('hanya nama lengkap + jabatan wajib', () => {
    expect(Object.keys(pegawaiFormErrors(form())).sort()).toEqual(['namaLengkap', 'posisiId']);
    expect(isPegawaiFormValid(form({ namaLengkap: 'I Made Ari', posisiId: 'pd-perbekel' }))).toBe(true);
  });

  it('nama berisi spasi saja tetap dianggap kosong', () => {
    expect(pegawaiFormErrors(form({ namaLengkap: '   ', posisiId: 'pd-perbekel' }))).toHaveProperty('namaLengkap');
  });

  it('email salah ditolak hanya bila diisi', () => {
    const base = { namaLengkap: 'I Made Ari', posisiId: 'pd-perbekel' };
    expect(pegawaiFormErrors(form({ ...base, email: 'bukan-email' }))).toHaveProperty('email');
    expect(isPegawaiFormValid(form({ ...base, email: 'bukan-email' }))).toBe(false);
    expect(isPegawaiFormValid(form({ ...base, email: 'ari@darmasaba.id' }))).toBe(true);
    expect(isPegawaiFormValid(form({ ...base, email: '' }))).toBe(true);
  });
});

describe('form jabatan', () => {
  it('opsi atasan tidak memuat jabatan itu sendiri maupun bawahannya', () => {
    const values = parentOptions(LIST, 'pd-sekretaris-desa').map((o) => o.value);
    expect(values).not.toContain('pd-sekretaris-desa');
    expect(values).not.toContain('pd-kaur-keuangan');
    expect(values).toEqual(['pd-perbekel', 'pd-kasi-pemerintahan']);
  });

  it('saat tambah semua jabatan bisa menjadi atasan', () => {
    expect(parentOptions(LIST).map((o) => o.value)).toEqual(LIST.map((p) => p.id));
  });

  it('nama + hierarki ≥ 1 wajib', () => {
    const base = { nama: 'Kasi', deskripsi: '', urutan: null, parentId: '', isActive: true };
    expect(isPosisiFormValid({ ...base, hierarki: 2 })).toBe(true);
    expect(isPosisiFormValid({ ...base, hierarki: null })).toBe(false);
    expect(isPosisiFormValid({ ...base, hierarki: 0 })).toBe(false);
    expect(isPosisiFormValid({ ...base, nama: ' ', hierarki: 1 })).toBe(false);
  });

  it('nama atasan: "Puncak" tanpa atasan, "—" bila atasan tidak ada di daftar', () => {
    expect(atasanNama(LIST[0], LIST)).toBe('Puncak');
    expect(atasanNama(LIST[3], LIST)).toBe('Jabatan pd-sekretaris-desa');
    expect(atasanNama(pos('x', 'hilang'), LIST)).toBe('—');
  });

  it('alasan hapus ditolak: pegawai dan/atau bawahan; null bila boleh dihapus', () => {
    expect(alasanTolakHapus(LIST[0], LIST)).toBe('1 pegawai dan 2 jabatan bawahan');
    expect(alasanTolakHapus(LIST[2], LIST)).toBe('2 pegawai');
    expect(alasanTolakHapus(LIST[3], LIST)).toBeNull();
  });
});

describe('tampilan nilai', () => {
  it('kosong/spasi/null → "—"', () => {
    expect(tampil(null)).toBe('—');
    expect(tampil('  ')).toBe('—');
    expect(tampil(' S.Kom ')).toBe('S.Kom');
  });

  it('filter status → parameter isActive', () => {
    expect([isActiveDari('semua'), isActiveDari('aktif'), isActiveDari('nonaktif')]).toEqual([undefined, true, false]);
  });
});

describe('pohon bagan admin', () => {
  const posisiOf = (p: PosisiRow) => ({ id: p.id, nama: p.nama, hierarki: p.hierarki, urutan: p.urutan, parentId: p.parentId });
  const pegawai = (id: string, p: PosisiRow, isActive = true) => ({ id, namaLengkap: `Nama ${id}`, isActive, image: null, posisi: posisiOf(p) });
  const flat = (nodes: readonly OrgNode[]): OrgNode[] => nodes.flatMap((n) => [n, ...flat(n.children)]);

  it('semua jabatan aktif tampil; yang kosong tanpa pegawai, semua pegawai satu jabatan tampil', () => {
    const tree = buildAdminOrgTree([pegawai('a', LIST[2]), pegawai('b', LIST[2]), pegawai('c', LIST[0])], LIST);
    expect(tree.map((n) => n.posisiId)).toEqual(['pd-perbekel']);
    const nodes = flat(tree);
    expect(nodes.map((n) => n.posisiId).sort()).toEqual(LIST.map((p) => p.id).sort());
    expect(nodes.find((n) => n.posisiId === 'pd-kasi-pemerintahan')?.people.map((p) => p.id)).toEqual(['a', 'b']);
    expect(nodes.find((n) => n.posisiId === 'pd-kaur-keuangan')?.people).toEqual([]);
    expect(nodes.find((n) => n.posisiId === 'pd-sekretaris-desa')?.children.map((n) => n.posisiId)).toEqual(['pd-kaur-keuangan']);
  });

  it('pegawai nonaktif dan jabatan nonaktif kosong tidak tampil', () => {
    const nonaktif = { ...pos('pd-lama', 'pd-perbekel', 2), isActive: false };
    const nodes = flat(buildAdminOrgTree([pegawai('z', LIST[3], false)], [...LIST, nonaktif]));
    expect(nodes.map((n) => n.posisiId)).not.toContain('pd-lama');
    expect(nodes.flatMap((n) => n.people)).toEqual([]);
  });
});
