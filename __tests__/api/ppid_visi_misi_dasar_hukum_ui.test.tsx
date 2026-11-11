// @vitest-environment node
// Halaman Visi Misi PPID (satu kartu terpusat: lambang, moto, visi, misi bernomor) dan Dasar Hukum (bagian rata kiri tanpa kartu).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup; aturan tampilan dibaca dari CSS module.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// test-only: isi fiktif berbentuk respons find-by-id.
const MISI_HTML = '<ol><li>Misi uji satu.</li><li>Misi uji dua.</li></ol>';
// test-only: misi yang bukan satu daftar teks polos (paragraf) → harus dirender apa adanya.
const MISI_RICH_HTML = '<p>Misi uji berbentuk <strong>paragraf</strong>.</p>';
const DASAR_HTML = '<ul><li>UU Uji Nomor 1 tentang Keterbukaan Uji</li><li>PP Uji Nomor 2</li></ul>';
// test-only: isi yang bukan satu daftar teks polos (ada tautan) → harus dirender apa adanya.
const DASAR_RICH_HTML = '<p>Lihat <a href="https://contoh.test">tautan uji</a>.</p>';

const visiMisi = vi.hoisted(() => ({ findById: { data: null as unknown, loading: false, load: vi.fn() } }));
const dasarHukum = vi.hoisted(() => ({ findById: { data: null as unknown, loading: false, load: vi.fn() } }));

vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID', () => ({ default: visiMisi }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum', () => ({ default: dasarHukum }));

import VisiMisiPage from '@/app/darmasaba/(pages)/ppid/visi-misi-ppid/page';
import DasarHukumPage from '@/app/darmasaba/(pages)/ppid/dasar-hukum/page';

const PPID_DIR = path.join(process.cwd(), 'src/app/darmasaba/(pages)/ppid');
const css = readFileSync(path.join(PPID_DIR, '_com/ppid-sections.module.css'), 'utf8');
const visiMisiCss = readFileSync(path.join(PPID_DIR, 'visi-misi-ppid/_com/visi-misi.module.css'), 'utf8');
const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;

beforeEach(() => {
  visiMisi.findById.data = { id: '1', visi: 'Visi uji.', misi: MISI_HTML };
  dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_HTML };
});

describe('Visi dan Misi PPID', () => {
  it('satu h1 + pengantar tetap ada, tetapi hanya untuk pembaca layar (judul tampak ada di kartu)', () => {
    const html = render(<VisiMisiPage />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toMatch(/<div class="[^"]*VisuallyHidden[^"]*">(?:(?!<\/header>).)*<h1[^>]*>Visi dan Misi PPID<\/h1>/);
    expect(html).toContain('Arah dan komitmen Pejabat Pengelola Informasi dan Dokumentasi');
  });

  it('satu kartu berisi tiga bagian h2 berurutan: moto, visi, misi', () => {
    const html = render(<VisiMisiPage />);
    const idx = ['Moto PPID Desa Darmasaba', 'Visi PPID', 'Misi PPID'].map((t) => html.indexOf(`>${t}</h2>`));
    idx.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(count(html, '<section')).toBe(3);
    expect(count(html, /class="[^"]*_card_/)).toBe(1);
    expect(html.indexOf('_card_')).toBeLessThan(idx[0]);
  });

  it('lambang desa di atas judul moto, dengan teks alternatif', () => {
    const html = render(<VisiMisiPage />);
    expect(count(html, '<img')).toBe(1);
    expect(html).toMatch(/<img[^>]*src="\/darmasaba-icon\.png"[^>]*alt="Logo Desa Darmasaba"/);
    expect(html.indexOf('<img')).toBeLessThan(html.indexOf('>Moto PPID Desa Darmasaba</h2>'));
  });

  it('moto ditulis sebagai satu kalimat utuh (tanda kutip hanya hiasan CSS)', () => {
    const html = render(<VisiMisiPage />);
    expect(html).toMatch(/<p class="[^"]*_motoText_[^"]*">Memberikan informasi yang cepat, mudah, tepat, dan transparan<\/p>/);
  });

  it('dua pemisah berornamen di antara tiga bagian, disembunyikan dari pembaca layar', () => {
    const html = render(<VisiMisiPage />);
    expect(count(html, /<div class="[^"]*_ornament_[^"]*" aria-hidden="true">/)).toBe(2);
  });

  it('visi dari CMS dirender apa adanya', () => {
    const html = render(<VisiMisiPage />);
    expect(html).toMatch(/<div class="[^"]*_visiText_[^"]*">Visi uji\.<\/div>/);
  });

  it('misi berupa daftar → butir bernomor dalam <ol>, lencana angka disembunyikan dari pembaca layar', () => {
    const html = render(<VisiMisiPage />);
    expect(count(html, '<ol')).toBe(1);
    expect(count(html, '_misiItem_')).toBe(2);
    expect(html).toMatch(/<span class="[^"]*_misiNumber_[^"]*" aria-hidden="true">1<\/span><p class="[^"]*_misiBody_[^"]*">Misi uji satu\.<\/p>/);
    expect(html).toMatch(/aria-hidden="true">2<\/span><p[^>]*>Misi uji dua\.<\/p>/);
  });

  it('misi yang bukan daftar teks polos dirender apa adanya', () => {
    visiMisi.findById.data = { id: '1', visi: 'Visi uji.', misi: MISI_RICH_HTML };
    const html = render(<VisiMisiPage />);
    expect(html).toContain(MISI_RICH_HTML);
    expect(count(html, '_misiItem_')).toBe(0);
  });

  it('data belum ada → kerangka memuat, h1 tetap ada, kartu belum digambar', () => {
    visiMisi.findById.data = null;
    const html = render(<VisiMisiPage />);
    expect(html).toContain('role="status" aria-label="Memuat visi dan misi…"');
    expect(html).toMatch(/<h1[^>]*>Visi dan Misi PPID<\/h1>/);
    expect(count(html, '<section')).toBe(0);
    expect(html).not.toContain('<img');
  });
});

describe('Dasar Hukum PPID', () => {
  it('kepala bersama: satu h1 + pengantar, tanpa ikon di atas judul', () => {
    const html = render(<DasarHukumPage />);
    expect(html).toMatch(/<h1[^>]*>Dasar Hukum<\/h1>/);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain('Peraturan dan kebijakan resmi');
    expect(html).not.toContain('tabler-icon-book');
  });

  it('subjudul CMS jadi label h2 (isi tidak diubah)', () => {
    const html = render(<DasarHukumPage />);
    expect(html).toMatch(/<h2 id="ppid-dasar-hukum" class="[^"]*_sectionLabel_[^"]*">JUDUL UJI PPID<\/h2>/);
    expect(html).toContain('aria-labelledby="ppid-dasar-hukum"');
  });

  it('daftar peraturan jadi <ol>: penanda dan perihal terpisah, "tentang" hanya untuk pembaca layar', () => {
    const html = render(<DasarHukumPage />);
    expect(count(html, '<ol')).toBe(1);
    expect(count(html, '<li')).toBe(2);
    expect(html).toMatch(/<span class="[^"]*_nomor_[^"]*">UU Uji Nomor 1<\/span>/);
    expect(html).toMatch(/<span class="[^"]*_perihal_[^"]*"><span[^>]*VisuallyHidden[^>]*> tentang <\/span>Keterbukaan Uji<\/span>/);
    expect(html).toMatch(/<span class="[^"]*_nomor_[^"]*">PP Uji Nomor 2<\/span><\/div>/);
    expect(count(html, '_perihal_')).toBe(1);
  });

  it('isi CMS yang bukan daftar teks polos dirender apa adanya', () => {
    dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_RICH_HTML };
    const html = render(<DasarHukumPage />);
    expect(html).toContain(DASAR_RICH_HTML);
    expect(count(html, '<ol')).toBe(0);
  });

  it('tanpa kartu kaca, tanpa teks tengah/justify', () => {
    const html = render(<DasarHukumPage />);
    expect(html).not.toContain('mantine-Paper-root');
    expect(html).not.toMatch(/backdrop-filter|text-align:\s*(center|justify)/);
  });

  it('data belum ada → kerangka memuat', () => {
    dasarHukum.findById.data = null;
    const html = render(<DasarHukumPage />);
    expect(html).toContain('role="status" aria-label="Memuat dasar hukum…"');
    expect(count(html, '<section')).toBe(0);
  });
});

describe('Gaya Visi dan Misi PPID (visi-misi.module.css)', () => {
  it('kartu terang terpusat: latar dari --vm-card, sudut bulat, bayangan lembut', () => {
    expect(visiMisiCss).toMatch(/\.card\s*\{[^}]*align-items:\s*center;[^}]*border-radius:\s*32px;[^}]*background:\s*var\(--vm-card\);[^}]*box-shadow:/);
  });

  it('judul dan kalimat pendek rata tengah; butir misi rata kiri di kolom baca terpusat', () => {
    expect(visiMisiCss).toMatch(/\.section\s*\{[^}]*text-align:\s*center/);
    expect(visiMisiCss).toMatch(/\.misiList\s*\{[^}]*max-width:\s*var\(--vm-measure\);[^}]*text-align:\s*left/);
    expect(visiMisiCss).toMatch(/\.misiRich\s*\{[^}]*text-align:\s*left/);
  });

  it('tanpa justify, gradasi, kaca, atau huruf kapital paksa', () => {
    expect(visiMisiCss).not.toMatch(/text-align:\s*justify|text-transform|gradient|backdrop-filter/);
  });

  it('pemisah = garis pendek di kiri-kanan ornamen, bukan garis selebar kartu', () => {
    expect(visiMisiCss).toMatch(/\.ornament::before,\s*\.ornament::after\s*\{[^}]*flex:\s*0 1 140px/);
  });

  it('lencana angka misi bulat berlatar brand', () => {
    expect(visiMisiCss).toMatch(/\.misiNumber\s*\{[^}]*border-radius:\s*50%;[^}]*background:\s*var\(--brand\)/);
  });

  it('≤734px: kartu, lambang, dan huruf mengecil', () => {
    expect(visiMisiCss).toMatch(/@media \(max-width: 734px\)\s*\{\s*\.card\s*\{[^}]*padding:\s*36px 20px 40px/);
    expect(visiMisiCss).toMatch(/@media \(max-width: 734px\)[\s\S]*\.logo\s*\{[^}]*width:\s*84px/);
  });
});

describe('Gaya isi teks PPID (ppid-sections.module.css)', () => {
  it('semua rata kiri, tanpa latar kartu, bayangan, gradasi, atau huruf kapital paksa', () => {
    expect(css).not.toMatch(/text-align|text-transform|box-shadow|gradient|background:\s*(#fff|white)/);
  });

  it('daftar <ol> bernomor lewat counter, <ul> bertitik, antarbaris garis tipis', () => {
    expect(css).toMatch(/\.body ol > li::before\s*\{[^}]*content:\s*counter\(ppid-item\)/);
    expect(css).toMatch(/\.body ul > li::before\s*\{[^}]*border-radius:\s*50%/);
    expect(css).toMatch(/\.body li\s*\{[^}]*border-top:\s*1px solid var\(--ppid-rule\)/);
  });

  it('lebar isi dan kerangka memuat mengikuti token --ppid-measure dari kerangka halaman, tanpa angka sendiri', () => {
    expect(css).toMatch(/\.sections\s*\{[^}]*max-width:\s*var\(--ppid-measure\)/);
    expect(css).toMatch(/\.skeleton\s*\{[^}]*max-width:\s*var\(--ppid-measure\)/);
    // Hanya deklarasi properti (awal baris); `@media (max-width: …)` bukan batas lebar isi.
    expect(css).not.toMatch(/^\s*max-width:\s*\d/m);
  });

  it('label kiri + isi kanan di desktop, satu kolom di ≤734px', () => {
    expect(css).toMatch(/\.section\s*\{[^}]*grid-template-columns:\s*220px minmax\(0, 1fr\)/);
    expect(css).toMatch(/@media \(max-width: 734px\)\s*\{\s*\.section\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  });
});
