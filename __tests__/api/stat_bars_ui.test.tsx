// @vitest-environment node
// Modul bersama stat-bars: markup panel (tunggal, bersegmen, tanpa batang, teks angka pemakai) dan ubin keadaan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { summarizeStatBars, type StatBarItem } from '@/app/(public)/_com/stat-bars/stat-bars.logic';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only
const item = (id: string, label: string, value: number | null, extra: Partial<StatBarItem> = {}): StatBarItem => ({ id, label, value, ...extra });

describe('StatBarsPanel', () => {
  it('batang tunggal: total, angka + satuan + persen, catatan kaki, batang aria-hidden', () => {
    const summary = summarizeStatBars([item('a', 'A', 300), item('b', 'B', null)]);
    const html = render(
      <StatBarsPanel titleId="t" title="Judul" caption="Cap" summary={summary} unit="orang" totalLabel="Total tercatat" footnote="1 belum diisi" />,
    );
    const out = text(html);
    expect(out).toContain('Total tercatat 300 orang');
    expect(out).toContain('A 300 orang 100%');
    expect(out).toContain('B Belum diisi');
    expect(out).toContain('1 belum diisi');
    expect(html).toContain('aria-labelledby="t"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toMatch(/width:100%/);
  });

  it('bersegmen: legenda + jumlah & porsi segmen, rincian per baris, tanpa kunci mentah', () => {
    const summary = summarizeStatBars([item('k', 'Karyawan Swasta', 570, { segments: [260, 310] }), item('p', 'Petani', 300, { segments: [180, 120] })]);
    const html = render(
      <StatBarsPanel titleId="d" title="Pekerjaan" summary={summary} unit="orang" segments={[{ label: 'Laki-laki' }, { label: 'Perempuan' }]} />,
    );
    const out = text(html);
    expect(out).toContain('Laki-laki 440 50,6%');
    expect(out).toContain('Perempuan 430 49,4%');
    expect(out).toContain('Karyawan Swasta 570 orang 65,5% Laki-laki 260 Perempuan 310');
    expect(html).toContain('flex-grow:260');
    expect(html).toContain('var(--stat-seg-1)');
    expect(out).not.toMatch(/(^|\s)(laki|perempuan)\s/);
  });

  it('tanpa batang + teks angka pemakai + meta, tanpa kotak total & persen', () => {
    const summary = summarizeStatBars([item('s', 'Padi', 1250, { figure: '1.250 ton' })]);
    const html = render(<StatBarsPanel titleId="s" title="Sektor" meta="Periode 2025" summary={summary} showBars={false} />);
    const out = text(html);
    expect(out).toContain('Padi 1.250 ton');
    expect(out).toContain('Periode 2025');
    expect(html).not.toContain('aria-hidden');
    expect(out).not.toContain('%');
  });
});

describe('Ubin keadaan', () => {
  it('kosong: satu kalimat, judul & ikon opsional', () => {
    const out = text(render(<StatBarsEmpty body="Data akan tampil di sini." />));
    expect(out.trim()).toBe('Data akan tampil di sini.');
  });

  it('galat: role alert + pil Coba lagi bila onRetry ada', () => {
    const html = render(<StatBarsError message="Gagal memuat." onRetry={() => {}} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain('Coba lagi');
    expect(render(<StatBarsError message="Gagal memuat." />)).not.toContain('<button');
  });

  it('memuat: aria-busy + label', () => {
    const html = render(<StatBarsSkeleton label="Memuat data" rows={2} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Memuat data"');
  });
});

describe('Opsi tambahan (Dashboard Kependudukan)', () => {
  it('detail di bawah label + totalDetail di bawah total, angka & persen tetap ada', () => {
    const summary = summarizeStatBars([item('b', 'Balerpasar', 1106, { detail: '230 KK' }), item('m', 'Menesa', 403)]);
    const html = render(
      <StatBarsPanel titleId="bj" title="Banjar" summary={summary} unit="jiwa" totalLabel="Total penduduk" totalDetail="333 kepala keluarga" />,
    );
    const out = text(html);
    expect(out).toContain('Total penduduk 1.509 jiwa 333 kepala keluarga');
    expect(out).toContain('Balerpasar 230 KK 1.106 jiwa 73,3%');
    expect(out).toContain('Menesa 403 jiwa 26,7%');
    expect(html.match(/230 KK/g)).toHaveLength(1);
  });

  it('totalDetail tidak tampil tanpa kotak total', () => {
    const summary = summarizeStatBars([item('a', 'A', 5)]);
    const out = text(render(<StatBarsPanel titleId="x" title="X" summary={summary} totalDetail="2 KK" />));
    expect(out).not.toContain('2 KK');
  });

  it('formatShare menggantikan format persen bawaan; tanpa prop tetap formatPercent', () => {
    const summary = summarizeStatBars([item('h', 'Hindu', 4213), item('k', 'Konghucu', 2)]);
    const custom = text(render(<StatBarsPanel titleId="g" title="Agama" summary={summary} formatShare={(v) => `${v.toFixed(2)} persen`} />));
    expect(custom).toContain('Konghucu 2 0.05 persen');
    const bawaan = text(render(<StatBarsPanel titleId="g" title="Agama" summary={summary} />));
    expect(bawaan).toContain('Konghucu 2 0%');
  });

  it('ubin keadaan dengan title + titleId merender h2 ber-id; tanpa title tidak ada h2', () => {
    const empty = render(<StatBarsEmpty title="Penduduk per banjar" titleId="t1" body="Belum ada data." />);
    expect(empty).toMatch(/<h2 id="t1"[^>]*>Penduduk per banjar<\/h2>/);
    const err = render(<StatBarsError title="Penduduk per banjar" titleId="t2" message="Gagal." onRetry={() => {}} />);
    expect(err).toMatch(/<h2 id="t2"[^>]*>Penduduk per banjar<\/h2>/);
    expect(err).toContain('role="alert"');
    const skel = render(<StatBarsSkeleton title="Penduduk per banjar" titleId="t3" label="Memuat" />);
    expect(skel).toMatch(/<h2 id="t3"[^>]*>Penduduk per banjar<\/h2>/);
    expect(render(<StatBarsError message="Gagal." />)).not.toContain('<h2');
    expect(render(<StatBarsSkeleton label="Memuat" />)).not.toContain('<h2');
  });
});
