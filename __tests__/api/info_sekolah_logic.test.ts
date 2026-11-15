// @vitest-environment node
// Helper murni Info Sekolah publik: URL daftar pengajar (?jenjang=&search=&page=), pil jenjang, pesan kosong,
// ringkasan per jenjang (ubin + direktori).
import { describe, expect, it } from 'vitest';
import {
  buildListHref,
  buildRingkasan,
  emptyMessage,
  jenjangTabs,
  PENGAJAR_PATH,
  type LembagaItem,
  type StatsPendidikan,
} from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.logic';

const PATH = PENGAJAR_PATH;

describe('buildListHref', () => {
  it('tanpa filter → path polos', () => {
    expect(buildListHref(PATH)).toBe(PATH);
    expect(buildListHref(PATH, { jenjang: '', search: '  ', page: 1 })).toBe(PATH);
  });

  it('menulis jenjang (huruf kecil), kata kunci, dan halaman > 1', () => {
    expect(buildListHref(PATH, { jenjang: 'SD' })).toBe(`${PATH}?jenjang=sd`);
    expect(buildListHref(PATH, { jenjang: 'sd', search: ' negeri 1 ', page: 3 })).toBe(`${PATH}?jenjang=sd&search=negeri+1&page=3`);
  });

  it('meng-encode kata kunci berisi karakter khusus', () => {
    expect(buildListHref(PATH, { search: 'a&b=c' })).toBe(`${PATH}?search=a%26b%3Dc`);
  });
});

describe('jenjangTabs', () => {
  const tabs = (names: string[], jenjang = '', search = '') => jenjangTabs(names, { jenjang, search }, PATH);

  it('"Semua" di depan, aktif bila tanpa jenjang; key huruf kecil = nilai URL', () => {
    expect(tabs(['SD', 'SMP'])).toEqual([
      { key: '', label: 'Semua', href: PATH, active: true },
      { key: 'sd', label: 'SD', href: `${PATH}?jenjang=sd`, active: false },
      { key: 'smp', label: 'SMP', href: `${PATH}?jenjang=smp`, active: false },
    ]);
  });

  it('diurutkan PAUD, TK, SD, SMP, SMA, SMK lalu jenjang lain A–Z, bukan urutan API', () => {
    expect(tabs(['SMA', 'Kursus', 'SD', 'Akademi', 'TK', 'PAUD']).map((t) => t.label)).toEqual([
      'Semua', 'PAUD', 'TK', 'SD', 'SMA', 'Akademi', 'Kursus',
    ]);
  });

  it('jenjang aktif ditandai; kata kunci dipertahankan di semua pil dan halaman kembali ke 1', () => {
    const list = tabs(['SD', 'SMP'], 'smp', 'wayan');
    expect(list.find((t) => t.active)?.key).toBe('smp');
    expect(list[0].href).toBe(`${PATH}?search=wayan`);
    expect(list[1].href).toBe(`${PATH}?jenjang=sd&search=wayan`);
    for (const t of list) expect(t.href).not.toContain('page=');
  });

  it('jenjang di URL yang belum/tidak ada di daftar tetap tampil sebagai pil aktif, tanpa duplikat', () => {
    expect(tabs([], 'sma').map((t) => [t.label, t.active])).toEqual([['Semua', false], ['SMA', true]]);
    expect(tabs(['SD', 'Sd ', 'sd'])).toHaveLength(2);
  });
});

describe('emptyMessage', () => {
  it.each([
    [{ jenjang: '', search: '' }, 'Belum ada data pengajar.'],
    [{ jenjang: 'sd', search: '' }, 'Belum ada data pengajar di jenjang SD.'],
    [{ jenjang: '', search: 'zzz' }, 'Tidak ada pengajar yang cocok dengan “zzz”.'],
    [{ jenjang: 'sd', search: 'zzz' }, 'Tidak ada pengajar “zzz” di jenjang SD.'],
  ])('%j → %s', (query, expected) => {
    expect(emptyMessage('pengajar', query)).toBe(expected);
  });
});

describe('buildRingkasan', () => {
  // test-only: bentuk respons stg 2026-11-15 (perJenjang tidak terurut, memuat jenjang tanpa lembaga).
  const STATS: StatsPendidikan = {
    perJenjang: [
      { nama: 'Perguruan Tinggi', jumlahSiswa: 0, jumlahPengajar: 0 },
      { nama: 'PAUD', jumlahSiswa: 0, jumlahPengajar: 0 },
      { nama: 'TK', jumlahSiswa: 49, jumlahPengajar: 49 },
      { nama: 'SD', jumlahSiswa: 70, jumlahPengajar: 70 },
      { nama: 'SMA', jumlahSiswa: 20, jumlahPengajar: 20 },
    ],
    jumlahLembaga: 5,
    jumlahPengajar: 139,
  };
  const lembaga = (id: string, nama: string, jenjang: string | null): LembagaItem => ({
    id,
    nama,
    jenjangPendidikan: jenjang === null ? null : { nama: jenjang },
  });
  const LEMBAGA = [
    lembaga('1', 'SMA Negeri 1 Abiansemal', 'SMA'),
    lembaga('2', 'SD No. 10 Darmasaba', 'SD'),
    lembaga('3', 'SD No. 2 Darmasaba', 'SD'),
    lembaga('4', 'TK Widya Sari', 'TK'),
    lembaga('5', 'Kursus Bahasa', 'Kursus'),
  ];

  it('kelompok urut jenjang baku; jenjang tanpa lembaga tidak dibuat kelompok', () => {
    const r = buildRingkasan(STATS, LEMBAGA);
    expect(r.groups.map((g) => g.nama)).toEqual(['TK', 'SD', 'SMA', 'Kursus']);
  });

  it('lembaga di dalam jenjang urut nama dengan angka alami (No. 2 sebelum No. 10)', () => {
    const sd = buildRingkasan(STATS, LEMBAGA).groups.find((g) => g.key === 'sd');
    expect(sd?.lembaga.map((l) => l.nama)).toEqual(['SD No. 2 Darmasaba', 'SD No. 10 Darmasaba']);
  });

  it('angka siswa/pengajar per jenjang dari statistik; jenjang di luar statistik → null (tidak dikarang 0)', () => {
    const groups = buildRingkasan(STATS, LEMBAGA).groups;
    expect(groups.find((g) => g.key === 'tk')).toMatchObject({ jumlahSiswa: 49, jumlahPengajar: 49 });
    expect(groups.find((g) => g.key === 'kursus')).toMatchObject({ jumlahSiswa: null, jumlahPengajar: null });
  });

  it('total siswa & pengajar = jumlah per jenjang (cocok dengan rincian); total lembaga dari API', () => {
    const r = buildRingkasan(STATS, LEMBAGA, 7);
    expect(r).toMatchObject({ totalLembaga: 7, totalSiswa: 139, totalPengajar: 139 });
  });

  it('lebar batang sebaran = porsi lembaga yang dimuat, berjumlah 100%', () => {
    const groups = buildRingkasan(STATS, LEMBAGA).groups;
    expect(groups.find((g) => g.key === 'sd')?.width).toBeCloseTo(40);
    expect(groups.reduce((acc, g) => acc + g.width, 0)).toBeCloseTo(100);
  });

  it('tanpa lembaga → tanpa kelompok, total 0 (halaman menampilkan ubin kosong)', () => {
    expect(buildRingkasan({ perJenjang: [], jumlahLembaga: 0, jumlahPengajar: 0 }, [])).toEqual({
      totalLembaga: 0,
      totalSiswa: 0,
      totalPengajar: 0,
      groups: [],
    });
  });

  it('lembaga tanpa data jenjang dikelompokkan ke "Jenjang lain"', () => {
    const r = buildRingkasan(STATS, [lembaga('9', 'Sanggar', null)]);
    expect(r.groups.map((g) => g.nama)).toEqual(['Jenjang lain']);
  });
});
