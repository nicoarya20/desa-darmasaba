// @vitest-environment node
// Jumlah Penduduk Miskin publik: kartu tahun terbaru + selisih, batang per tahun (stat-bars), keadaan muat/galat/kosong.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PendudukMiskinContent } from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/PendudukMiskinContent';
import { perubahanText } from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/PendudukMiskinSummary';
import type { PendudukMiskinTahun } from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/penduduk-miskin.logic';
import { PENDUDUK_MISKIN_TEXT as T } from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/penduduk-miskin.text';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: bentuk data stg 2026-11-16 (urut terbaru dulu, seperti keluaran source).
const row = (tahun: number, jumlah: number | null, updatedAt: string | null = null): PendudukMiskinTahun => ({
  id: `pm${tahun}`,
  tahun,
  jumlah,
  updatedAt,
});
const STG = [
  row(2026, 5, '2026-11-02T03:00:00Z'),
  row(2025, 390, '2026-01-10T03:00:00Z'),
  row(2024, 410),
  row(2023, 430),
  row(2022, 445),
  row(2021, 480),
];
const ready = (data: PendudukMiskinTahun[]): LoadState<PendudukMiskinTahun[]> => ({ status: 'ready', data });
const content = (state: LoadState<PendudukMiskinTahun[]>) => render(<PendudukMiskinContent state={state} />);

describe('PendudukMiskinContent', () => {
  it('kartu = tahun terbaru apa adanya (2026 = 5) + selisih dari 2025; tanpa total lintas tahun 2.160', () => {
    const out = text(content(ready(STG)));
    expect(out).toContain('Penduduk miskin tahun 2026');
    expect(out).toContain('5 orang');
    expect(out).toContain('Turun 385 orang (98,7%) dari 2025');
    expect(out).toContain('Data diperbarui 2 November 2026');
    expect(out).not.toContain('2.160');
    expect(out).not.toContain('2160');
  });

  it('panel batang per tahun: judul, terbaru di atas, tanpa persen porsi', () => {
    const html = content(ready(STG));
    const out = text(html);
    expect(html).toContain('aria-labelledby="penduduk-miskin-panel-title"');
    expect(out).toContain(T.panelTitle);
    const panel = out.slice(out.indexOf(T.panelTitle));
    expect(panel).toContain('2026 5 orang');
    expect(panel).toContain('2021 480 orang');
    expect(panel.indexOf('2026 5 orang')).toBeLessThan(panel.indexOf('2025 390 orang'));
    expect(panel.indexOf('2025 390 orang')).toBeLessThan(panel.indexOf('2021 480 orang'));
    expect(panel).not.toContain('%');
  });

  it('satu tahun saja → kartu tanpa panel, catatan "belum ada pembanding"', () => {
    const html = content(ready([row(2025, 390)]));
    expect(text(html)).toContain(T.tanpaPembanding);
    expect(html).not.toContain('penduduk-miskin-panel-title');
    expect(html).not.toContain('Data diperbarui');
  });

  it('tahun terbaru kosong → kartu memakai tahun terisi berikutnya', () => {
    const out = text(content(ready([row(2026, null), row(2025, 390), row(2024, 410)])));
    expect(out).toContain('Penduduk miskin tahun 2025');
    expect(out).toContain('Turun 20 orang (4,9%) dari 2024');
  });

  it('memuat → kerangka aria-busy; galat → role alert; kosong → ubin tanpa "0 orang"', () => {
    const loading = content({ status: 'loading' });
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain(`aria-label="${T.loading}"`);

    const error = content({ status: 'error' });
    expect(error).toContain('role="alert"');
    expect(text(error)).toContain(T.error);

    for (const state of [ready([]), ready([row(2026, null)])]) {
      const out = text(content(state));
      expect(out).toContain(T.empty);
      expect(out).not.toContain('0 orang');
      expect(out).not.toContain('Penduduk miskin tahun');
    }
  });
});

describe('perubahanText', () => {
  it('naik / turun dengan persen, pembanding 0 tanpa persen, tetap = "Sama dengan"', () => {
    expect(perubahanText({ selisih: -385, persen: -98.718, dari: 2025 })).toBe('Turun 385 orang (98,7%) dari 2025');
    expect(perubahanText({ selisih: 1200, persen: 50, dari: 2024 })).toBe('Naik 1.200 orang (50%) dari 2024');
    expect(perubahanText({ selisih: 10, persen: null, dari: 2024 })).toBe('Naik 10 orang dari 2024');
    expect(perubahanText({ selisih: 0, persen: 0, dari: 2024 })).toBe('Sama dengan 2024');
  });
});
