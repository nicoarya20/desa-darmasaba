// @vitest-environment node
// Dashboard Kependudukan, section Per Banjar: markup tiap keadaan (memuat/galat/kosong/siap).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BanjarSection } from '@/app/(public)/(pages)/kependudukan/_com/banjar/BanjarSection';
import { BANJAR_TEXT as T } from '@/app/(public)/(pages)/kependudukan/_com/banjar/banjar.text';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');

// test-only
const slice = (over: Partial<DatasetSlice>): DatasetSlice => ({
  status: 'ready', tahun: 2026, tahunTersedia: [2026], rows: [], allRows: [], retry: () => {}, ...over,
});
const raw = (id: string, nama: string, penduduk: number | null, kk: number | null, miskin = 0) => ({
  id, nama, penduduk, kk, miskin, tahun: 2026, updatedAt: '2026-11-14T03:00:00.000Z',
});
const ROWS = [raw('a', 'Menesa', 403, 103), raw('b', 'Balerpasar', 1106, 230), raw('c', 'Taman', 1082, 225)];

describe('BanjarSection keadaan', () => {
  it('selalu section #banjar dengan h2 yang dirujuk aria-labelledby', () => {
    for (const status of ['loading', 'error', 'ready'] as const) {
      const html = render(<BanjarSection data={slice({ status, rows: ROWS })} />);
      const id = html.match(/<section id="banjar" aria-labelledby="([^"]+)"/)?.[1];
      expect(id).toBeTruthy();
      expect(html).toMatch(new RegExp(`<h2 id="${id}"[^>]*>${T.title}</h2>`));
    }
  });

  it('memuat → kerangka aria-busy, tanpa angka', () => {
    const html = render(<BanjarSection data={slice({ status: 'loading', tahun: null })} />);
    expect(html).toContain('aria-busy="true"');
    expect(text(html)).not.toContain(T.totalLabel);
  });

  it('galat → role alert + Coba lagi, beda dengan kosong', () => {
    const html = render(<BanjarSection data={slice({ status: 'error', tahun: null })} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.error);
    expect(text(html)).toContain('Coba lagi');
    expect(text(html)).not.toContain(T.empty);
  });

  it('kosong (tahun null atau semua baris tak valid) → ubin kalimat, tanpa daftar/angka 0', () => {
    for (const data of [slice({ tahun: null }), slice({ rows: [{ id: 'x' }] })]) {
      const html = render(<BanjarSection data={data} />);
      expect(text(html)).toContain(T.empty);
      expect(html).not.toContain('<ol');
      expect(html).not.toContain('role="alert"');
    }
  });
});

describe('BanjarSection siap', () => {
  const html = render(<BanjarSection data={slice({ rows: ROWS })} />);
  const out = text(html);

  it('kepala: tahun data + jumlah banjar, total jiwa + KK, tanggal pembaruan', () => {
    expect(out).toContain(T.caption(2026, 3));
    expect(out).toContain(`${T.totalLabel} 2.591 jiwa 558 kepala keluarga`);
    expect(out).toContain('Data diperbarui 14 November 2026');
  });

  it('baris urut terbanyak dengan KK di bawah nama + persen', () => {
    const iBaler = out.indexOf('Balerpasar');
    expect(iBaler).toBeLessThan(out.indexOf('Taman'));
    expect(out.indexOf('Taman')).toBeLessThan(out.indexOf('Menesa'));
    expect(out).toContain('Balerpasar 230 KK 1.106 jiwa 42,7%');
    expect(out).toContain('Menesa 103 KK 403 jiwa 15,6%');
  });

  it('miskin semua 0 → kalimat belum diisi, tanpa angka miskin per baris', () => {
    expect(out).toContain(T.miskinBelumDiisi);
    expect(out).not.toMatch(/\d keluarga miskin/);
    expect(out).not.toContain(T.miskinNote);
  });

  it('miskin terisi → angka per baris + catatan keterangan KPM', () => {
    const filled = text(render(<BanjarSection data={slice({ rows: [raw('a', 'Bucu', 540, 105, 12), raw('b', 'Cabe', 947, 223, 0)] })} />));
    expect(filled).toContain('Bucu 105 KK · 12 keluarga miskin');
    expect(filled).toContain('Cabe 223 KK · 0 keluarga miskin');
    expect(filled).toContain(T.miskinNote);
    expect(filled).not.toContain(T.miskinBelumDiisi);
  });

  it('penduduk kosong → baris Belum diisi + catatan jumlahnya, tidak ikut total', () => {
    const partial = text(render(<BanjarSection data={slice({ rows: [raw('a', 'Bucu', 540, 105), raw('b', 'Cabe', null, 223)] })} />));
    expect(partial).toContain('Cabe 223 KK Belum diisi');
    expect(partial).toContain(T.pendudukBelumDiisi(1));
    expect(partial).toContain(`${T.totalLabel} 540 jiwa 328 kepala keluarga`);
  });
});
