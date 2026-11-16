// @vitest-environment node
// Pendapatan Asli Desa publik: keadaan muat/galat/kosong (kotak satu kalimat, tanpa "Rp 0") dan isi siap (tahun, kartu, rincian).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PadesaBody } from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/PadesaBody';
import { buildPadesView, type PadesView } from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/padesa.logic';
import { PADESA_TEXT as T } from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/padesa.text';
import s from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/padesa.module.css';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import type { APBDes, APBDesItem } from '@/app/(public)/_com/main-page/apbdes/types/apbdes';

const render = (state: LoadState<PadesView>) =>
  renderToStaticMarkup(
    <MantineProvider>
      <PadesaBody state={state} />
    </MantineProvider>,
  ).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: pos meniru APBDes stg 2026-11-16.
const item = (kode: string, anggaran: number, realisasi = 0): APBDesItem => ({
  id: kode,
  kode,
  uraian: `Uraian ${kode}`,
  tipe: 'pendapatan',
  anggaran,
  realisasiItems: realisasi ? [{ id: `${kode}-r`, kode: `R-${kode}`, jumlah: realisasi, apbDesItemId: kode }] : [],
  updatedAt: '2026-11-02T06:30:19.029Z',
});
const apbdes = (tahun: number, items: APBDesItem[]): APBDes => ({ id: `a${tahun}`, tahun, jumlah: 0, items });
const ready = (list: APBDes[]): LoadState<PadesView> => ({ status: 'ready', data: buildPadesView(list) });

const hirarki = [
  apbdes(2025, [
    item('4', 1_500_000_000),
    item('4.1', 350_000_000),
    item('4.1.1', 150_000_000, 30_000_000),
    item('4.1.2', 100_000_000),
    item('4.1.3', 100_000_000),
  ]),
];

describe('PadesaBody', () => {
  it('memuat: kerangka berdenyut aria-busy', () => {
    const html = render({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`aria-label="${T.loading}"`);
  });

  it('galat ≠ kosong: kotak galat berperan alert', () => {
    const html = render({ status: 'error' });
    expect(html).toContain(`<p class="${kabar.empty}" role="alert">${T.error}</p>`);
  });

  it('kosong: satu kalimat "akan tampil di sini", tanpa angka Rp 0 maupun baris label sumber', () => {
    for (const [list, text] of [
      [[], T.emptyNoApbdes],
      [[apbdes(2026, [item('4.2.1', 10)])], T.emptyNoPades],
    ] as const) {
      const html = render(ready([...list]));
      expect(html).toBe(`<p class="${kabar.empty}">${text}</p>`);
      expect(html).toContain('akan tampil di sini');
      expect(html).not.toContain('Rp');
    }
  });

  it('siap: tahun APBDes, kartu anggaran + realisasi, porsi dari Pendapatan Desa, rincian 4.1.x berindentasi', () => {
    const html = render(ready(hirarki));
    expect(html).toContain(`<span class="${s.year}">APBDes Tahun 2025</span>`);
    expect(html).toContain('Data diperbarui 2 November 2026');
    expect(html).toContain('Rp 350 Jt');
    expect(html).toContain('Pagu Rp 350.000.000');
    expect(html).toContain('Realisasi Rp 30 Jt');
    expect(html).toContain('8,6%');
    expect(html).toContain(T.cardPorsi);
    expect(html).toContain('23,3%');
    expect(html).toContain('dari total Pendapatan Desa Rp 1,5 M');
    expect(html).toContain(`<h2 id="padesa-detail-title"`);
    expect(html).toContain('>4.1.3</span>');
    expect(html).not.toContain('>4.2</span>');
    expect(html).not.toContain('—');
  });

  it('tanpa realisasi → "Belum ada realisasi"; tanpa tahun pembanding → tanpa baris selisih', () => {
    const html = render(ready([apbdes(2026, [item('4.1.1', 20_000_000)])]));
    expect(html).toContain('Belum ada realisasi');
    expect(html).not.toContain(s.delta);
    // Pendapatan Desa tahun itu hanya pos PADes → porsi 100%: tetap tampil karena konsisten.
    expect(html).toContain('100%');
  });

  it('dengan tahun PADes sebelumnya → selisih netral "Turun … dari tahun 2025"', () => {
    const html = render(ready([...hirarki, apbdes(2026, [item('4.1.1', 20_000_000)])]));
    expect(html).toContain('APBDes Tahun 2026');
    expect(html).toContain(`<span class="${s.delta}">Turun Rp 330 Jt dari tahun 2025</span>`);
  });
});
