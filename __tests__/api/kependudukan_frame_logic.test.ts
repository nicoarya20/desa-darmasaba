// @vitest-environment node
// Kerangka Dashboard Kependudukan: pilih tahun terbaru per dataset, rel pil + scroll-spy, kartu hero, redirect 4 rute lama.
import { describe, expect, it, vi } from 'vitest';
import { isKnownMenuKey } from '@/app/(public)/_com/menu-visibility.logic';
import navbarListMenu from '@/con/navbar-list-menu';
import { AGAMA_ANCHOR } from '@/app/(public)/(pages)/kependudukan/_com/agama/AgamaSection';
import { BANJAR_TEXT } from '@/app/(public)/(pages)/kependudukan/_com/banjar/banjar.text';
import {
  KEPENDUDUKAN_FETCH_LIMIT,
  pilihTahunTerbaru,
  readTahun,
  toDatasetSlice,
} from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.logic';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';
import { DINAMIKA_TEXT } from '@/app/(public)/(pages)/kependudukan/_com/dinamika/dinamika.text';
import { heroCards } from '@/app/(public)/(pages)/kependudukan/_com/frame/kependudukan-hero.logic';
import { kependudukanSectionHref, SECTION_ANCHOR } from '@/app/(public)/(pages)/kependudukan/_com/frame/kependudukan.meta';
import { hashAnchor, NAV_SECTIONS, pickActiveAnchor } from '@/app/(public)/(pages)/kependudukan/_com/frame/section-nav.logic';
import { UMUR_ANCHOR } from '@/app/(public)/(pages)/kependudukan/_com/umur/UmurSection';
import BanjarRedirect from '@/app/(public)/(pages)/kependudukan/data-per-banjar/page';
import DinamikaRedirect from '@/app/(public)/(pages)/kependudukan/dinamika-penduduk/page';
import AgamaRedirect from '@/app/(public)/(pages)/kependudukan/distribusi-agama/page';
import UmurRedirect from '@/app/(public)/(pages)/kependudukan/distribusi-umur/page';

const redirectTo = vi.hoisted(() => vi.fn((url: string): never => {
  throw new Error(`REDIRECT:${url}`);
}));
vi.mock('next/navigation', () => ({ permanentRedirect: redirectTo }));

const noop = () => {};
// test-only: baris distribusi umur stg 2026-11-17 (tahun campur 2026/2025/2021, urut createdAt menurun).
const UMUR_STG = [
  { id: 'u1', rentangUmur: '6-12', jumlah: 90, tahun: 2026 },
  { id: 'u2', rentangUmur: '0-5', jumlah: 25, tahun: 2025 },
  { id: 'u3', rentangUmur: '65+', jumlah: 230, tahun: 2021 },
  { id: 'u4', rentangUmur: '65+', jumlah: 545, tahun: 2026 },
  { id: 'u5', rentangUmur: '0-14', jumlah: 820, tahun: 2026 },
];
// test-only: 12 banjar stg 2026 (miskin semua 0) + dinamika 2024–2026.
const BANJAR_JIWA = [1106, 1077, 540, 947, 542, 972, 403, 862, 1082, 878, 844, 1001];
const BANJAR_KK = [230, 237, 105, 223, 130, 205, 103, 231, 225, 195, 188, 250];
const BANJAR_STG = BANJAR_JIWA.map((penduduk, i) => ({ id: `b${i}`, nama: `Banjar ${i}`, penduduk, kk: BANJAR_KK[i], miskin: 0, tahun: 2026 }));
const DINAMIKA_STG = [
  { id: 'd1', tahun: 2026, kelahiran: 45, kematian: 18, masuk: 22, keluar: 15 },
  { id: 'd2', tahun: 2025, kelahiran: 52, kematian: 21, masuk: 18, keluar: 12 },
  { id: 'd3', tahun: 2024, kelahiran: 48, kematian: 19, masuk: 25, keluar: 20 },
];
const ready = (rows: unknown[]): DatasetSlice => toDatasetSlice({ status: 'ready', rows }, noop);
const NOV_2026 = new Date('2026-11-17T03:00:00Z');
const JAN_2027 = new Date('2027-01-05T03:00:00Z');

describe('pilih tahun terbaru per dataset', () => {
  it('limit muat eksplisit 100 (bukan bawaan API 10)', () => {
    expect(KEPENDUDUKAN_FETCH_LIMIT).toBe(100);
  });

  it('readTahun menerima bulat 1900–2999 (angka/teks), selain itu null', () => {
    expect(readTahun({ tahun: 2026 })).toBe(2026);
    expect(readTahun({ tahun: '2025' })).toBe(2025);
    expect(readTahun({ tahun: 2025.5 })).toBeNull();
    expect(readTahun({ tahun: 1800 })).toBeNull();
    expect(readTahun({ tahun: '' })).toBeNull();
    expect(readTahun({})).toBeNull();
    expect(readTahun(null)).toBeNull();
  });

  it('umur stg: tahun 2026 saja di rows, tahunTersedia menurun, allRows utuh', () => {
    const slice = ready(UMUR_STG);
    expect(slice.status).toBe('ready');
    expect(slice.tahun).toBe(2026);
    expect(slice.tahunTersedia).toEqual([2026, 2025, 2021]);
    expect(slice.rows.map((r) => (r as { id: string }).id)).toEqual(['u1', 'u4', 'u5']);
    expect(slice.allRows).toHaveLength(5);
  });

  it('tanpa baris bertahun sah → tahun null, rows kosong (section menampilkan "belum diisi")', () => {
    expect(pilihTahunTerbaru([])).toEqual({ tahun: null, tahunTersedia: [], rows: [] });
    expect(pilihTahunTerbaru([{ tahun: 'x' }]).tahun).toBeNull();
  });

  it('memuat/galat → tanpa baris, retry diteruskan', () => {
    const retry = vi.fn();
    const err = toDatasetSlice({ status: 'error' }, retry);
    expect(err).toMatchObject({ status: 'error', tahun: null, rows: [], allRows: [], tahunTersedia: [] });
    err.retry();
    expect(retry).toHaveBeenCalledTimes(1);
    expect(toDatasetSlice({ status: 'loading' }, noop).status).toBe('loading');
  });
});

describe('rel pil + scroll-spy', () => {
  it('anchor kerangka sama dengan id section milik sesi lain', () => {
    expect(SECTION_ANCHOR.banjar).toBe(BANJAR_TEXT.anchor);
    expect(SECTION_ANCHOR.umur).toBe(UMUR_ANCHOR);
    expect(SECTION_ANCHOR.agama).toBe(AGAMA_ANCHOR);
    expect(SECTION_ANCHOR.dinamika).toBe(DINAMIKA_TEXT.anchor);
  });

  it('urutan pil = urutan halaman, Agama selalu ada', () => {
    expect(NAV_SECTIONS.map((s) => s.anchor)).toEqual(['ringkasan', 'banjar', 'umur', 'agama', 'dinamika']);
    expect(NAV_SECTIONS.map((s) => s.label)).toEqual(['Ringkasan', 'Per Banjar', 'Umur', 'Agama', 'Dinamika']);
  });

  const tops = [
    { anchor: 'ringkasan', top: 300 },
    { anchor: 'banjar', top: 700 },
    { anchor: 'umur', top: 1500 },
  ];

  it('aktif = section terakhir yang puncaknya melewati garis rel', () => {
    expect(pickActiveAnchor(tops, 120, false)).toBe('ringkasan');
    expect(pickActiveAnchor(tops.map((t) => ({ ...t, top: t.top - 650 })), 120, false)).toBe('banjar');
    expect(pickActiveAnchor(tops.map((t) => ({ ...t, top: t.top - 1400 })), 120, false)).toBe('umur');
  });

  it('dasar halaman → section terakhir; tanpa section → null', () => {
    expect(pickActiveAnchor(tops, 120, true)).toBe('umur');
    expect(pickActiveAnchor([], 120, false)).toBeNull();
  });

  it('hash dikenali hanya bila section-nya tampil', () => {
    expect(hashAnchor('#umur', NAV_SECTIONS)).toBe('umur');
    expect(hashAnchor('#agama', NAV_SECTIONS)).toBe('agama');
    expect(hashAnchor('#agama', NAV_SECTIONS.filter((s) => s.anchor !== 'agama'))).toBeNull();
    expect(hashAnchor('', NAV_SECTIONS)).toBeNull();
    expect(hashAnchor('#lain', NAV_SECTIONS)).toBeNull();
  });
});

describe('kartu hero', () => {
  it('stg: 10.254 jiwa · 2.322 KK · 4,4 jiwa/KK (2026) · pertumbuhan +34 (2026, tahun berjalan)', () => {
    const cards = heroCards(ready(BANJAR_STG), ready(DINAMIKA_STG), NOV_2026);
    expect(cards.map((c) => c.key)).toEqual(['penduduk', 'kk', 'jiwaPerKk', 'pertumbuhan']);
    expect(cards[0]).toMatchObject({ status: 'ready', value: '10.254', unit: 'jiwa', note: '12 banjar · Data 2026' });
    expect(cards[1]).toMatchObject({ status: 'ready', value: '2.322', unit: 'KK', note: 'Data 2026' });
    expect(cards[2]).toMatchObject({ status: 'ready', value: '4,4', unit: 'jiwa' });
    expect(cards[3]).toMatchObject({ status: 'ready', value: '+34', unit: 'jiwa' });
    expect(cards[3].note).toContain('2026 (tahun berjalan)');
  });

  it('Januari tahun baru: tetap memakai tahun terbaru yang ada, bukan 0', () => {
    const cards = heroCards(ready(BANJAR_STG), ready(DINAMIKA_STG), JAN_2027);
    expect(cards[0].value).toBe('10.254');
    expect(cards[3].note).toContain('· 2026');
    expect(cards[3].note).not.toContain('tahun berjalan');
  });

  it('pertumbuhan negatif ditulis bertanda minus', () => {
    const turun = [{ id: 'd', tahun: 2025, kelahiran: 10, kematian: 30, masuk: 5, keluar: 10 }];
    expect(heroCards(ready(BANJAR_STG), ready(turun), NOV_2026)[3].value).toBe('-25');
  });

  it('dataset kosong → "empty" tanpa nilai; galat/memuat diteruskan per dataset', () => {
    const empty = heroCards(ready([]), ready([]), NOV_2026);
    expect(empty.every((c) => c.status === 'empty' && c.value === undefined)).toBe(true);
    const mixed = heroCards(toDatasetSlice({ status: 'error' }, noop), toDatasetSlice({ status: 'loading' }, noop), NOV_2026);
    expect(mixed.map((c) => c.status)).toEqual(['error', 'error', 'error', 'loading']);
  });

  it('KK nol di semua banjar → jiwa/KK "empty" (tidak membagi nol)', () => {
    const tanpaKk = BANJAR_STG.map((b) => ({ ...b, kk: 0 }));
    const cards = heroCards(ready(tanpaKk), ready(DINAMIKA_STG), NOV_2026);
    expect(cards[1]).toMatchObject({ status: 'ready', value: '0' });
    expect(cards[2].status).toBe('empty');
  });
});

describe('redirect rute lama → anchor dashboard', () => {
  it.each([
    [BanjarRedirect, '/kependudukan/dashboard#banjar'],
    [DinamikaRedirect, '/kependudukan/dashboard#dinamika'],
    [AgamaRedirect, '/kependudukan/dashboard#agama'],
    [UmurRedirect, '/kependudukan/dashboard#umur'],
  ])('%#: permanen ke %s', (Page, to) => {
    expect(() => Page()).toThrow(`REDIRECT:${to}`);
    expect(redirectTo).toHaveBeenLastCalledWith(to);
  });

  it('kependudukanSectionHref selalu di bawah /kependudukan/dashboard', () => {
    expect(kependudukanSectionHref('umur')).toBe('/kependudukan/dashboard#umur');
  });
});

describe('navbar Kependudukan satu butir', () => {
  const OLD = ['/kependudukan/data-per-banjar', '/kependudukan/dinamika-penduduk', '/kependudukan/distribusi-agama', '/kependudukan/distribusi-umur'];

  it('hanya "Dashboard Kependudukan" → /kependudukan/dashboard', () => {
    const menu = navbarListMenu.find((m) => m.name === 'Kependudukan');
    expect(menu?.children?.map((c) => [c.name, c.href])).toEqual([['Dashboard Kependudukan', '/kependudukan/dashboard']]);
  });

  it('URL lama bukan lagi kunci visibilitas (override DB lama diabaikan)', () => {
    expect(isKnownMenuKey('/kependudukan/dashboard')).toBe(true);
    for (const href of OLD) expect(isKnownMenuKey(href), href).toBe(false);
  });
});
