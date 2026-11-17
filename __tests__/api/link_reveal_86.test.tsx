// @vitest-environment node
// Hover sapuan warna (fase 2, jatah 86: Pendidikan, Inovasi, Keamanan, Lingkungan, PPID). Garis bawah hover diganti
// `.trigger` di elemen yang di-hover + span `.title` (judul) atau `.cta` + `data-text` (label aksi) + `.chevron`.
// jsdom gagal start di repo ini, jadi markup diuji lewat renderToStaticMarkup.
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
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal', () => ({ default: () => null }));

import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { InfoSekolahSummary } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/InfoSekolahSummary';
import is from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.module.css';
import { INFO_SEKOLAH_TEXT as IST } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.text';
import { IdeThanks } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/IdeThanks';
import PengantarMusyawarah from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/PengantarMusyawarah';
import ai from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css';
import { AJUKAN_IDE_TEXT as AT } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.text';
import { KolaborasiRow } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/KolaborasiRow';
import { toKolaborasi } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.logic';
import ko from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.module.css';
import { KOLABORASI_TEXT as KT } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.text';
import { LayananOnlineTiles } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/LayananOnlinePage';
import lo from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/layanan-online.module.css';
import { LAYANAN_ONLINE_TEXT as LT } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/layanan-online.text';
import { InformasiRedirectNotice } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/informasi/InformasiRedirect';
import ir from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/informasi/informasi-redirect.module.css';
import { PencegahanSorotan } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/PencegahanSorotan';
import { PencegahanDetailBody } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/detail/PencegahanDetail';
import pd from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/detail/pencegahan-detail.module.css';
import { toPencegahanItem } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.logic';
import pc from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.module.css';
import { PENCEGAHAN_DETAIL_TEXT as PDT, PENCEGAHAN_TEXT as PT } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.text';
import { LaporanRows } from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/LaporanRows';
import la from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/laporan.module.css';
import { PolsekRow } from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/PolsekRow';
import po from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.module.css';
import { POLSEK_TEXT as POT } from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.text';
import { LokasiRow } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/LokasiList';
import { toLokasi } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.logic';
import { BANK_SAMPAH_TEXT as BT } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.text';
import lk from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/lokasi.module.css';
import { DaftarTable } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarTable';
import df from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/daftar.module.css';
import { DAFTAR_TEXT as DT } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/daftar.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const count = (html: string, needle: string) => html.split(needle).length - 1;

/** Label aksi lengkap: span `.cta` dengan `data-text` sama persis dengan teksnya. */
const cta = (label: string) => `<span class="${r.cta}" data-text="${label}">${label}</span>`;

/** Ikon Tabler merender `class="tabler-icon tabler-icon-<nama> <className>"`: kelas kita selalu di ujung. */
const ICON_CHEVRON = `class="tabler-icon tabler-icon-chevron-right ${r.chevron}"`;

const PAGES = path.resolve(__dirname, '../../src/app/(public)/(pages)');

/** Selektor aturan yang menyalakan garis bawah saat :hover (aturan bersarang di @media ikut terbaca). */
function hoverUnderlineSelectors(rel: string): string[] {
  const css = readFileSync(path.join(PAGES, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector, body]) => selector.includes(':hover') && /text-decoration:\s*underline/.test(body))
    .map(([, selector]) => selector.trim());
}

describe('CSS jatah 86: garis bawah hover sudah diganti sapuan warna', () => {
  it.each([
    'pendidikan/info-sekolah/_com/info-sekolah.module.css',
    'inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css',
    'inovasi/kolaborasi-inovasi/_com/kolaborasi.module.css',
    'inovasi/layanan-online-desa/_com/informasi/informasi-redirect.module.css',
    'inovasi/layanan-online-desa/_com/layanan-online.module.css',
    'keamanan/pencegahan-kriminalitas/_com/pencegahan.module.css',
    'keamanan/pencegahan-kriminalitas/_com/detail/pencegahan-detail.module.css',
    'keamanan/laporan-publik/_com/laporan.module.css',
    'keamanan/polsek-terdekat/_com/polsek.module.css',
  ])('%s: tanpa text-decoration underline di aturan :hover', (rel) => {
    expect(hoverUnderlineSelectors(rel)).toEqual([]);
  });

  it('popup peta Leaflet Bank Sampah: "Petunjuk arah" tanpa garis bawah hover, pakai .cta + "›" .chevron', () => {
    expect(hoverUnderlineSelectors('lingkungan/pengelolaan-sampah-bank-sampah/_com/lokasi.module.css')).toEqual([]);
    // Popup dirender React (react-leaflet <Popup>); LokasiMap butuh Leaflet/DOM, jadi markup dicek dari sumber.
    const src = readFileSync(path.join(PAGES, 'lingkungan/pengelolaan-sampah-bank-sampah/_com/LokasiMap.tsx'), 'utf8');
    expect(src).toMatch(
      /<a\s+className=\{`\$\{x\.popupArah\} \$\{r\.trigger\}`\}[^>]*>\s*<span className=\{r\.cta\} data-text=\{T\.petunjukArah\}>\s*\{T\.petunjukArah\}\s*<\/span>\s*<span className=\{r\.chevron\} aria-hidden>\s*›\s*<\/span>\s*<\/a>/,
    );
  });

  it('tautan kembali (Daftar Informasi Publik [id], detail lembaga) tidak lagi bergaris bawah saat hover', () => {
    expect(hoverUnderlineSelectors('ppid/daftar-informasi-publik/_com/daftar.module.css')).toEqual([]);
    expect(hoverUnderlineSelectors('pendidikan/info-sekolah/_com/lembaga-detail/lembaga-detail.module.css')).toEqual([]);
  });
});

describe('Pendidikan', () => {
  it('Info Sekolah: "Lihat daftar pengajar" = label .cta + chevron, tautan = pemicu', () => {
    const html = render(<InfoSekolahSummary ringkasan={{ totalLembaga: 0, totalSiswa: 0, totalPengajar: 3, groups: [] }} />);
    expect(html).toContain(`class="${is.cardLink} ${r.trigger}"><span class="${r.cta}" data-text="${IST.pengajarLink}">`);
    expect(html).toContain(cta(IST.pengajarLink));
    expect(count(html, ICON_CHEVRON)).toBe(1);
    expect(html).not.toContain('nowrap');
  });
});

describe('Inovasi', () => {
  it('Ajukan Ide: "Kirim ide lain" dan tautan musyawarah = .cta + chevron "›"', () => {
    const thanks = render(<IdeThanks onAgain={() => {}} />);
    expect(thanks).toContain(`class="${ai.again} ${r.trigger}"`);
    expect(thanks).toContain(`${cta(AT.again)}<span class="${r.chevron}" aria-hidden="true">›</span>`);

    const links = render(<PengantarMusyawarah />);
    expect(count(links, `class="${ai.link} ${r.trigger}"`)).toBe(2);
    expect(links).toContain(cta('Dokumen Perencanaan'));
    expect(count(links, `<span class="${r.chevron}" aria-hidden="true">›</span>`)).toBe(2);
  });

  it('Kolaborasi: tombol buka-tutup = pemicu + label .cta; chevron bawah tidak ikut digeser', () => {
    const panjang = `<p>${'Kalimat panjang tentang kolaborasi desa. '.repeat(20)}</p>`;
    const item = toKolaborasi(
      { id: 'a', name: 'Kolaborasi a', tahun: 2025, slug: 'Ringkasan a', deskripsi: panjang, kolaborator: 'Mitra a' },
      (h) => h,
    );
    const html = render(<KolaborasiRow item={item} />);
    expect(html).toContain(`class="${ko.toggle} ${r.trigger}"`);
    expect(html).toContain(cta(KT.readMore));
    expect(html).not.toContain(r.chevron);
  });

  it('Layanan Online: ubin aksi tunggal = pemicu judul + aksi; ubin aksi ganda hanya aksinya', () => {
    const html = render(<LayananOnlineTiles onPengaduan={() => {}} />);
    expect(count(html, `<li class="${lo.tile} ${r.trigger}">`)).toBe(2);
    expect(count(html, `<li class="${lo.tile}">`)).toBe(1);
    expect(count(html, `<span class="${r.title}">`)).toBe(2);
    expect(html).toContain(`<h2 class="${lo.title}">${LT.informasi.title}</h2>`);
    expect(count(html, `class="${lo.action} ${lo.stretch} ${r.trigger}"`)).toBe(2);
    expect(count(html, `class="${lo.action} ${r.trigger}"`)).toBe(2);
    for (const label of [LT.administrasi.action, LT.pengaduan.action, LT.informasi.berita, LT.informasi.pengumuman]) {
      expect(html).toContain(cta(label));
    }
    expect(count(html, ICON_CHEVRON)).toBe(4);
  });

  it('pengalihan Informasi Desa: tautan cadangan = .cta + chevron "›"', () => {
    const html = render(<InformasiRedirectNotice kind="berita" />);
    expect(html).toContain(`class="${ir.link} ${r.trigger}"`);
    expect(html).toContain(`${cta('Lihat semua berita')}<span class="${r.chevron}" aria-hidden="true">›</span>`);
  });
});

// test-only: entri program pencegahan.
const program = (linkVideo: string) => ({
  id: 'p1',
  judul: 'Ronda Malam',
  deskripsiSingkat: '<p>Ringkasan</p>',
  deskripsi: '',
  linkVideo,
  createdAt: '2026-11-01T02:00:00.000Z',
});

describe('Keamanan', () => {
  it('Pencegahan sorotan: judul = tautan pemicu + span .title; "Baca selengkapnya" = .cta + chevron', () => {
    const html = render(<PencegahanSorotan item={toPencegahanItem(program('https://vimeo.com/1'))} />);
    expect(html).toContain(`<a href="/keamanan/pencegahan-kriminalitas/p1" class="${r.trigger}"><span class="${r.title}">Ronda Malam</span></a>`);
    expect(html).toContain(`class="${pc.more} ${r.trigger}"`);
    expect(html).toContain(cta(PT.selengkapnya));
    expect(count(html, ICON_CHEVRON)).toBe(1);
  });

  it('Pencegahan detail: kategori dan tautan video = .cta; ikon panah luar tidak digeser', () => {
    const html = render(<PencegahanDetailBody data={program('https://vimeo.com/1')} />);
    expect(html).toContain(`class="${d.kategori} ${r.trigger}"><span class="${r.cta}" data-text="${PDT.kategori}">`);
    expect(html).toContain(`class="${pd.videoLink} ${r.trigger}"><span class="${r.cta}" data-text="${PDT.bukaVideo}">`);
    expect(html).not.toContain(r.chevron);
  });

  it('Laporan Publik: baris = pemicu, judul ber-line-clamp membungkus span .title', () => {
    const items = [{ id: 'l1', judul: 'Lampu jalan padam', lokasi: 'Banjar Tengah', tanggalWaktu: '2026-11-01T02:00:00.000Z', status: 'Baru' }];
    const html = render(<LaporanRows items={items} loading={false} placeholderRows={3} />);
    expect(html).toContain(`class="${la.row} ${r.trigger}"`);
    expect(html).toContain(`<span class="${la.title}"><span class="${r.title}">Lampu jalan padam</span></span>`);
    expect(render(<LaporanRows items={[]} loading placeholderRows={3} />)).not.toContain(r.trigger);
  });

  it('Polsek: "Lihat di peta" = pemicu + label .cta (ikon peta di kiri tetap)', () => {
    const item = { id: 'x', nama: 'Polsek Mengwi', embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18' }; // test-only
    const html = render(<PolsekRow item={item} nearest={false} onMap={false} onShowOnMap={() => {}} />);
    expect(html).toContain(`class="${po.mapLink} ${r.trigger}"`);
    expect(html).toContain(cta(POT.showOnMap));
  });
});

describe('Lingkungan & PPID', () => {
  it('Bank Sampah: "Lihat detail" dan "Petunjuk arah" di daftar = .cta + chevron', () => {
    const item = toLokasi({ id: 'tps', name: 'TPS3R', alamat: 'Jl. Contoh', linkPetunjukArah: 'https://maps.example.test/x', lat: -8.5, lng: 115.2 });
    const html = render(<LokasiRow item={item} selected={false} onPick={() => {}} onDetail={() => {}} />);
    expect(html).toContain(`class="${lk.arah} ${lk.detail} ${r.trigger}"`);
    expect(html).toContain(`class="${lk.arah} ${r.trigger}"`);
    expect(html).toContain(cta(BT.detail));
    expect(html).toContain(cta(BT.petunjukArah));
    expect(count(html, ICON_CHEVRON)).toBe(2);
  });

  it('Daftar Informasi Publik: "Detail" tiap baris = pemicu + .cta + chevron', () => {
    const items = [
      { id: 'a1', jenisInformasi: 'Informasi Berkala', deskripsi: '<p>Isi</p>', tanggal: null },
      { id: 'b2', jenisInformasi: 'Informasi Serta Merta', deskripsi: '<p>Isi</p>', tanggal: null },
    ];
    const html = render(<DaftarTable items={items} page={1} />);
    expect(count(html, `class="${df.detailLink} ${r.trigger}"`)).toBe(2);
    expect(count(html, cta(DT.detail))).toBe(2);
    expect(count(html, ICON_CHEVRON)).toBe(2);
  });
});
