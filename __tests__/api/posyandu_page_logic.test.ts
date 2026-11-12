// @vitest-environment node
// Halaman publik Posyandu: ambang privasi "< 3", persentase yang disembunyikan, label banjar, tautan tel:,
// batas paralel permintaan per banjar, dan sumber data (hanya endpoint agregat, bukan balita/ibuhamil find-many).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  banjarLabel, formatHitungan, hasUnassigned, mapWithLimit, parseTab, persenTampil,
  posyanduDetailHref, posyanduTabHref, targetStuntingTampil, telHref, type BanjarStatsRow, type PosyanduStats,
} from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.logic';
import { BANJAR_STATS_CONCURRENCY, PRIVASI_AMBANG } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.meta';
import { loadPosyandu, loadPosyanduList, loadStats } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.source';
import { loadBanjarStats } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/use-posyandu-data';

// test-only: bentuk respons GET /ringkasankesehatan/stats.
const stats = (extra: Partial<PosyanduStats> = {}): PosyanduStats => ({
  ibuHamilAktif: 11,
  balitaTerdaftar: 26,
  alertStunting: 17,
  imunisasiLengkapPct: 73,
  pemeriksaanRutinPct: 88,
  giziBaikPct: 58,
  targetStuntingPct: 10,
  ...extra,
});
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('formatHitungan (ambang privasi)', () => {
  it('ambang yang disepakati adalah 3', () => {
    expect(PRIVASI_AMBANG).toBe(3);
  });
  it('0 tetap 0, 1 dan 2 menjadi "< 3"', () => {
    expect(formatHitungan(0)).toBe('0');
    expect(formatHitungan(1)).toBe('< 3');
    expect(formatHitungan(2)).toBe('< 3');
  });
  it('3 ke atas tampil apa adanya (pemisah ribuan Indonesia)', () => {
    expect(formatHitungan(3)).toBe('3');
    expect(formatHitungan(26)).toBe('26');
    expect(formatHitungan(1234)).toBe('1.234');
  });
});

describe('persenTampil', () => {
  it('tanpa balita → kosong (API membalas 0%, bukan 0% sungguhan)', () => {
    expect(persenTampil(0, 0)).toEqual({ kind: 'kosong' });
  });
  it('balita 1-2 → persen disembunyikan', () => {
    expect(persenTampil(50, 2)).toEqual({ kind: 'sedikit' });
    expect(persenTampil(100, 1)).toEqual({ kind: 'sedikit' });
  });
  it('balita ≥ 3 → persen tampil, dijepit 0-100', () => {
    expect(persenTampil(33, 3)).toEqual({ kind: 'pct', value: 33 });
    expect(persenTampil(140, 10)).toEqual({ kind: 'pct', value: 100 });
  });
});

describe('banjarLabel', () => {
  it('tidak menggandakan awalan "Banjar"', () => {
    expect(banjarLabel('Banjar Anggrek')).toBe('Banjar Anggrek');
    expect(banjarLabel('banjar tengah')).toBe('banjar tengah');
  });
  it('menambah "Banjar" bila belum ada', () => {
    expect(banjarLabel(' Anggrek ')).toBe('Banjar Anggrek');
    expect(banjarLabel('Banjarsari')).toBe('Banjar Banjarsari');
  });
});

describe('telHref', () => {
  it('membuang spasi & tanda hubung, mempertahankan +', () => {
    expect(telHref('0812-3456 789')).toBe('tel:08123456789');
    expect(telHref('+62 812 3456')).toBe('tel:+628123456');
  });
  it('null bila tak ada digit', () => {
    expect(telHref('')).toBeNull();
    expect(telHref(null)).toBeNull();
    expect(telHref(' - ')).toBeNull();
  });
});

describe('mapWithLimit', () => {
  it('urutan hasil = urutan masukan dan tak pernah melebihi batas paralel', async () => {
    let running = 0;
    let peak = 0;
    const result = await mapWithLimit([5, 1, 4, 2, 3, 0], 2, async (ms) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, ms));
      running -= 1;
      return ms * 10;
    });
    expect(result).toEqual([50, 10, 40, 20, 30, 0]);
    expect(peak).toBe(2);
  });
  it('daftar kosong → []', async () => {
    expect(await mapWithLimit([], 4, async (x) => x)).toEqual([]);
  });
});

describe('hasUnassigned', () => {
  const rows = (...values: (number | null)[]): BanjarStatsRow[] =>
    values.map((v, i) => ({ id: `b${i}`, name: `Banjar ${i}`, stats: v === null ? null : stats({ balitaTerdaftar: v }) }));
  it('true bila angka desa lebih besar dari jumlah banjar', () => {
    expect(hasUnassigned(stats({ balitaTerdaftar: 26 }), rows(3, 4, 18), 'balitaTerdaftar')).toBe(true);
  });
  it('false bila sama, atau ada banjar yang gagal dimuat', () => {
    expect(hasUnassigned(stats({ balitaTerdaftar: 25 }), rows(3, 4, 18), 'balitaTerdaftar')).toBe(false);
    expect(hasUnassigned(stats({ balitaTerdaftar: 26 }), rows(3, null), 'balitaTerdaftar')).toBe(false);
  });
});

describe('targetStuntingTampil', () => {
  it('hanya tampil bila diatur (> 0); 0/null/undefined → null; dibatasi 100', () => {
    expect(targetStuntingTampil(10)).toBe(10);
    expect(targetStuntingTampil(0)).toBeNull();
    expect(targetStuntingTampil(null)).toBeNull();
    expect(targetStuntingTampil(undefined)).toBeNull();
    expect(targetStuntingTampil(-5)).toBeNull();
    expect(targetStuntingTampil(140)).toBe(100);
  });
});

describe('tab & tautan', () => {
  it('parseTab menerima 4 tab, nilai lain → ringkasan', () => {
    expect(parseTab('balita')).toBe('balita');
    expect(parseTab('ibu-hamil')).toBe('ibu-hamil');
    expect(parseTab('posyandu')).toBe('posyandu');
    expect(parseTab('xyz')).toBe('ringkasan');
    expect(parseTab(null)).toBe('ringkasan');
  });
  it('href tab & detail', () => {
    expect(posyanduTabHref('ringkasan')).toBe('/kesehatan/posyandu');
    expect(posyanduTabHref('posyandu')).toBe('/kesehatan/posyandu?tab=posyandu');
    expect(posyanduDetailHref('a b')).toBe('/kesehatan/posyandu/a%20b');
  });
});

describe('sumber data', () => {
  it('statistik desa & banjar memakai endpoint agregat', async () => {
    const fetchMock = vi.fn(async () => json({ success: true, data: stats() }));
    vi.stubGlobal('fetch', fetchMock);
    await loadStats();
    await loadStats('id 1');
    expect(fetchMock.mock.calls.map((c) => String((c as unknown[])[0]))).toEqual([
      '/api/kesehatan/ringkasankesehatan/stats',
      '/api/kesehatan/ringkasankesehatan/stats?banjarId=id%201',
    ]);
  });

  it('loadBanjarStats: banjar yang gagal → stats null, sisanya terisi, paralel dibatasi, tanpa endpoint data pribadi', async () => {
    const banjar = Array.from({ length: 9 }, (_, i) => ({ id: `b${i}`, name: `Banjar ${i}` }));
    let running = 0;
    let peak = 0;
    const urls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      urls.push(input);
      if (input.endsWith('/banjar/find-many')) return json({ success: true, data: banjar });
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      running -= 1;
      if (input.endsWith('banjarId=b3')) return json({ success: false, message: 'Gagal menghitung' });
      return json({ success: true, data: stats({ balitaTerdaftar: 2 }) });
    }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const rows = await loadBanjarStats();
    expect(rows).toHaveLength(9);
    expect(rows[3]).toEqual({ id: 'b3', name: 'Banjar 3', stats: null });
    expect(rows[0].stats?.balitaTerdaftar).toBe(2);
    expect(peak).toBeLessThanOrEqual(BANJAR_STATS_CONCURRENCY);
    expect(urls.some((u) => /\/balita|\/ibuhamil/i.test(u))).toBe(false);
  });

  it('loadBanjarStats gagal total bila daftar banjar gagal', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ success: false, message: 'Gagal mengambil data banjar' }, 500)));
    await expect(loadBanjarStats()).rejects.toThrow(/daftar banjar gagal \(HTTP 500\)/);
  });

  it('loadPosyandu: 404 → null, 500 → Error berkonteks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ success: false, message: 'Data tidak ditemukan' }, 404)));
    expect(await loadPosyandu('x')).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => json({ success: false, message: 'Gagal' }, 500)));
    await expect(loadPosyandu('x')).rejects.toThrow('detail posyandu x gagal (HTTP 500): Gagal');
  });

  it('loadPosyanduList memuat semua posyandu sekaligus', async () => {
    const fetchMock = vi.fn(async () => json({ success: true, data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await loadPosyanduList()).toEqual([]);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe('/api/kesehatan/posyandu/find-many?page=1&limit=100');
  });
});
