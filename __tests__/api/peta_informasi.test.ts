// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import searchExtraPages from '@/con/search-extra-pages';
import { flattenMenu } from '@/app/darmasaba/_com/searchMenu';
import {
  countPages,
  groupPetaInformasi,
  PETA_INFORMASI_HREF,
  petaInformasiGroups,
} from '@/app/darmasaba/(tambahan)/peta-informasi/_lib/petaInformasi';
import type { MenuItem } from '../../types/menu-item';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';

const ROOT = path.resolve(__dirname, '../..');
const PETA_DIR = path.join(ROOT, 'src/app/darmasaba/(tambahan)/peta-informasi');
const FOOTER = path.join(ROOT, 'src/app/darmasaba/_com/Footer.tsx');
const GLOBAL_SEARCH = path.join(ROOT, 'src/app/darmasaba/_com/globalSearch.tsx');

const read = (file: string) => readFileSync(file, 'utf8');
const hrefsOf = (groups: { pages: { href: string }[] }[]) => groups.flatMap((g) => g.pages.map((p) => p.href));

const FIXTURE: MenuItem[] = [
  { id: '1', name: 'Desa', children: [{ id: '1.1', name: 'Profil', href: '/d/profil' }] },
  { id: '2', name: 'Kesehatan', children: [{ id: '2.1', name: 'Posyandu', href: '/k/posyandu' }] },
  {
    id: 'x1',
    name: 'Desa',
    children: [
      { id: 'x1.1', name: 'Galeri Video', href: '/d/video' },
      { id: 'x1.2', name: 'Profil (ganda)', href: '/d/profil' },
    ],
  },
  { id: 'x2', name: 'Transparansi', children: [{ id: 'x2.1', name: 'APBDes', href: '/t/apbdes' }] },
  { id: 'x3', name: 'Informasi', children: [{ id: 'x3.1', name: 'Peta', href: PETA_INFORMASI_HREF }] },
]; // test-only

describe('groupPetaInformasi / petaInformasiGroups (fixture)', () => {
  it('grup senama digabung, urutan kemunculan pertama, href ganda dibuang', () => {
    const groups = petaInformasiGroups('', FIXTURE);
    expect(groups.map((g) => g.name)).toEqual(['Desa', 'Kesehatan', 'Transparansi']);
    expect(groups[0].pages.map((p) => p.label)).toEqual(['Profil', 'Galeri Video']);
  });

  it('halaman Peta Informasi sendiri dibuang dan grup yang jadi kosong tidak ikut', () => {
    const groups = groupPetaInformasi(flattenMenu(FIXTURE));
    expect(hrefsOf(groups)).not.toContain(PETA_INFORMASI_HREF);
    expect(groups.map((g) => g.name)).not.toContain('Informasi');
  });

  it('query saring memakai searchMenu: hanya yang cocok, tetap urutan config', () => {
    expect(hrefsOf(petaInformasiGroups('video', FIXTURE))).toEqual(['/d/video']);
    // "desa" cocok lewat nama menu utama → semua halaman grup Desa, urutan config
    expect(petaInformasiGroups('DESA', FIXTURE)).toEqual([
      { name: 'Desa', pages: petaInformasiGroups('', FIXTURE)[0].pages },
    ]);
  });

  it('query hanya spasi = semua; tidak ada yang cocok = []', () => {
    expect(petaInformasiGroups('   ', FIXTURE)).toEqual(petaInformasiGroups('', FIXTURE));
    expect(petaInformasiGroups('zzzqqq', FIXTURE)).toEqual([]);
    expect(petaInformasiGroups('peta', FIXTURE)).toEqual([]);
  });

  it('countPages menjumlah halaman semua grup', () => {
    expect(countPages(petaInformasiGroups('', FIXTURE))).toBe(4);
    expect(countPages([])).toBe(0);
  });
});

describe('Peta Informasi pada config nyata (navbar + search-extra-pages)', () => {
  const groups = petaInformasiGroups('');
  const expected = [...flattenMenu(navbarListMenu), ...flattenMenu(searchExtraPages)]
    .map((p) => p.href)
    .filter((href) => href !== PETA_INFORMASI_HREF);

  it('setiap href navbar + halaman tambahan (kecuali peta) muncul tepat sekali', () => {
    const hrefs = hrefsOf(groups);
    expect(hrefs.length).toBe(new Set(hrefs).size);
    expect([...hrefs].sort()).toEqual([...new Set(expected)].sort());
  });

  it('grup navbar dulu sesuai urutan navbar, lalu grup tambahan yang belum ada', () => {
    const navbarNames = navbarListMenu.map((m) => m.name);
    const extraOnly = searchExtraPages.map((m) => m.name).filter((n) => !navbarNames.includes(n) && n !== 'Informasi');
    expect(groups.map((g) => g.name)).toEqual([...navbarNames, ...extraOnly]);
  });

  it('"Desa" dan "Kesehatan" navbar digabung dengan halaman tambahan bernama sama', () => {
    const names = groups.map((g) => g.name);
    expect(names.filter((n) => n === 'Desa')).toHaveLength(1);
    expect(names.filter((n) => n === 'Kesehatan')).toHaveLength(1);
    const desa = groups.find((g) => g.name === 'Desa')!.pages.map((p) => p.href);
    expect(desa).toContain('/darmasaba/desa/profil');
    expect(desa).toContain('/darmasaba/desa/galery/video');
    const kesehatan = groups.find((g) => g.name === 'Kesehatan')!.pages.map((p) => p.href);
    expect(kesehatan).toContain('/darmasaba/kesehatan/data-kesehatan-warga/grafik-penyakit');
    // urutan di dalam grup gabungan: halaman navbar dulu, halaman tambahan sesudahnya
    expect(desa.indexOf('/darmasaba/desa/profil')).toBeLessThan(desa.indexOf('/darmasaba/desa/galery/video'));
  });

  it('saring "apbdes" hanya menampilkan APBDes di grup Transparansi', () => {
    expect(petaInformasiGroups('apbdes')).toEqual([
      { name: 'Transparansi', pages: [expect.objectContaining({ label: 'APBDes', href: '/darmasaba/apbdes' })] },
    ]);
  });
});

describe('route & pintu masuk Peta Informasi', () => {
  it('route /darmasaba/peta-informasi punya page.tsx nyata', () => {
    expect(PETA_INFORMASI_HREF).toBe('/darmasaba/peta-informasi');
    expect(matchesRealPage(PETA_INFORMASI_HREF, publicRoutes())).toBe(true);
  });

  it('page.tsx tipis merender komponen PetaInformasi', () => {
    const page = read(path.join(PETA_DIR, 'page.tsx'));
    expect(page).toMatch(/import PetaInformasi from '\.\/_com\/PetaInformasi'/);
    expect(page).toContain('<PetaInformasi />');
  });

  it('UI: H1, input saring berlabel, H2 per grup, <ul>/<li> + Link next-view-transitions', () => {
    const view = read(path.join(PETA_DIR, '_com/PetaInformasi.tsx'));
    expect(view).toMatch(/<Title order=\{1\}[^>]*>\s*Peta Informasi/);
    expect(view).toMatch(/label="Saring halaman"/);
    expect(view).toMatch(/petaInformasiGroups\(query\)/);
    expect(view).toContain('Tidak ada halaman yang cocok');
    const card = read(path.join(PETA_DIR, '_com/PetaInformasiGroupCard.tsx'));
    expect(card).toMatch(/<Title[^>]*order=\{2\}/);
    expect(card).toMatch(/component="ul"[\s\S]*component="li"/);
    expect(card).toMatch(/import \{ Link \} from 'next-view-transitions'/);
    expect(card).toMatch(/component=\{Link\} href=\{page\.href\}/);
  });

  it('search-extra-pages memuat entri Peta Informasi yang bisa dicari', () => {
    expect(flattenMenu(searchExtraPages)).toContainEqual(
      expect.objectContaining({ label: 'Peta Informasi (Semua Halaman)', parent: 'Informasi', href: PETA_INFORMASI_HREF }),
    );
  });

  it('footer grup "Tautan Penting" menautkan Peta Informasi', () => {
    const footer = read(FOOTER);
    const tautanPenting = footer.slice(footer.indexOf('const tautanPenting'), footer.indexOf('const linkGroups'));
    expect(tautanPenting).toMatch(/title: "Peta Informasi",\s*link: PETA_INFORMASI_HREF/);
    expect(footer).toMatch(/import \{ PETA_INFORMASI_HREF \} from '\.\.\/\(tambahan\)\/peta-informasi\/_lib\/petaInformasi'/);
  });

  it('dropdown pencarian: keadaan "Tidak ada hasil" punya tautan "Buka Peta Informasi"', () => {
    const src = read(GLOBAL_SEARCH);
    const empty = src.slice(src.indexOf('Tidak ada hasil'));
    expect(empty.slice(0, empty.indexOf('</Stack>'))).toMatch(
      /<Anchor href=\{PETA_INFORMASI_HREF\}[^\n]*handleSelectMenu\(e, PETA_INFORMASI_HREF\)\}>\s*Buka Peta Informasi\s*<\/Anchor>/,
    );
  });
});
