// @vitest-environment node
// Dashboard Kependudukan, section Agama: parser baris API, label enum manusiawi, urutan, persen angka asli,
// saklar visibilitas admin, dan markup tiap keadaan (jsdom rusak di repo ini → renderToStaticMarkup).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { effectiveMenuVisibility, isKnownMenuKey } from '@/app/(public)/_com/menu-visibility.logic';
import { summarizeStatBars } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';
import { AgamaSection } from '@/app/(public)/(pages)/kependudukan/_com/agama/AgamaSection';
import {
  AGAMA_MENU_KEY,
  agamaLabel,
  compareAgama,
  formatAgamaShare,
  isAgamaHidden,
  parseAgamaRows,
  toAgamaStatItems,
} from '@/app/(public)/(pages)/kependudukan/_com/agama/agama.logic';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: bentuk baris stg (seed) 2026, termasuk kolom yang tidak dipakai section.
const apiRow = (id: string, agama: string, jumlah: unknown, tahun: unknown = 2026, updatedAt = '2026-11-02T06:30:20.318Z') => ({
  id, agama, jumlah, tahun, updatedAt, createdAt: '2026-04-14T07:38:59.982Z', deletedAt: null, isActive: true,
});
const STG_2026 = [
  apiRow('a1', 'HINDU', 3850),
  apiRow('a2', 'ISLAM', 285),
  apiRow('a3', 'KRISTEN_PROTESTAN', 42),
  apiRow('a4', 'KRISTEN_KATOLIK', 28),
  apiRow('a5', 'BUDDHA', 8),
  apiRow('a6', 'KONGHUCU', 2),
];
const slice = (over: Partial<DatasetSlice> = {}): DatasetSlice => ({
  status: 'ready', tahun: 2026, tahunTersedia: [2026], rows: STG_2026, allRows: STG_2026, retry: () => {}, ...over,
});

describe('agamaLabel', () => {
  it('kode baku → label manusiawi', () => {
    expect(agamaLabel('KRISTEN_PROTESTAN')).toBe('Kristen Protestan');
    expect(agamaLabel('KRISTEN_KATOLIK')).toBe('Kristen Katolik');
    expect(agamaLabel('HINDU')).toBe('Hindu');
    expect(agamaLabel('LAINNYA')).toBe('Lainnya');
  });
  it('isian bebas dirapikan dulu; kode tak dikenal → title-case', () => {
    expect(agamaLabel(' kristen katolik ')).toBe('Kristen Katolik');
    expect(agamaLabel('SUNDA_WIWITAN')).toBe('Sunda Wiwitan');
    expect(agamaLabel('kepercayaan-lokal')).toBe('Kepercayaan Lokal');
  });
});

describe('parseAgamaRows', () => {
  it('baris valid dipertahankan dengan kode, label, jumlah, tahun, updatedAt', () => {
    const [hindu] = parseAgamaRows(STG_2026);
    expect(hindu).toEqual({ id: 'a1', kode: 'HINDU', label: 'Hindu', jumlah: 3850, tahun: 2026, updatedAt: '2026-11-02T06:30:20.318Z' });
    expect(parseAgamaRows(STG_2026)).toHaveLength(6);
  });
  it('membuang baris tak valid: bukan objek, agama kosong, jumlah negatif/pecahan/teks, tahun tak terbaca', () => {
    const rows = [null, 'x', apiRow('b1', '  ', 5), apiRow('b2', 'ISLAM', -1), apiRow('b3', 'ISLAM', 1.5),
      apiRow('b4', 'ISLAM', 'banyak'), apiRow('b5', 'ISLAM', 3, 'dua ribu'), apiRow('ok', 'ISLAM', '1.200')];
    const parsed = parseAgamaRows(rows);
    expect(parsed.map((r) => r.id)).toEqual(['ok']);
    expect(parsed[0].jumlah).toBe(1200);
  });
  it('id kosong diberi id cadangan unik; baris ganda tidak digabung', () => {
    const parsed = parseAgamaRows([apiRow('', 'HINDU', 1), apiRow('', 'HINDU', 2)]);
    expect(parsed.map((r) => r.id)).toEqual(['HINDU-2026-0', 'HINDU-2026-1']);
  });
});

describe('urutan & persen', () => {
  it('terbanyak dulu, "Lainnya" selalu terakhir walau lebih besar', () => {
    const rows = parseAgamaRows([apiRow('l', 'LAINNYA', 500), apiRow('b', 'BUDDHA', 8), apiRow('h', 'HINDU', 3850)]);
    const summary = summarizeStatBars(toAgamaStatItems(rows), { compare: compareAgama });
    expect(summary.rows.map((r) => r.label)).toEqual(['Hindu', 'Buddha', 'Lainnya']);
  });
  it('persen angka asli: porsi kecil tidak tertulis 0%', () => {
    expect(formatAgamaShare((3850 / 4215) * 100)).toBe('91,3%');
    expect(formatAgamaShare((2 / 4215) * 100)).toBe('0,05%');
    expect(formatAgamaShare(0)).toBe('0%');
    expect(formatAgamaShare(100)).toBe('100%');
  });
});

describe('isAgamaHidden', () => {
  it('menuKey = href submenu navbar yang dikenal', () => {
    expect(AGAMA_MENU_KEY).toBe('/kependudukan/distribusi-agama');
    expect(isKnownMenuKey(AGAMA_MENU_KEY)).toBe(true);
  });
  it('tersembunyi hanya bila admin mematikan submenu Distribusi Agama', () => {
    expect(isAgamaHidden(effectiveMenuVisibility({}).hiddenHrefs)).toBe(false);
    expect(isAgamaHidden(effectiveMenuVisibility({ [AGAMA_MENU_KEY]: false }).hiddenHrefs)).toBe(true);
    expect(isAgamaHidden(['/kependudukan/distribusi-umur'])).toBe(false);
  });
});

describe('AgamaSection', () => {
  it('siap: anchor #agama, judul, tahun + tanggal, total, label manusiawi, persen', () => {
    const html = render(<AgamaSection data={slice()} />);
    const out = text(html);
    expect(html).toContain('id="agama"');
    expect(html).toContain('aria-labelledby="kependudukan-agama-title"');
    expect(out).toContain('Data 2026 · Diperbarui 2 November 2026');
    expect(out).toContain('Total tercatat 4.215 jiwa');
    expect(out).toContain('Hindu 3.850 jiwa 91,3%');
    expect(out).toContain('Kristen Protestan 42 jiwa 1%');
    expect(out).toContain('Konghucu 2 jiwa 0,05%');
    expect(out).not.toContain('KRISTEN_PROTESTAN');
    expect(out).toContain('Total ini dihitung dari isian agama, sehingga bisa berbeda dengan jumlah penduduk per banjar.');
  });
  it('memuat: kerangka aria-busy, anchor + judul h2 tetap ada', () => {
    const html = render(<AgamaSection data={slice({ status: 'loading', tahun: null, rows: [] })} />);
    expect(html).toContain('id="agama"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('dihitung dari isian agama');
    expect(html).toMatch(/<h2 id="kependudukan-agama-title"[^>]*>Agama<\/h2>/);
  });
  it('galat: pesan + tombol Coba lagi, bukan "belum diisi"', () => {
    const retry = vi.fn();
    const html = render(<AgamaSection data={slice({ status: 'error', tahun: null, rows: [], retry })} />);
    const out = text(html);
    expect(out).toContain('gagal dimuat');
    expect(out).toContain('Coba lagi');
    expect(out).not.toContain('belum diisi');
    expect(html).toContain('role="alert"');
    expect(out).not.toContain('dihitung dari isian agama');
    expect(html).toContain('id="kependudukan-agama-title"');
  });
  it('kosong (tanpa tahun / semua baris tak valid): ubin "belum diisi" tanpa angka 0', () => {
    for (const data of [slice({ tahun: null, rows: [] }), slice({ rows: [apiRow('x', '', 3)] })]) {
      const out = text(render(<AgamaSection data={data} />));
      expect(out).toContain('Data agama penduduk belum diisi');
      expect(out).not.toContain('Total tercatat');
      expect(out).not.toContain('dihitung dari isian agama');
    }
  });
});
