// @vitest-environment node
// Program Pengentasan Kemiskinan publik: baris bergaris (CSS Data Lingkungan) bertaut ke detail, keadaan muat/kosong/galat, paginasi klien,
// ubin tautan silang ke Jumlah Penduduk Miskin & Kesejahteraan Masyarakat (EkonomiTerkait bersama).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import rows from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/data-lingkungan.module.css';
import pk from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.module.css';
import terkait from '@/app/(public)/(pages)/ekonomi/_com/terkait/terkait.module.css';
import { EkonomiTerkait, TERKAIT_LABEL_DEFAULT } from '@/app/(public)/(pages)/ekonomi/_com/terkait/EkonomiTerkait';
import { ProgramKemiskinanRows } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/ProgramKemiskinanRows';
import { ProgramKemiskinanTerkait } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/ProgramKemiskinanTerkait';
import {
  toProgramKemiskinan,
  type ProgramKemiskinan,
} from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.logic';
import {
  PROGRAM_KARTU_TEXT,
  PROGRAM_KEMISKINAN_TEXT as T,
} from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.text';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: bentuk entri stg 2026-11-16 (dipangkas); sanitize identitas karena DOMPurify butuh DOM.
const entri = (i: number, icon: string | null = 'ekonomi', slug: string | null = null): ProgramKemiskinan =>
  toProgramKemiskinan({ id: `pk${i}`, nama: `Program ${i}`, slug, deskripsi: `<p>Deskripsi program ${i}</p>`, icon }, (html) => html);
/** Judul baris yang tersapu: span .title di dalam tautan judul. */
const judul = (nama: string) => `<span class="${r.title}">${nama}</span></a>`;
const ready = (items: ProgramKemiskinan[]): LoadState<ProgramKemiskinan[]> => ({ status: 'ready', data: items });
const list = (state: LoadState<ProgramKemiskinan[]>, search = '', page = 1) =>
  render(<ProgramKemiskinanRows state={state} search={search} page={page} onPage={() => {}} />);

describe('ProgramKemiskinanRows', () => {
  it('baris: ikon garis, nama h3, deskripsi; tanpa statistik / grafik kemiskinan', () => {
    const html = list(ready([entri(1)]));
    expect(html).toContain(`<ul class="${rows.rows}" aria-label="${T.listLabel}">`);
    expect(html).toContain(`<span class="${rows.icon}" aria-hidden="true"><svg`);
    expect(html).toContain(
      `<h3 class="${rows.title}"><a href="/ekonomi/program-kemiskinan/pk1" class="${pk.titleLink} ${r.trigger}"><span class="${r.title}">Program 1</span></a></h3>`,
    );
    expect(html).toContain(`<div class="${rows.prose}"><p>Deskripsi program 1</p></div>`);
    expect(text(html)).not.toContain('Statistik Kemiskinan');
  });

  it('tautan detail: judul (slug, fallback id) + aksi "Lihat penerima bantuan" di luar urutan tab', () => {
    const html = list(ready([entri(1, 'ekonomi', 'pkh'), entri(2)]));
    expect(html).toContain(`<a href="/ekonomi/program-kemiskinan/pkh" class="${pk.titleLink} ${r.trigger}"><span class="${r.title}">Program 1</span></a>`);
    expect(html).toContain(`<a href="/ekonomi/program-kemiskinan/pk2" class="${pk.titleLink} ${r.trigger}"><span class="${r.title}">Program 2</span></a>`);
    const aksi = PROGRAM_KARTU_TEXT.lihatPenerima;
    expect(html).toContain(
      `<a href="/ekonomi/program-kemiskinan/pkh" class="${pk.aksi} ${r.trigger}" tabindex="-1" aria-hidden="true"><span class="${r.cta}" data-text="${aksi}">${aksi}</span><svg`,
    );
    expect(html).not.toContain('→');
    // Deskripsi tidak berada di dalam <a> (CMS bisa berisi tautan sendiri).
    expect(html).not.toMatch(/<a [^>]*>(?:(?!<\/a>)[\s\S])*Deskripsi program 1/);
  });

  it('ikon tak dikenal → baris tanpa ikon, entri tetap tampil', () => {
    const html = list(ready([entri(1, 'icon-test')]));
    expect(html).not.toContain(rows.icon);
    expect(html).toContain(judul('Program 1'));
  });

  it('cari di klien menyaring baris', () => {
    const html = list(ready([entri(1), entri(2)]), 'program 2');
    expect(html).toContain(judul('Program 2'));
    expect(html).not.toContain(judul('Program 1'));
  });

  it('paginasi klien 10 per halaman dari satu data muat; 1 halaman → paginasi tidak dirender', () => {
    const many = Array.from({ length: 11 }, (_, i) => entri(i + 1));
    const page1 = list(ready(many));
    expect(page1).toContain(`aria-label="${T.paginationLabel}"`);
    expect(page1).toContain(judul('Program 10'));
    expect(page1).not.toContain(judul('Program 11'));
    const page2 = list(ready(many), '', 2);
    expect(page2).toContain(judul('Program 11'));
    expect(page2).not.toContain(judul('Program 10'));
    expect(list(ready([entri(1)]))).not.toContain(T.paginationLabel);
  });

  it('memuat: kerangka aria-busy', () => {
    const html = list({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(rows.placeholderRow);
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(list(ready([]))).toContain(`<p class="${kabar.empty}">${T.empty}</p>`);
    expect(list(ready([entri(1)]), 'zzz')).toContain('Tidak ada program yang cocok dengan “zzz”.');
    expect(list({ status: 'error' })).toContain(T.error);
  });
});

describe('tautan silang', () => {
  it('ProgramKemiskinanTerkait: ke Jumlah Penduduk Miskin & Kesejahteraan Masyarakat', () => {
    const html = render(<ProgramKemiskinanTerkait />);
    expect(html).toContain('href="/ekonomi/jumlah-penduduk-miskin"');
    expect(html).toContain('href="/ekonomi/kesejahteraan-masyarakat"');
    expect(html).toContain(`aria-label="${T.terkaitListLabel}: ${T.pendudukMiskin.title}"`);
    expect(html).toContain(`aria-label="${T.terkaitListLabel}: ${T.kesejahteraan.title}"`);
    const out = text(html);
    expect(out).toContain(T.pendudukMiskin.aksi);
    expect(out).toContain(T.kesejahteraan.aksi);
  });

  it('EkonomiTerkait: satu tautan seluruh ubin, judul h2, label bawaan "Halaman terkait"', () => {
    const html = render(<EkonomiTerkait href="/x" icon={<svg />} title="Judul" text="Teks" aksi="Buka" />);
    expect(html).toContain(`<aside aria-label="${TERKAIT_LABEL_DEFAULT}">`);
    expect(html.split('<a ').length - 1).toBe(1);
    expect(html).toContain('href="/x"');
    expect(html).toMatch(/<h2[^>]*>Judul<\/h2>/);
    expect(text(html)).toContain('Teks');
    expect(text(html)).toContain('Buka');
    expect(html).toContain(`class="${terkait.terkait} ${r.trigger}"`);
    expect(html).toContain(`<span class="${r.cta}" data-text="Buka">Buka</span>`);
    expect(html).toMatch(new RegExp(`<svg[^>]*class="[^"]*\\b${r.chevron}\\b`));
  });
});
