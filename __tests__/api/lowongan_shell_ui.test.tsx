// @vitest-environment node
// Kerangka daftar lowongan: panel Filter (kotak "Pilihan Anda", grup, pil), baris alat, drawer, keadaan badan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; interaksi (klik, drawer) diverifikasi manual.
import { Drawer, MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import { FilterDrawer } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/FilterDrawer';
import { FilterPanel } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/FilterPanel';
import f from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/filter.module.css';
import g from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/filter-group.module.css';
import { emptyParams, type LowonganParams } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-params.logic';
import { buildLowonganView } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-view.logic';
import type { Lowongan } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan.types';
import l from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-layout.module.css';
import { LowonganBody } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/LowonganBody';
import { LowonganToolbar } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/LowonganToolbar';

// Drawer di-portal ke body (tidak ada di SSR) → matikan portal lewat theme supaya isinya ikut dirender.
const theme = { components: { Drawer: Drawer.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const heads = (html: string) =>
  [...html.matchAll(/aria-expanded="(true|false)" aria-controls[^>]*>([\s\S]*?)<\/button>/g)].map((m) => [text(m[2]), m[1]]);
const pills = (html: string) =>
  [...html.matchAll(/aria-pressed="(true|false)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => [text(m[2]), m[1]]);
const noop = () => {};

const DAY = 86_400_000;
// test-only: waktu acuan tetap, 14 November 2026 12.00 WITA (LowonganBody membaca Date.now() sekali saat dirender).
const NOW = Date.UTC(2026, 10, 14, 4, 0, 0);
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
});
afterAll(() => {
  vi.useRealTimers();
});

// test-only: 8 lowongan dari 8 pemberi kerja (lebih dari 6 → "Lihat semua"), 2 tipe, 1 tanpa gaji.
const data: Lowongan[] = Array.from({ length: 8 }, (_, i) => ({
  id: `l${i}`,
  posisi: `Posisi ${i}`,
  pemberiKerja: `Usaha ${i}`,
  pemberiKey: `usaha ${i}`,
  tipe: i < 6 ? 'Full Time' : 'Freelance',
  tipeKey: i < 6 ? 'full time' : 'freelance',
  lokasi: 'Darmasaba',
  gaji: i === 0 ? null : 1_500_000 + i * 250_000,
  ringkasan: '',
  tayangMs: NOW - (i + 1) * DAY,
}));
const ready = { status: 'ready' as const, data };
const params = (over: Partial<LowonganParams> = {}): LowonganParams => ({ ...emptyParams(), ...over });
const view = (p = params(), items = data) => buildLowonganView(items, p, NOW);
const panel = (p = params(), items = data, bare = false) => {
  const v = view(p, items);
  return render(<FilterPanel params={v.params} facets={v.facets} chips={v.chips} update={noop} onClearAll={noop} bare={bare} />);
};
const body = (state: Parameters<typeof LowonganBody>[0]['state'], p = params()) =>
  render(<LowonganBody state={state} params={p} update={noop} onRetry={noop} />);

describe('FilterPanel', () => {
  it('kartu dengan strip h2 "Filter", kotak "Pilihan Anda" kosong, lalu "Atur filter" dengan 4 grup', () => {
    const html = panel();
    expect(html).toContain(`<h2 class="${f.cardHead}">Filter</h2>`);
    expect(html).toContain(`<h3 class="${f.boxTitle}">Pilihan Anda</h3><p class="${f.aktifEmpty}">Belum ada filter dipilih.</p>`);
    expect(html).toContain(`<h3 class="${f.boxTitle}">Atur filter</h3>`);
    expect(html).not.toContain('Hapus semua');
    expect(heads(html)).toEqual([
      ['Tipe pekerjaan', 'true'],
      ['Gaji per bulan', 'true'],
      ['Pemberi kerja', 'false'],
      ['Waktu tayang', 'false'],
    ]);
  });

  it('pil pilihan = tombol aria-pressed dengan jumlah; tipe urut jumlah terbanyak; ambang gaji 0 disembunyikan', () => {
    const all = pills(panel());
    expect(all.slice(0, 2)).toEqual([
      ['Full Time 6', 'false'],
      ['Freelance 2', 'false'],
    ]);
    // Gaji tertinggi di data = Rp3,25 juta → "Minimal Rp4 juta" dan "Minimal Rp5 juta" tidak tampil.
    expect(all.slice(2, 6)).toEqual([
      ['Minimal Rp1,5 juta 7', 'false'],
      ['Minimal Rp2 juta 6', 'false'],
      ['Minimal Rp2,5 juta 4', 'false'],
      ['Minimal Rp3 juta 2', 'false'],
    ]);
    expect(text(panel())).not.toMatch(/Rp4 juta|Rp5 juta/);
  });

  it('pilihan terpilih: aria-pressed true + ikon centang, angka di kepala grup, grup beraktif terbuka', () => {
    const html = panel(params({ tipe: ['freelance'], pemberi: ['usaha 1'], gaji: 2_000_000, tayang: 7 }));
    expect(heads(html)).toEqual([
      ['Tipe pekerjaan 1', 'true'],
      ['Gaji per bulan 1', 'true'],
      ['Pemberi kerja 1', 'true'],
      ['Waktu tayang 1', 'true'],
    ]);
    const pressed = pills(html).filter(([, on]) => on === 'true').map(([label]) => label);
    expect(pressed).toEqual(['Freelance 2', 'Minimal Rp2 juta 6', 'Usaha 1 1', '7 hari terakhir 7']);
    expect(html).toMatch(new RegExp(`aria-pressed="true"><svg[^>]*tabler-icon-check`));
    expect(html).toContain(`Tipe pekerjaan<span class="${g.groupBadge}">1</span>`);
  });

  it('kotak "Pilihan Anda" berisi chip per filter aktif (tombol hapus berlabel) + "Hapus semua"', () => {
    const html = panel(params({ tipe: ['freelance'], gaji: 2_000_000 }));
    expect(html).not.toContain('Belum ada filter dipilih.');
    expect(count(html, `class="${f.chip}"`)).toBe(2);
    expect(html).toContain('aria-label="Hapus filter Freelance"');
    expect(html).toContain('aria-label="Hapus filter Minimal Rp2 juta"');
    expect(html).toMatch(new RegExp(`class="${f.clearAll}">Hapus semua</button>`));
  });

  it('pemberi kerja > 6 → 6 pilihan + "Lihat semua (8)"; pilihan terpilih di luar batas tetap tampil', () => {
    const html = text(panel(params({ pemberi: ['usaha 7'] })));
    expect(html).toContain('Lihat semua (8)');
    expect(html).toContain('Usaha 5 1');
    expect(html).not.toContain('Usaha 6 1');
    expect(html).toContain('Usaha 7 1');
  });

  it('7 pemberi kerja (hanya 1 yang akan tersembunyi) → semua tampil tanpa "Lihat semua"', () => {
    const html = text(panel(params(), data.slice(0, 7)));
    expect(html).not.toContain('Lihat semua');
    expect(html).toContain('Usaha 6 1');
  });

  it('grup tanpa pilihan tidak dirender (semua tanpa gaji, tanpa tipe, tanggal tak terbaca)', () => {
    const polos = data.slice(0, 2).map((item) => ({ ...item, gaji: null, tipe: null, tipeKey: null, tayangMs: 0 }));
    expect(heads(panel(params(), polos))).toEqual([['Pemberi kerja', 'false']]);
  });

  it('facets null → kerangka 4 baris aria-busy; bare → tanpa kartu dan strip kepala', () => {
    const loading = render(<FilterPanel params={params()} facets={null} chips={[]} update={noop} onClearAll={noop} />);
    expect(loading).toContain('aria-busy="true"');
    expect(count(loading, f.skeletonRow)).toBe(4);
    expect(heads(loading)).toEqual([]);
    const bare = panel(params(), data, true);
    expect(bare).not.toContain('<h2');
    expect(bare).not.toContain(f.card);
    expect(heads(bare)).toHaveLength(4);
  });
});

describe('LowonganToolbar', () => {
  const toolbar = (over: Partial<Parameters<typeof LowonganToolbar>[0]> = {}) =>
    render(
      <LowonganToolbar count={{ shown: 8, total: 8 }} urut="terbaru" onUrut={noop} chips={[]} activeCount={0}
        onApply={noop} onClearAll={noop} onOpenFilter={noop} {...over} />,
    );

  it('jumlah besar h2: semua vs. tersaring vs. belum siap', () => {
    expect(toolbar()).toContain(`<h2 class="${l.count}" aria-live="polite"><strong>8</strong> lowongan</h2>`);
    expect(toolbar({ count: { shown: 3, total: 8 } })).toContain(
      `<strong>3</strong> lowongan<span class="${l.countOf}"> dari 8</span></h2>`,
    );
    expect(text(toolbar({ count: null }))).not.toMatch(/\d+ lowongan/);
  });

  it('Urutkan menampilkan label urutan aktif; pil Filter dengan angka filter aktif', () => {
    const html = toolbar({ urut: 'gaji-desc', activeCount: 2 });
    expect(html).toContain('value="Gaji tertinggi"');
    expect(html).toContain('>Urutkan</label>');
    expect(html).toMatch(new RegExp(`class="${l.filterPill}"[^>]*aria-haspopup="dialog">.*?Filter<span`));
    expect(html).toContain('aria-label="2 filter aktif"');
    expect(toolbar()).not.toContain('filter aktif');
  });

  it('baris chip (≤1068px) + "Hapus semua" hanya bila ada filter', () => {
    expect(toolbar()).not.toContain(l.toolbarChips);
    const v = view(params({ pemberi: ['usaha 2'], tayang: 30 }));
    const html = toolbar({ chips: v.chips, activeCount: v.activeCount });
    expect(html).toContain(`class="${l.toolbarChips}"`);
    expect(html).toContain('aria-label="Hapus filter Usaha 2"');
    expect(html).toContain('aria-label="Hapus filter 30 hari terakhir"');
    expect(text(html)).toContain('Hapus semua');
  });
});

describe('FilterDrawer', () => {
  const drawer = (opened: boolean) => {
    const v = view(params({ tipe: ['freelance'] }));
    return render(
      <FilterDrawer opened={opened} onClose={noop} params={v.params} facets={v.facets} chips={v.chips} update={noop}
        shown={v.items.length} onClearAll={noop} />,
    );
  };

  it('terbuka: judul "Filter", panel tanpa kartu, kaki "Hapus semua" + "Tampilkan N lowongan"', () => {
    const html = drawer(true);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Tutup filter"');
    expect(html).not.toContain(f.cardHead);
    expect(text(html)).toContain('Pilihan Anda');
    expect(html).toMatch(new RegExp(`class="${f.drawerClear}">Hapus semua</button>`));
    expect(html).toMatch(new RegExp(`class="${f.drawerApply}">Tampilkan 2 lowongan</button>`));
  });

  it('tertutup: isi tidak dirender', () => {
    expect(drawer(false)).not.toContain('Tampilkan 2 lowongan');
  });
});

describe('LowonganBody', () => {
  it('memuat: kerangka panel + daftar aria-busy, tanpa jumlah', () => {
    const html = body({ status: 'loading' });
    expect(count(html, 'aria-busy="true"')).toBe(2);
    expect(text(html)).not.toMatch(/\d+ lowongan/);
    expect(html).toContain('aria-label="Daftar lowongan"');
  });

  it('galat: pesan + "Coba lagi", tanpa baris alat', () => {
    const html = text(body({ status: 'error' }));
    expect(html).toContain('Lowongan belum bisa dimuat');
    expect(html).toContain('Coba lagi');
    expect(html).not.toContain('Urutkan');
  });

  it('siap: panel di aside, 8 kartu menaut ke detail, urut terbaru, jumlah besar', () => {
    const html = body(ready);
    expect(html).toMatch(new RegExp(`<aside class="${l.aside}"><div class="[^"]*${f.card}`));
    expect(count(html, 'href="/ekonomi/lowongan-kerja-lokal/l')).toBe(8);
    expect(html.indexOf('/lowongan-kerja-lokal/l0"')).toBeLessThan(html.indexOf('/lowongan-kerja-lokal/l7"'));
    expect(html).toContain('<strong>8</strong> lowongan</h2>');
  });

  it('filter + urut dari params diterapkan; kunci tak dikenal diabaikan tanpa chip', () => {
    const html = body(ready, params({ tipe: ['freelance', 'magang'], urut: 'gaji-desc' }));
    expect(html).toContain(`<strong>2</strong> lowongan<span class="${l.countOf}"> dari 8</span>`);
    expect(count(html, 'href="/ekonomi/lowongan-kerja-lokal/l')).toBe(2);
    expect(html.indexOf('/lowongan-kerja-lokal/l7"')).toBeLessThan(html.indexOf('/lowongan-kerja-lokal/l6"'));
    expect(html).toContain('aria-label="Hapus filter Freelance"');
    expect(html).not.toContain('Hapus filter magang');
  });

  it('waktu tayang memakai waktu saat dirender', () => {
    const html = body(ready, params({ tayang: 7 }));
    expect(html).toContain(`<strong>7</strong> lowongan<span class="${l.countOf}"> dari 8</span>`);
    expect(html).not.toContain('/lowongan-kerja-lokal/l7"');
  });

  it('hasil filter kosong vs. data kosong', () => {
    const filtered = text(body(ready, params({ q: 'tidak ada' })));
    expect(filtered).toContain('Tidak ada lowongan yang cocok');
    expect(filtered).toContain('Hapus filter dan kata kunci');
    expect(filtered).toContain('0 lowongan dari 8');
    const none = text(body({ status: 'ready', data: [] }));
    expect(none).toContain('Belum ada lowongan');
    expect(none).not.toContain('Hapus filter dan kata kunci');
  });
});
