// @vitest-environment node
// Halaman Konservasi Adat Bali (dan Edukasi Lingkungan, kerangka bersama LingkunganProgramInfoPage): kepala Kabar tanpa
// cari, bagian bergaris program-info (h2 = judul CMS teks polos), istilah "X:" tebal, keadaan memuat/kosong/gagal.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (effect tidak jalan; useProgramInfo di-mock).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgramInfoEntry } from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.logic';
import type { ProgramInfoState } from '@/app/(public)/(pages)/pendidikan/_com/program-info/use-program-info';

const h = vi.hoisted(() => ({ state: { status: 'loading' } as unknown }));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
// DOMPurify butuh DOM; di node cukup tandai bahwa HTML lewat sanitizer.
vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => `<!--clean-->${html}` } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: { lingkungan: { edukasilingkungan: {}, konservasiadatbali: {} } } } }));
vi.mock('@/app/(public)/(pages)/pendidikan/_com/program-info/use-program-info', () => ({
  useProgramInfo: () => h.state,
}));

import EdukasiPage from '@/app/(public)/(pages)/lingkungan/edukasi-lingkungan/page';
import { EDUKASI_LINGKUNGAN_TEXT as TE } from '@/app/(public)/(pages)/lingkungan/edukasi-lingkungan/_com/edukasi-lingkungan.text';
import KonservasiPage from '@/app/(public)/(pages)/lingkungan/konservasi-adat-bali/page';
import { KONSERVASI_ADAT_BALI_TEXT as T } from '@/app/(public)/(pages)/lingkungan/konservasi-adat-bali/_com/konservasi-adat-bali.text';

const render = (ui: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;
const setState = (state: ProgramInfoState) => {
  h.state = state;
};

// Bentuk data stg: <ul><li><p>, judul CMS apa adanya (termasuk salah ketik "Karuna").
const FILOSOFI: ProgramInfoEntry = {
  key: 'filosofi',
  title: 'Filosofi Tri Hita Karuna',
  html: '<ul><li><p>Parahyangan: Hubungan manusia dengan Tuhan</p></li><li><p>Pawongan: Hubungan antar manusia</p></li></ul>',
  failed: false,
};
const NILAI: ProgramInfoEntry = {
  key: 'nilai',
  title: 'Nilai Konservasi Adat',
  html: '<ul><li><p>Menjaga keseimbangan ekosistem</p></li></ul>',
  failed: false,
};
const BENTUK: ProgramInfoEntry = {
  key: 'bentuk',
  title: 'Bentuk Konservasi Berdasarkan Adat',
  html: '<ul><li><p>Pelestarian Hutan Adat seperti Alas Pala Sangeh atau Wana Kerthi</p></li><li><p>Subak: Sistem irigasi tradisional</p></li></ul>',
  failed: false,
};
const READY: ProgramInfoState = { status: 'ready', entries: [FILOSOFI, NILAI, BENTUK] };

describe('Konservasi Adat Bali', () => {
  beforeEach(() => setState({ status: 'loading' }));

  it('kepala Kabar: tombol kembali, satu h1, satu kalimat pengantar, tanpa kolom cari & pil', () => {
    setState(READY);
    const html = render(<KonservasiPage />);
    expect(html).toContain('aria-label="Kembali ke halaman sebelumnya"');
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(`>${T.title}</h1>`);
    expect(html).toContain(T.lead);
    expect(html).not.toContain('<input');
    expect(html).not.toContain('aria-current="page"');
  });

  it('tiga bagian berurutan; h2 = judul CMS apa adanya', () => {
    setState(READY);
    const html = render(<KonservasiPage />);
    expect(count(html, '<section')).toBe(3);
    expect(html).toMatch(/<h2 id="program-info-filosofi"[^>]*>Filosofi Tri Hita Karuna<\/h2>/);
    expect(html).toMatch(/<h2 id="program-info-nilai"[^>]*>Nilai Konservasi Adat<\/h2>/);
    expect(html).toMatch(/<h2 id="program-info-bentuk"[^>]*>Bentuk Konservasi Berdasarkan Adat<\/h2>/);
    expect(html.indexOf('program-info-filosofi')).toBeLessThan(html.indexOf('program-info-nilai'));
    expect(html.indexOf('program-info-nilai')).toBeLessThan(html.indexOf('program-info-bentuk'));
  });

  it('butir "Istilah: keterangan" → istilah tebal; butir tanpa istilah utuh', () => {
    setState(READY);
    const html = render(<KonservasiPage />);
    expect(count(html, '<li')).toBe(5);
    expect(html).toMatch(/<strong[^>]*>Parahyangan:<\/strong> Hubungan manusia dengan Tuhan/);
    expect(html).toMatch(/<strong[^>]*>Subak:<\/strong> Sistem irigasi tradisional/);
    expect(html).toContain('>Pelestarian Hutan Adat seperti Alas Pala Sangeh atau Wana Kerthi</li>');
    expect(html).not.toContain('<p>Parahyangan');
  });

  it('judul CMS dirender sebagai teks polos (bukan HTML)', () => {
    setState({ status: 'ready', entries: [{ ...FILOSOFI, title: '<b>Filosofi</b>' }] });
    const html = render(<KonservasiPage />);
    expect(html).toContain('&lt;b&gt;Filosofi&lt;/b&gt;</h2>');
    expect(html).not.toContain('<b>Filosofi</b>');
  });

  it('tanpa kartu Paper lama maupun teks rata justify', () => {
    setState(READY);
    const html = render(<KonservasiPage />);
    expect(html).not.toContain('mantine-Paper-root');
    expect(html).not.toContain('text-align:justify');
  });

  it('memuat → kerangka role=status aria-busy, kepala tetap tampil', () => {
    const html = render(<KonservasiPage />);
    expect(html).toMatch(/role="status"[^>]*aria-label="Memuat informasi Konservasi Adat Bali"[^>]*aria-busy="true"/);
    expect(html).not.toContain('<section');
    expect(html).toContain(`>${T.title}</h1>`);
  });

  it('satu bagian gagal → pesan per bagian, bagian lain tetap tampil', () => {
    setState({ status: 'ready', entries: [{ ...FILOSOFI, title: T.sections.filosofi, html: null, failed: true }, NILAI, BENTUK] });
    const html = render(<KonservasiPage />);
    expect(count(html, '<section')).toBe(3);
    expect(html).toContain(`Informasi ${T.sections.filosofi} gagal dimuat. Coba muat ulang halaman.`);
    expect(html).toContain('Menjaga keseimbangan ekosistem');
  });

  it('semua gagal / semua kosong → satu kalimat halaman', () => {
    setState({ status: 'ready', entries: READY.entries.map((e) => ({ ...e, html: null, failed: true })) });
    let html = render(<KonservasiPage />);
    expect(html).toContain('Informasi Konservasi Adat Bali gagal dimuat. Coba muat ulang halaman.');
    expect(html).not.toContain('<section');

    setState({ status: 'ready', entries: READY.entries.map((e) => ({ ...e, html: '<p></p>' })) });
    html = render(<KonservasiPage />);
    expect(html).toContain('Informasi Konservasi Adat Bali belum tersedia.');
    expect(html).not.toContain('<section');
  });
});

describe('Edukasi Lingkungan', () => {
  it('kepala sendiri + tiga bagian CMS dalam kerangka yang sama', () => {
    setState({
      status: 'ready',
      entries: [
        { key: 'tujuan', title: 'Tujuan Edukasi Lingkungan', html: '<ul><li><p>Meningkatkan kesadaran masyarakat</p></li></ul>', failed: false },
        { key: 'materi', title: 'Materi Edukasi yang Diberikan', html: '<ul><li><p>Pengelolaan Sampah (Pilah sampah organik dan anorganik)</p></li></ul>', failed: false },
        { key: 'contoh', title: 'Contoh Kegiatan di Desa Darmasaba', html: '<ul><li><p>Gerakan Jumat Bersih rutin</p></li></ul>', failed: false },
      ],
    });
    const html = render(<EdukasiPage />);
    expect(html).toContain(`>${TE.title}</h1>`);
    expect(html).toContain(TE.lead);
    expect(html).not.toContain('<input');
    expect(count(html, '<section')).toBe(3);
    expect(html).toMatch(/<h2 id="program-info-materi"[^>]*>Materi Edukasi yang Diberikan<\/h2>/);
    expect(html).toContain('>Pengelolaan Sampah (Pilah sampah organik dan anorganik)</li>');
    expect(html).not.toContain('tabler-icon-leaf');
  });

  it('memuat → kerangka berlabel nama halaman', () => {
    setState({ status: 'loading' });
    expect(render(<EdukasiPage />)).toMatch(/aria-label="Memuat informasi Edukasi Lingkungan"/);
  });
});
