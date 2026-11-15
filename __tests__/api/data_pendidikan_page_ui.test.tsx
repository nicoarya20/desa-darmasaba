// @vitest-environment node
// Halaman publik Data Pendidikan: panel daftar batang gaya APBDes, keadaan kosong/memuat/galat.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & fetch tidak jalan di server).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));

import { DataPendidikanContent, DataPendidikanPage } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/DataPendidikanPage';
import { DataPendidikanNotice } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/DataPendidikanStates';
import { summarizeDataPendidikan, type DataPendidikanItem } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/data-pendidikan.logic';
import { DATA_PENDIDIKAN_TEXT as T } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/data-pendidikan.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ');

// test-only: data stg 2026-11-15 (termasuk "SD" ganda).
const item = (id: string, nama: string, jumlah: number | null): DataPendidikanItem => ({ id, nama, jumlah, updatedAt: null });
const STG = [
  item('pt', 'Perguruan Tinggi', 250),
  item('sd1', 'SD', 874),
  item('sd2', 'SD', 90),
  item('sma', 'SMA', 862),
  item('smp', 'SMP', 50),
  item('tk', 'TK', 120),
];
const content = (items: DataPendidikanItem[]) => render(<DataPendidikanContent summary={summarizeDataPendidikan(items)} />);

describe('Halaman', () => {
  it('sebelum data siap menampilkan judul + kerangka, tanpa angka 0', () => {
    const html = render(<DataPendidikanPage />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`<h1`);
    expect(text(html)).toContain(T.pageTitle);
    expect(text(html)).not.toContain(T.totalLabel);
  });

  it('tanpa kategori → satu ubin kosong, tanpa total dan daftar', () => {
    const html = content([]);
    expect(text(html)).toContain(T.emptyTitle);
    expect(text(html)).not.toContain(T.totalLabel);
    expect(html).not.toContain('<ol');
  });

  it('galat → pesan + tombol Coba lagi', () => {
    const html = render(<DataPendidikanNotice onRetry={() => {}} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.retry);
  });
});

describe('Panel daftar batang', () => {
  const html = content(STG);
  const out = text(html);

  it('total tercatat + satuan orang', () => {
    expect(out).toContain(`${T.totalLabel} 2.246 ${T.unit}`);
  });

  it('baris urut jenjang, SD ganda tetap dua baris, angka + persen tercetak', () => {
    const names = [...html.matchAll(/<li[^>]*>\s*<span[^>]*>([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(names).toEqual(['TK', 'SD', 'SD', 'SMP', 'SMA', 'Perguruan Tinggi']);
    expect(out).toContain('SD 874 orang 38,9%');
    expect(out).toContain('SD 90 orang 4%');
    expect(out).toContain('SMP 50 orang 2,2%');
  });

  it('batang tidak terbaca pembaca layar; panjang relatif ke jenjang terbanyak', () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toMatch(/width:100%/);
    expect(html).not.toContain('recharts');
  });

  it('baris belum diisi tanpa batang, dengan catatan jumlahnya', () => {
    const out2 = text(content([item('sd', 'SD', 300), item('smp', 'SMP', null)]));
    expect(out2).toContain(`SMP ${T.notFilled}`);
    expect(out2).toContain(T.notFilledNote(1));
    expect(out2).toContain('SD 300 orang 100%');
  });
});
