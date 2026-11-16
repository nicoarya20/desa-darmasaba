// @vitest-environment node
// BUMDes publik: kerangka Kabar, profil gaya program-info (+ kontak Telepon/WhatsApp), ubin unit usaha, bagan pengurus
// dengan jabatan "Belum ditugaskan", SK & Dokumen tersembunyi saat kosong, profil pengurus tanpa data pribadi.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (effect tidak jalan).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'b1' }) }));
// Pemuat hanya dipanggil di effect (tidak jalan di SSR); ApiFetch tidak boleh tersentuh.
vi.mock('@/lib/api-fetch', () => ({ default: {} }));

import BumdesDetailPage from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/[id]/page';
import BumdesRoute from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/page';
import { toProfil, type GaleriFoto, type Profil, type UnitUsaha } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.logic';
import { BUMDES_TEXT as T, PENGURUS_DETAIL_TEXT as D } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.text';
import { PengurusDetailBody } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/detail/PengurusDetail';
import { DokumenBumdes } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/DokumenBumdes';
import { PengurusContent } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/PengurusBumdes';
import { ProfilBumdes } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/ProfilBumdes';
import { UnitUsahaBumdes } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/UnitUsahaBumdes';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { buildOrgTree, type OrgNode } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import type { StrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data';

const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const esc = (text: string) => text.replace(/&/g, '&amp;');

// test-only: profil stg 2026-11-16 (dipangkas, nomor fiktif).
const PROFIL: Profil = toProfil({
  nama: 'BUMDes Pudak Mesari Darmasaba',
  deskripsi: 'Paragraf pertama.\nParagraf kedua.',
  alamat: 'Jalan Tanah Putih, Darmasaba',
  kontak: '0812 3456 7890',
  tahunBerdiri: 2017,
  image: null,
});
const ready = <T,>(data: T): LoadState<T> => ({ status: 'ready', data });
const FOTO: GaleriFoto[] = [
  { id: 'f1', keterangan: 'Kantor BUMDes', image: { link: '/api/img/f1.webp' } },
  { id: 'f2', keterangan: null, image: { link: '/api/img/f2.webp' } },
];

describe('ProfilBumdes', () => {
  it('memuat → blok berdenyut; galat ≠ kosong', () => {
    expect(render(<ProfilBumdes profil={{ status: 'loading' }} galeri={{ status: 'loading' }} />)).toContain(
      `aria-busy="true" aria-label="${T.profil.loading}"`,
    );
    expect(render(<ProfilBumdes profil={{ status: 'error' }} galeri={ready([])} />)).toContain(T.profil.error);
    const empty = render(<ProfilBumdes profil={ready(null)} galeri={ready([])} />);
    expect(empty).toContain(T.profil.empty);
    expect(empty).not.toContain(T.profil.error);
  });

  it('terisi: nama (h2), paragraf, fakta, nomor + tombol Telepon (tel:) & WhatsApp (tab baru), galeri', () => {
    const html = render(<ProfilBumdes profil={ready(PROFIL)} galeri={ready(FOTO)} />);
    expect(html).toMatch(/<h2[^>]*>BUMDes Pudak Mesari Darmasaba<\/h2>/);
    expect(html).toContain('<p>Paragraf pertama.</p><p>Paragraf kedua.</p>');
    expect(html).toContain('Tahun 2017');
    expect(html).toContain('Jalan Tanah Putih, Darmasaba');
    expect(html).toContain('href="tel:+6281234567890"');
    expect(html).toMatch(/href="https:\/\/wa\.me\/6281234567890" target="_blank" rel="noopener noreferrer"/);
    expect(count(html, 'data-testid="galeri-foto-item"')).toBe(2);
    expect(html).toContain(`alt="Foto ${PROFIL.nama} 2"`);
  });

  it('kontak bukan nomor → baris "Kontak" teks, tanpa tombol; galeri galat/kosong tidak dirender', () => {
    const profil = { ...PROFIL, phone: null, kontakText: 'bumdes@example.test', tahunBerdiri: null };
    const html = render(<ProfilBumdes profil={ready(profil)} galeri={{ status: 'error' }} />);
    expect(html).toContain('<dt>Kontak</dt><dd>bumdes@example.test</dd>');
    expect(html).not.toContain('tel:');
    expect(html).not.toContain('Tahun');
    expect(html).not.toContain(T.galeri.title);
  });
});

describe('UnitUsahaBumdes', () => {
  const UNITS: UnitUsaha[] = [
    { id: 'u1', nama: 'Kios Sembako', deskripsi: 'Baris satu\nBaris dua', image: '/api/img/u1.webp' },
    { id: 'u2', nama: 'Pengelolaan Air', deskripsi: '', image: null },
  ];

  it('memuat → ubin berdenyut; kosong & galat → satu kotak kalimat berbeda', () => {
    expect(render(<UnitUsahaBumdes state={{ status: 'loading' }} />)).toContain(`aria-busy="true" aria-label="${T.unitUsaha.loading}"`);
    expect(render(<UnitUsahaBumdes state={ready([])} />)).toContain(T.unitUsaha.empty);
    expect(render(<UnitUsahaBumdes state={{ status: 'error' }} />)).toContain(T.unitUsaha.error);
  });

  it('ubin per unit tanpa tautan: foto atau ikon, nama, deskripsi', () => {
    const html = render(<UnitUsahaBumdes state={ready(UNITS)} />);
    expect(html).toContain(`aria-label="${T.unitUsaha.listLabel}"`);
    expect(count(html, '<article')).toBe(2);
    expect(html).not.toContain('<a ');
    expect(html).toContain('src="/api/img/u1.webp"');
    expect(html).toContain('Baris satu\nBaris dua');
    expect(html).toMatch(/<h3[^>]*>Pengelolaan Air<\/h3>/);
  });
});

describe('PengurusContent (bagan)', () => {
  const data = (over: Partial<StrukturData>): StrukturData =>
    ({ loading: false, failed: false, tree: [], visible: [], search: '', setSearch: () => {}, query: '', reload: async () => {}, ...over }) as StrukturData;
  const vacantTree: OrgNode[] = buildOrgTree(
    [],
    [
      { id: 'musdes', nama: 'Musyawarah Desa', hierarki: 1 },
      { id: 'dir', nama: 'Direktur', hierarki: 2, parentId: 'musdes' },
    ],
    { showVacant: true },
  );

  it('memuat → kerangka bagan', () => {
    expect(render(<PengurusContent data={data({ loading: true })} />)).toContain('aria-label="Memuat struktur organisasi…"');
  });

  it('galat → pesan + "Muat ulang"; kosong sungguhan → satu kalimat TANPA tombol', () => {
    const failed = render(<PengurusContent data={data({ failed: true })} />);
    expect(failed).toContain(T.pengurus.error);
    expect(failed).toContain(T.pengurus.reload);
    const empty = render(<PengurusContent data={data({})} />);
    expect(empty).toContain(T.pengurus.empty);
    expect(empty).not.toContain('<button');
  });

  it('jabatan tanpa pengurus tampil "Belum ditugaskan" (tanpa tautan)', () => {
    const html = render(<PengurusContent data={data({ tree: vacantTree, visible: vacantTree })} />);
    expect(html).toContain(`aria-label="${T.pengurus.chartLabel}"`);
    expect(count(html, 'data-vacant')).toBe(2);
    expect(count(html, 'Belum ditugaskan')).toBe(2);
    expect(html).not.toContain('<a ');
  });

  it('kata kunci tanpa hasil → kalimat tidak cocok', () => {
    expect(render(<PengurusContent data={data({ tree: vacantTree, visible: [], query: 'zz' })} />)).toContain('zz');
  });
});

describe('DokumenBumdes', () => {
  it('kosong → tidak dirender sama sekali', () => {
    expect(renderToStaticMarkup(<DokumenBumdes items={[]} />)).toBe('');
  });

  it('berisi → judul bagian + baris "Unduh" tab baru', () => {
    const html = renderToStaticMarkup(
      <DokumenBumdes items={[{ id: 'd1', judul: 'SK Pengurus 2024', keterangan: 'No. 1/2024', href: '/api/file/sk.pdf' }]} />,
    );
    expect(html).toContain(esc(T.dokumen.title));
    expect(html).toContain('href="/api/file/sk.pdf" target="_blank"');
    expect(html).toContain(`aria-label="${T.dokumen.unduhLabel('SK Pengurus 2024')}"`);
  });
});

describe('profil pengurus BUMDes', () => {
  it('hanya nama, jabatan, foto (atau inisial); tanpa email/telepon/alamat', () => {
    const withPhoto = render(<PengurusDetailBody detail={{ nama: 'Ni Kadek Ayu, S.E.', jabatan: 'Direktur', foto: '/f.webp', initials: 'NA' }} />);
    expect(withPhoto).toMatch(/<h1[^>]*>Ni Kadek Ayu, S\.E\.<\/h1>/);
    expect(withPhoto).toContain('Direktur');
    expect(withPhoto).toContain(`alt="${D.fotoAlt('Ni Kadek Ayu, S.E.')}"`);
    for (const hidden of ['Email', 'Telepon', 'Alamat', 'Tanggal Masuk', 'Status']) expect(withPhoto).not.toContain(hidden);
    const initials = render(<PengurusDetailBody detail={{ nama: 'Ni Kadek Ayu', jabatan: null, foto: null, initials: 'NA' }} />);
    expect(initials).toContain('data-initials');
    expect(initials).toContain('>NA</span>');
  });

  it('halaman [id] sebelum data tiba: "‹ BUMDes" + kerangka berlabel', () => {
    const html = render(<BumdesDetailPage />);
    expect(html).toContain('href="/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes"');
    expect(html).toContain(D.kembali);
    expect(html).toContain(`aria-label="${D.loading}"`);
  });
});

describe('halaman BUMDes', () => {
  it('kerangka Kabar: h1 + pengantar, tiga bagian memuat, SK & Dokumen belum dirender', () => {
    const html = render(<BumdesRoute />);
    expect(html).toMatch(/<h1[^>]*>BUMDes<\/h1>/);
    expect(html).toContain(T.lead);
    expect(html).toContain(`aria-label="${T.profil.loading}"`);
    expect(html).toContain(`aria-label="${T.unitUsaha.loading}"`);
    expect(html).toContain('aria-label="Memuat struktur organisasi…"');
    expect(html).toContain('id="pengurus"');
    expect(html).not.toContain(esc(T.dokumen.title));
    expect(html).not.toContain('type="search"');
  });
});
