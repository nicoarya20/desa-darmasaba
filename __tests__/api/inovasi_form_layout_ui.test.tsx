// @vitest-environment node
// Tata letak formulir Inovasi (Ajukan Ide + Administrasi Online): pembungkus `fullWidth` melepas garis henti 1200px PPID
// agar kartu formulir sampai tepi kanan halaman, kolom formulir dibatasi di layar lebar, jarak kolom kiri seragam pola
// PPID (antar-blok 40/32, judul → isi 20). jsdom rusak di repo ini → markup via renderToStaticMarkup + isi CSS module.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  usePathname: () => '/inovasi/layanan-online-desa',
}));

// vi.mock di-hoist ke atas → path harus literal. Hanya pembungkus halaman yang diuji di sini; isi formulir & hook data diuji di inovasi_layanan_online_ui.
vi.mock('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/use-jenis-layanan', () => ({ useJenisLayanan: () => ({ status: 'loading' }) }));
vi.mock('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/use-administrasi-form', () => ({
  useAdministrasiForm: () => ({ values: { jenisLayananId: '' }, errors: {}, status: 'idle', setField: vi.fn(), submit: vi.fn(), reset: vi.fn() }),
}));
vi.mock('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/AdministrasiForm', () => ({
  AdministrasiForm: () => <form data-testid="administrasi-form" />,
  AdministrasiSent: () => null,
}));

import f from '@/app/(public)/(pages)/inovasi/_com/inovasi-form.module.css';
import { AjukanIdePage } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/AjukanIdePage';
import ide from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css';
import { AdministrasiPage } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/AdministrasiPage';
import adm from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.module.css';
import ppid from '@/app/(public)/(pages)/ppid/_com/permohonan.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const ROOT = 'src/app/(public)/(pages)';
const css = (file: string) => readFileSync(path.join(process.cwd(), ROOT, file), 'utf8');
/** Isi blok aturan `selector { ... }` pertama di dalam teks CSS (tanpa blok bersarang). */
const rule = (text: string, selector: string) => {
  const start = text.indexOf(`${selector} {`);
  expect(start, `aturan ${selector}`).toBeGreaterThanOrEqual(0);
  return text.slice(start, text.indexOf('}', start));
};
/** Isi blok @media tertentu (sampai penutup `}` pada awal baris). */
const media = (text: string, query: string) => {
  const start = text.indexOf(`@media ${query} {`);
  expect(start, `@media ${query}`).toBeGreaterThanOrEqual(0);
  return text.slice(start, text.indexOf('\n}', start));
};

describe('pembungkus lebar penuh', () => {
  it('Ajukan Ide & Administrasi: fullWidth membungkus langsung PermohonanLayout, kelas urutan bertumpuk tetap', () => {
    const ideHtml = render(<AjukanIdePage />);
    expect(ideHtml).toContain(`<div class="${f.fullWidth} ${ide.formFirst}"><div class="${ppid.layout}">`);
    const admHtml = render(<AdministrasiPage />);
    expect(admHtml).toContain(`<div class="${f.fullWidth} ${adm.layout}"><div class="${ppid.layout}">`);
    expect(admHtml).toContain('data-testid="administrasi-form"');
  });

  it('fullWidth melepas --ppid-measure; 2 kolom: formulir 7/12 dibatasi 824px (isian 760), PPID tidak berubah', () => {
    const shared = css('inovasi/_com/inovasi-form.module.css');
    const base = rule(shared, '.fullWidth');
    expect(base).toContain('--ppid-measure: none;');
    expect(base).toContain('--inovasi-form-max: 824px;');
    expect(base).toContain('--inovasi-form-gap: 64px;');
    expect(media(shared, '(min-width: 75em)')).toMatch(
      /\.fullWidth > div \{\s*grid-template-columns: minmax\(0, 1fr\) min\(calc\(\(100% - var\(--inovasi-form-gap\)\) \* 7 \/ 12\), var\(--inovasi-form-max\)\);/,
    );
    const permohonan = css('ppid/_com/permohonan.module.css');
    expect(permohonan).toContain('max-width: var(--ppid-measure, 75rem);');
    expect(permohonan).toContain('gap: 64px;');
  });
});

describe('jarak kolom kiri', () => {
  it('antar-blok 40px, ≤734px 32px di kedua formulir', () => {
    for (const file of ['inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css', 'inovasi/layanan-online-desa/_com/administrasi/administrasi.module.css']) {
      const text = css(file);
      expect(rule(text, '.aside')).toContain('gap: 40px;');
      expect(rule(media(text, '(max-width: 734px)'), '.aside')).toContain('gap: 32px;');
    }
  });

  it('judul blok → isi 20px: "Tujuan" Ajukan Ide = stepsTitle PPID', () => {
    expect(rule(css('inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css'), '.asideTitle')).toContain('margin: 0 0 20px;');
    expect(rule(css('ppid/_com/permohonan.module.css'), '.stepsTitle')).toContain('margin: 0 0 20px;');
  });
});
