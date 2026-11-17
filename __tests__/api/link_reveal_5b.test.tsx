// @vitest-environment node
// Hover sapuan warna (fase 2, jatah 5b: _com bersama, pemerintahan, kesehatan, Anchor Mantine). Judul = span
// `.title`, label aksi = `.cta` + `data-text` (+ `.chevron`), elemen yang di-hover = `.trigger`; garis bawah
// hover lama dihapus dari CSS. jsdom gagal start di repo ini, jadi markup diuji lewat renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

import { KontakRow } from '@/app/(public)/_com/kontak-darurat/KontakRow';
import k from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { AntiKorupsiGroups } from '@/app/(public)/_com/main-page/desaantikorupsi/AntiKorupsiGroups';
import { groupByKategori } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import ak from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.module.css';
import { ANTIKORUPSI_TEXT } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.text';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import { ProgramTiles } from '@/app/(public)/_com/program-tiles/ProgramTiles';
import pt from '@/app/(public)/_com/program-tiles/program-tiles.module.css';
import { LembagaDetailBody } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailPage';
import ld from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/lembaga-detail.module.css';
import { LEMBAGA_DETAIL_TEXT as LDT } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/lembaga-detail.text';
import { PosyanduRow } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/PosyanduRow';
import pr from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu-rows.module.css';
import { PengumumanRows } from '@/app/(public)/(pages)/pemerintahan/pengumuman/_com/PengumumanRows';
import pl from '@/app/(public)/(pages)/pemerintahan/pengumuman/_com/pengumuman-list.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src/app/(public)', rel), 'utf8');

/** Label aksi sapuan warna: teks + salinan `data-text` untuk cadangan lebar tebal. */
const cta = (text: string) => `<span class="${r.cta}" data-text="${text}">${text}</span>`;

describe('KontakRow: nama tautan = .trigger + span .title', () => {
  const html = render(
    <ul>
      <KontakRow name="Puskesmas Abiansemal" phone={null} icon={null} href="/kesehatan/kontak-darurat/a" linkLabel="Detail Puskesmas" />
    </ul>,
  );

  it('kelas pemicu di tautan, nama di span sapuan, chevron abu tetap', () => {
    expect(html).toContain(`class="${k.nameLink} ${r.trigger}" aria-label="Detail Puskesmas"><span class="${r.title}">Puskesmas Abiansemal</span><svg`);
    expect(html).toContain(k.nameChevron);
  });
});

describe('ProgramTiles: ubin = .trigger, judul .title, "Selengkapnya" .cta + .chevron', () => {
  const html = render(
    <ProgramTiles items={[{ id: 'p1', title: 'Program 1', summary: '', href: '/p/1' }]} label="Daftar" moreLabel="Selengkapnya" />,
  );

  it('ubin, judul, dan label aksi memakai kelas modul sapuan', () => {
    expect(html).toContain(`<a href="/p/1" class="${pt.tile} ${r.trigger}">`);
    expect(html).toContain(`<h3 class="${pt.title}"><span class="${r.title}">Program 1</span></h3>`);
    expect(html).toContain(`<span class="${pt.more}" aria-hidden="true">${cta('Selengkapnya')}<svg`);
    expect(html).toMatch(new RegExp(`<svg[^>]*class="[^"]*${r.chevron}`));
  });
});

describe('AntiKorupsiGroups: tautan kategori = .trigger, nama .title, "Lihat dokumen" .cta + panah .chevron', () => {
  const groups = groupByKategori([{ id: 'a', name: '1.1 ADANYA PERDES', kategoriId: 'k1', kategori: { name: 'PENGUATAN TATA LAKSANA' } }]);
  const html = render(<AntiKorupsiGroups groups={groups} loading={false} kategoriHref={(g) => `/detail?kategori=${g.id}`} />);

  it('nama kategori tetap ber-id (aria-labelledby) dengan span sapuan di dalamnya', () => {
    expect(html).toContain(`class="${ak.groupLink} ${r.trigger}"`);
    expect(html).toContain(`<span id="antikorupsi-kategori-k1"><span class="${r.title}">Penguatan tata laksana</span></span>`);
  });

  it('petunjuk: label .cta lalu panah teks inline-block yang ikut bergeser', () => {
    expect(html).toContain(`${cta(ANTIKORUPSI_TEXT.lihatDokumen)} <span class="${ak.groupArrow} ${r.chevron}" aria-hidden="true">→</span>`);
  });
});

describe('PengumumanRows: baris = .trigger, judul .title', () => {
  // test-only: satu pengumuman siap tampil.
  const item: KabarItem = { id: 'a', title: 'Lelang Proyek', summary: '', kategori: 'Lelang', createdAt: Date.UTC(2026, 8, 13), href: '/x/a' };
  const html = render(<PengumumanRows items={[item]} loading={false} placeholderRows={1} showKategori loadingLabel="Memuat" />);

  it('judul baris dibungkus span sapuan', () => {
    expect(html).toContain(`class="${pl.row} ${r.trigger}"`);
    expect(html).toContain(`<span class="${pl.title}"><span class="${r.title}">Lelang Proyek</span></span>`);
  });
});

describe('PosyanduRow: tautan nama (diregangkan menutup baris) = .trigger + span .title', () => {
  const html = render(
    <ul>
      <PosyanduRow item={{ id: 'a', name: 'Posyandu Mawar', nomor: null, deskripsi: null, jadwalPelayanan: null, image: null, banjar: null }} />
    </ul>,
  );

  it('nama posyandu memakai kelas sapuan', () => {
    expect(html).toContain(`class="${pr.name} ${r.trigger}"><span class="${r.title}">Posyandu Mawar</span></a>`);
  });
});

describe('sumber: pemakai yang dirender lewat state/data (tanpa render penuh)', () => {
  // Semua pemakai tautan d.emptyLink / d.kategori yang dikerjakan 5b (Kesejahteraan → bd, Pencegahan → 86).
  const DETAIL = [
    '(pages)/pemerintahan/pengumuman/_com/detail/PengumumanDetail.tsx',
    '(pages)/pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail.tsx',
    '(pages)/pemerintahan/layanan/_com/detail/LayananDetail.tsx',
    '(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/detail/PengurusDetail.tsx',
    '(pages)/lingkungan/program-penghijauan/_com/detail/PenghijauanDetail.tsx',
    '(pages)/kesehatan/kontak-darurat/_com/detail/KontakDaruratDetail.tsx',
    '(pages)/kesehatan/program-kesehatan/_com/detail/ProgramDetail.tsx',
    '(pages)/kesehatan/posyandu/_com/detail/PosyanduDetail.tsx',
    '(pages)/kesehatan/puskesmas/_com/detail/PustuDetail.tsx',
    '(pages)/inovasi/program-kreatif-desa/_com/detail/ProgramKreatifDetail.tsx',
    '(pages)/inovasi/inovasi-teknologi-desa/_com/detail/InovasiDetail.tsx',
    '(pages)/keamanan/laporan-publik/_com/detail/LaporanDetail.tsx',
    '(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/detail/KeamananLingkunganDetail.tsx',
  ];

  it.each(DETAIL)('%s: tiap <Link> emptyLink/kategori = .trigger + label .cta', (file) => {
    const src = SRC(file);
    expect(src).not.toMatch(/<Link[^>]*className=\{\w+\.(emptyLink|kategori)\}/);
    expect(src).toMatch(/<Link[^>]*className=\{`\$\{\w+\.emptyLink\} \$\{r\.trigger\}`\}>\s*<span className=\{r\.cta\} data-text=/);
    expect(src).toContain('<IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />');
  });

  it('kalender "+n lainnya" dan baris Telunjuk Sakti memakai .trigger + .title', () => {
    expect(SRC('(pages)/pemerintahan/event-budaya/_com/kalender-bulan.tsx')).toMatch(
      /className=\{`\$\{s\.more\} \$\{r\.trigger\}`\}[\s\S]*?<span className=\{r\.title\}>\{AGENDA_TEXT\.kalender\.lainnya\(n\)\}<\/span>/,
    );
    const telunjuk = SRC('(pages)/pemerintahan/layanan/_com/pelayananTelunjukSaktiDesa.tsx');
    expect(telunjuk).toContain('className={`${s.row} ${r.trigger}`}');
    expect(telunjuk).toMatch(/<span className=\{s\.rowTitle\}>\s*<span className=\{r\.title\}>\{item\.name\}<\/span>/);
  });

  it('Anchor Mantine 5b: underline="never" (garis bawah hover bawaan Mantine dimatikan); tautan teks pakai .cta', () => {
    const ANCHOR = [
      ['_com/globalSearch.tsx', true],
      ['_com/konten-bersama/struktur-pengurus.view.tsx', false],
      ['(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.profil-tab.tsx', true],
      ['(pages)/pemerintahan/pengumuman/_com/PengumumanLampiran.tsx', false],
      ['(pages)/pemerintahan/pengumuman/_com/PengumumanPdfModal.tsx', true],
      ['(tambahan)/desa-anti-korupsi/_com/DokumenPreviewModal.tsx', true],
      ['(tambahan)/peta-informasi/_com/PetaInformasiGroupCard.tsx', true],
    ] as const;
    for (const [file, text] of ANCHOR) {
      const src = SRC(file);
      const anchors = src.match(/<Anchor\b[^>]*>/g) ?? [];
      expect(anchors.length, file).toBeGreaterThan(0);
      for (const tag of anchors) expect(tag, file).toContain('underline="never"');
      if (text) expect(src, file).toContain('<span className={r.cta} data-text=');
    }
  });

  it('ProgramBreadcrumb DAK: tautan = .trigger + span inline .title .titleBrand (tanpa tebal; elipsis lineClamp tetap)', () => {
    const src = SRC('(tambahan)/desa-anti-korupsi/_com/ProgramBreadcrumb.tsx');
    expect(src).toMatch(
      /<Anchor[^>]*className=\{r\.trigger\}[^>]*underline="never"[^>]*lineClamp=\{1\}[^>]*>[\s\S]*?<span className=\{`\$\{r\.title\} \$\{r\.titleBrand\}`\}>\{c\.label\}<\/span>\s*<\/Anchor>/,
    );
    // Item terakhir (halaman aktif) tetap Text biasa tanpa sapuan.
    expect(src).toMatch(/<Text key=\{i\} fz="sm" c="dimmed" lineClamp=\{1\} maw=\{260\} title=\{c\.label\} aria-current="page">\s*\{c\.label\}\s*<\/Text>/);
    // Warna diam breadcrumb = brand #0A4E78 = target .title → varian .titleBrand menyapu ke #1C6EA4, dideklarasikan sesudah .title.
    const css = SRC('_com/link-reveal/link-reveal.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.titleBrand \{\s*--reveal-to: #1c6ea4;\s*\}/);
    expect(css.indexOf('.titleBrand {')).toBeGreaterThan(css.indexOf('.title {'));
  });
});

describe('CSS 5b: tidak ada lagi garis bawah saat :hover', () => {
  const CSS = [
    '_com/kontak-darurat/kontak-darurat.module.css',
    '_com/program-tiles/program-tiles.module.css',
    '_com/main-page/desaantikorupsi/desaantikorupsi.module.css',
    '_com/kabar-list/kabar-detail.module.css',
    '(pages)/pemerintahan/event-budaya/_com/kalender.module.css',
    '(pages)/pemerintahan/pengumuman/_com/pengumuman-list.module.css',
    '(pages)/pemerintahan/layanan/_com/layanan-info.module.css',
    '(pages)/pemerintahan/layanan/_com/detail/layanan-detail.module.css',
    '(pages)/kesehatan/posyandu/_com/posyandu-rows.module.css',
  ];

  it.each(CSS)('%s', (file) => {
    const css = SRC(file).replace(/\/\*[\s\S]*?\*\//g, '');
    // Blok aturan terdalam: selektor + isi tanpa kurung kurawal di dalamnya.
    const hoverUnderline = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      ([, sel, body]) => sel.includes(':hover') && /text-decoration[^;]*underline/.test(body),
    );
    expect(hoverUnderline.map(([, sel]) => sel.trim())).toEqual([]);
  });

  it('nama kategori DAK tidak lagi berganti warna brand saat hover (sapuan yang menggantikannya)', () => {
    const css = SRC('_com/main-page/desaantikorupsi/desaantikorupsi.module.css');
    expect(css).not.toContain('.groupLink:hover');
    expect(css).toMatch(/\.groupArrow \{\s*display: inline-block;/);
  });
});

describe('Tautan kembali "‹ …": sapuan .cta, chevron kiri .chevronBack bergeser ke KIRI', () => {
  // Pemakai `.back` (detail-umkm.module.css) + `.detailLink` PPID [id] (`.backLink` dihapus: kelas tanpa aturan = `undefined`). Teks & ikon tetap; hanya efek hover yang berubah.
  const BACK = [
    '(pages)/ekonomi/umkm/_com/detail-produk/DetailProdukView.tsx',
    '(pages)/ekonomi/umkm/_com/detail-toko/DetailTokoView.tsx',
    '(pages)/ekonomi/kesejahteraan-masyarakat/_com/detail/KesejahteraanDetail.tsx',
    '(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/detail/PengurusDetail.tsx',
    '(pages)/pendidikan/perpustakaan-digital/_com/detail/BukuDetail.tsx',
    '(pages)/lingkungan/program-penghijauan/_com/detail/PenghijauanDetail.tsx',
    '(pages)/pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail.tsx',
    '(pages)/inovasi/program-kreatif-desa/_com/detail/ProgramKreatifDetail.tsx',
    '(pages)/ppid/daftar-informasi-publik/[id]/page.tsx',
  ];

  it.each(BACK)('%s: <Link> kembali = .trigger, IconChevronLeft .chevronBack, label .cta', (file) => {
    const src = SRC(file);
    expect(src).not.toMatch(/className=\{\w+\.back\}/);
    expect(src).toMatch(
      /<Link[^>]*className=\{`[^`]*\.(back|detailLink)\} \$\{r\.trigger\}`\}>\s*<IconChevronLeft className=\{r\.chevronBack\}[^>]*\/>\s*<span className=\{r\.cta\} data-text=\{([^}]+)\}>\s*\{\2\}\s*<\/span>\s*<\/Link>/,
    );
  });

  it('detail lembaga tidak ditemukan: "Ke daftar sekolah" = .trigger + .cta (tanpa chevron, sama seperti sebelumnya)', () => {
    const html = render(<LembagaDetailBody state={{ status: 'ready', data: null }} onRetry={() => {}} />);
    expect(html).toContain(`href="/pendidikan/info-sekolah#lembaga" class="${ld.backLink} ${r.trigger}">${cta(LDT.backToList)}</a>`);
  });

  it('CSS: tanpa garis bawah :hover di ketiga file tautan kembali', () => {
    for (const file of [
      '(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css',
      '(pages)/ppid/daftar-informasi-publik/_com/daftar.module.css',
      '(pages)/pendidikan/info-sekolah/_com/lembaga-detail/lembaga-detail.module.css',
    ]) {
      const css = SRC(file).replace(/\/\*[\s\S]*?\*\//g, '');
      const bad = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, sel, body]) => sel.includes(':hover') && /underline/.test(body));
      expect(bad.map(([, sel]) => sel.trim()), file).toEqual([]);
    }
    // `.backLink` PPID hanya berisi aturan hover; sesudah dihapus kelasnya tak diekspor → jangan dirujuk (class="undefined").
    expect(SRC('(pages)/ppid/daftar-informasi-publik/_com/daftar.module.css')).not.toContain('.backLink');
    expect(SRC('(pages)/ppid/daftar-informasi-publik/[id]/page.tsx')).not.toContain('s.backLink');
  });

  it('modul: .chevronBack geser -3px saat hover & fokus, ikut transisi dan reduced motion seperti .chevron', () => {
    const css = SRC('_com/link-reveal/link-reveal.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.chevron,\s*\.chevronBack \{[^}]*transition: transform/);
    expect(css).toMatch(/\.trigger:focus-visible \.chevronBack \{\s*transform: translateX\(-3px\);/);
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\) \{[^@]*\.trigger:hover \.chevronBack \{\s*transform: translateX\(-3px\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.chevronBack[^@]*transition: none;/);
  });
});
