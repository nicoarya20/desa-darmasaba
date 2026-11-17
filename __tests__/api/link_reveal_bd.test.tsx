// @vitest-environment node
// Hover sapuan warna (fase 2, menu Ekonomi): garis bawah hover lama diganti modul _com/link-reveal.
// Judul/nama di kartu/baris tautan = span `.title`; label aksi = `.cta` + `data-text`; chevron = `.chevron`;
// elemen yang di-hover/difokus = `.trigger`. jsdom gagal start di repo ini → markup diuji lewat renderToStaticMarkup.
import { Drawer, MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/detail/use-kesejahteraan-detail', () => ({
  useKesejahteraanDetail: () => ({ status: 'notfound' }),
}));

import { EkonomiTerkait } from '@/app/(public)/(pages)/ekonomi/_com/terkait/EkonomiTerkait';
import terkait from '@/app/(public)/(pages)/ekonomi/_com/terkait/terkait.module.css';
import { KesejahteraanDetail } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/detail/KesejahteraanDetail';
import { KESEJAHTERAAN_DETAIL_TEXT as KD } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/kesejahteraan.text';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import { DokumenBumdes } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/DokumenBumdes';
import bumdes from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.module.css';
import { PotensiLink } from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/PotensiLink';
import sektor from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/sektor-unggulan.module.css';
import { SEKTOR_UNGGULAN_TEXT as ST } from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/sektor-unggulan.text';
import { KatalogToolbar } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogToolbar';
import { SaringDrawer } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/SaringDrawer';
import { SaringCheckList } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/SaringGroup';
import { KATALOG_FILTER_TEXT as KF } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.text';
import { emptyParams } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-params.logic';
import layout from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-layout.module.css';
import saring from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/saring.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';

// Drawer di-portal ke body (tidak ada di SSR) → matikan portal lewat theme supaya isinya ikut dirender.
const theme = { components: { Drawer: Drawer.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
const count = (html: string, needle: string) => html.split(needle).length - 1;
/** Teks yang terbaca pembaca layar: tag dibuang, atribut (data-text) tidak ikut. */
const visibleText = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const cta = (label: string) => `<span class="${r.cta}" data-text="${label}">${label}</span>`;
const chevronSvg = new RegExp(`<svg[^>]*class="[^"]*\\b${r.chevron}\\b[^"]*"`, 'g');
const noop = () => {};

describe('EkonomiTerkait (ubin tautan silang semua halaman Ekonomi)', () => {
  const html = render(<EkonomiTerkait href="/x" icon={<svg />} title="Judul" text="Teks" aksi="Lihat program" />);

  it('ubin = .trigger; aksi = .cta + data-text di dalam .aksi, chevron .chevron', () => {
    expect(html).toContain(`<a href="/x" class="${terkait.terkait} ${r.trigger}">`);
    expect(html).toContain(`<span class="${terkait.aksi}" aria-hidden="true">${cta('Lihat program')}<svg`);
    expect(html.match(chevronSvg)).toHaveLength(1);
  });

  it('teks aksi hanya terbaca sekali (salinan tebal lewat atribut)', () => {
    expect(count(visibleText(html), 'Lihat program')).toBe(1);
  });
});

describe('KesejahteraanDetail tidak ditemukan', () => {
  const html = render(<KesejahteraanDetail id="x" />);

  it('"Lihat semua program kesejahteraan" = .trigger + .cta + chevron', () => {
    expect(html).toContain(`class="${d.emptyLink} ${r.trigger}">${cta(KD.backToList)}<svg`);
    expect(html.match(chevronSvg)).toHaveLength(1);
  });

  it('tautan kembali "‹ …" = .trigger + .cta, chevron kiri .chevronBack (geser ke kiri)', () => {
    expect(html).toMatch(
      new RegExp(`class="${back.back} ${r.trigger}"><svg[^>]*class="[^"]*\\b${r.chevronBack}\\b[^]*?</svg>${cta(KD.kembali)}</a>`),
    );
  });
});

describe('DokumenBumdes', () => {
  it('"Unduh" = .cta + chevron; nama aksesibel tetap dari aria-label', () => {
    const html = render(<DokumenBumdes items={[{ id: 'd1', judul: 'SK 2024', keterangan: null, href: '/f.pdf' }]} />);
    expect(html).toMatch(new RegExp(`class="${bumdes.docLink} ${r.trigger}" aria-label="[^"]+">${cta('Unduh')}<svg`));
    expect(html.match(chevronSvg)).toHaveLength(1);
  });
});

describe('PotensiLink (Sektor Unggulan)', () => {
  it('"Lihat potensi desa" = .trigger + .cta + chevron', () => {
    const html = render(<PotensiLink />);
    expect(html).toContain(`class="${sektor.potensiLink} ${r.trigger}">${cta(ST.potensiLink)}<svg`);
    expect(html.match(chevronSvg)).toHaveLength(1);
  });
});

describe('Katalog UMKM: tombol teks brand', () => {
  // test-only: 7 pilihan toko (> TOKO_FACET_VISIBLE + 1 → tombol "Lihat semua (7)").
  const options = Array.from({ length: 7 }, (_, i) => ({ id: `u${i}`, ids: [`u${i}`], label: `Toko ${i}`, count: 1 }));

  it('SaringCheckList: "Lihat semua (n)" = .more + .trigger, data-text = label yang tampil', () => {
    const html = render(<SaringCheckList options={options} selected={[]} onToggle={noop} collapsible />);
    const label = KF.lihatSemua(7);
    expect(html).toContain(`class="${saring.more} ${r.trigger}">${cta(label)}</button>`);
  });

  it('KatalogToolbar: "Hapus semua" chip = .clearAll + .trigger + .cta', () => {
    const chips = [{ key: 'k1', label: 'Makanan', next: emptyParams('produk') }];
    const html = render(
      <KatalogToolbar tab="produk" count={{ shown: 1, total: 2 }} urut="terbaru" onUrut={noop} chips={chips} activeCount={1}
        onApply={noop} onClearAll={noop} onOpenSaring={noop} />,
    );
    expect(html).toContain(`class="${layout.clearAll} ${r.trigger}">${cta(KF.hapusSemua)}</button>`);
  });

  it('SaringDrawer: "Hapus semua" di kaki drawer = .drawerClear + .trigger + .cta', () => {
    const html = render(
      <SaringDrawer opened onClose={noop} tab="produk" params={emptyParams('produk')} facets={null} update={noop} shown={0}
        onClearAll={noop} />,
    );
    expect(html).toContain(`class="${saring.drawerClear} ${r.trigger}">${cta(KF.hapusSemua)}</button>`);
  });
});

describe('CSS menu Ekonomi', () => {
  const E = 'app/(public)/(pages)/ekonomi/';
  // Garis bawah hover lama dihapus seluruhnya (tidak ada garis bawah tersisa di file ini).
  const CLEARED = [
    'kesejahteraan-masyarakat/_com/detail/kesejahteraan-detail.module.css',
    'kesejahteraan-masyarakat/_com/kesejahteraan.module.css',
    'umkm/_com/katalog/toko-card.module.css',
    'umkm/_com/katalog/produk-card.module.css',
    'umkm/_com/katalog/saring.module.css',
    'umkm/_com/katalog/katalog-layout.module.css',
    'umkm/_com/detail-produk/info.module.css',
    '_com/terkait/terkait.module.css',
    'program-kemiskinan/_com/program-kemiskinan.module.css',
    'Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.module.css',
    'lowongan-kerja-lokal/_com/filter.module.css',
    'lowongan-kerja-lokal/_com/lowongan-card.module.css',
    'lowongan-kerja-lokal/_com/detail/detail-status.module.css',
    'sektor-unggulan-desa/_com/sektor-unggulan.module.css',
  ];

  it.each(CLEARED)('%s: tanpa text-decoration underline / text-underline-offset', (file) => {
    const css = SRC(E + file);
    expect(css).not.toMatch(/text-decoration:\s*underline/);
    expect(css).not.toContain('text-underline-offset');
  });

  it('alamat Google Maps lowongan: garis bawah PERMANEN tetap (bukan hover), hover tidak menambah underline', () => {
    const css = SRC(E + 'lowongan-kerja-lokal/_com/detail/detail-section.module.css');
    expect(css).toMatch(/\.placeLink \{[^}]*text-decoration: underline;/);
    expect(css).not.toMatch(/:hover[^{]*\{[^}]*text-decoration:\s*underline/);
  });
});
