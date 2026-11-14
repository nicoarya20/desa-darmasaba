// @vitest-environment node
// Aturan pustaka Musik Desa (audit 2026-11-14): arti klik lagu, urutan rak, kunci URL, teks tepi.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';
import {
  artistInitials,
  deriveArtists,
  normalizeKey,
  playIntent,
  sortByTitle,
  toTrack,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';
import { MUSIK_TEXT as T } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.text';
import {
  jelajahiHref,
  resolveJelajahi,
  toJelajahiParams,
  withKnownKeys,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-jelajahi.logic';
import { EDGE_TOLERANCE, nextEdges } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/shelf-row.logic';

describe('playIntent', () => {
  it('lagu saat ini & bisa diputar → toggle', () => {
    expect(playIntent({ id: 'a', playable: true }, 'a')).toBe('toggle');
  });

  it('lagu lain, atau lagu tanpa audio (walau id sama) → play (diserahkan ke mesin)', () => {
    expect(playIntent({ id: 'b', playable: true }, 'a')).toBe('play');
    expect(playIntent({ id: 'a', playable: false }, 'a')).toBe('play');
    expect(playIntent({ id: 'a', playable: true }, null)).toBe('play');
  });
});

// test-only: lagu minimal; hanya judul (dan id) yang relevan untuk urutan.
const track = (id: string, judul: string | null) =>
  toTrack({ id, judul, artis: 'A', durasi: null, genre: null, tahunRilis: null, audioFile: null, coverImage: null } as unknown as Musik);

describe('sortByTitle (rak "Semua lagu")', () => {
  it('A–Z bahasa Indonesia tanpa beda huruf/aksen; masukan tidak diubah', () => {
    const input = [track('1', 'tari Pendet'), track('2', 'Ombak'), track('3', 'Ágem'), track('4', 'baleganjur')];
    expect(sortByTitle(input).map((t) => t.judul)).toEqual(['Ágem', 'baleganjur', 'Ombak', 'tari Pendet']);
    expect(input.map((t) => t.id)).toEqual(['1', '2', '3', '4']);
  });

  it('judul sama (beda huruf) → urutan asli (terbaru dulu) dipertahankan', () => {
    expect(sortByTitle([track('baru', 'Ombak'), track('lama', 'ombak')]).map((t) => t.id)).toEqual(['baru', 'lama']);
  });
});

describe('teks bebas admin', () => {
  it('lebar-nol (U+200B–U+200D, U+FEFF) dibuang dari kunci & teks tampil', () => {
    expect(normalizeKey('\u200BPop\u200C \u200D Bali\uFEFF')).toBe('pop bali');
    const t = track('z', '\uFEFFOmbak\u200B');
    expect(t.judul).toBe('Ombak');
    // Artis "Kadek" dan "Kadek\u200B" satu artis.
    const plain = toTrack({ ...t.source, id: 'p', artis: 'Kadek' });
    const zw = toTrack({ ...t.source, id: 'q', artis: 'Kadek\u200B' });
    expect(deriveArtists([plain, zw]).map((x) => [x.key, x.nama, x.jumlahLagu])).toEqual([['kadek', 'Kadek', 2]]);
  });

  it('judul kosong / spasi / lebar-nol saja → "Tanpa judul"', () => {
    expect(track('1', '').judul).toBe(T.tanpaJudul);
    expect(track('2', null).judul).toBe(T.tanpaJudul);
    expect(track('3', ' \u200B ').judul).toBe(T.tanpaJudul);
  });

  it('inisial per code point: aksara di luar BMP tidak terbelah', () => {
    expect(artistInitials('𝐊adek 𝐖ira')).toBe('𝐊𝐖');
    expect(artistInitials('Kadek Wira & Darmasaba Band')).toBe('KW');
  });
});

describe('toJelajahiParams (URL ditulis ulang dari filter yang berlaku)', () => {
  const genres = [{ key: 'pop', label: 'Pop', jumlahLagu: 1 }];
  const artists = [{ key: 'kadek', nama: 'Kadek', jumlahLagu: 1, coverUrl: null }];

  it('kunci genre/artis tak dikenal hilang; q dan kunci dikenal tetap', () => {
    const f = resolveJelajahi({ q: 'ombak', genre: 'rock', artis: 'kadek' }, genres, artists);
    expect(toJelajahiParams(f)).toEqual({ q: 'ombak', genre: null, artis: 'kadek' });
    expect(jelajahiHref(toJelajahiParams(f))).toBe('/musik/musik-desa/jelajahi?q=ombak&artis=kadek');
  });

  it('withKnownKeys: klik pil Pop saat URL ?genre=rock&artis=anonim&q=lagu → URL tanpa kunci sampah', () => {
    const change = withKnownKeys((p) => ({ ...p, genre: 'pop' }), genres, artists);
    expect(change({ q: 'lagu', genre: 'rock', artis: 'anonim' })).toEqual({ q: 'lagu', genre: 'pop', artis: null });
  });
});

describe('nextEdges (rak gulir)', () => {
  const at = (scrollLeft: number) => ({ scrollLeft, clientWidth: 500, scrollWidth: 1200 });

  it('kiri / tengah / kanan, dengan toleransi subpiksel', () => {
    const prev = { start: false, end: false };
    expect(nextEdges(prev, at(EDGE_TOLERANCE))).toEqual({ start: true, end: false });
    expect(nextEdges(prev, at(300))).toBe(prev);
    expect(nextEdges(prev, at(700 - EDGE_TOLERANCE))).toEqual({ start: false, end: true });
  });

  it('nilai tidak berubah → objek lama yang sama (setState tidak merender ulang)', () => {
    const prev = { start: true, end: false };
    expect(nextEdges(prev, at(0))).toBe(prev);
    expect(nextEdges(prev, at(1))).toBe(prev);
  });

  it('isi lebih sempit dari rak → dua ujung sekaligus', () => {
    expect(nextEdges({ start: false, end: false }, { scrollLeft: 0, clientWidth: 800, scrollWidth: 800 })).toEqual({
      start: true,
      end: true,
    });
  });
});

// Penjaga target sentuh ≤734px (WCAG 2.5.8 / pedoman 44px): dibaca dari berkas CSS sumber.
describe('CSS pustaka: target sentuh ≤734px', () => {
  const dir = path.join(process.cwd(), 'src/app/(public)/(pages)/musik/musik-desa/_com/library');
  const css = (f: string) => readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  /** Isi blok @media (max-width: 734px) terakhir (kurung kurawal seimbang). */
  const mobile = (src: string) => {
    const start = src.lastIndexOf('@media (max-width: 734px)');
    let depth = 0;
    for (let i = src.indexOf('{', start); i < src.length; i += 1) {
      if (src[i] === '{') depth += 1;
      if (src[i] === '}' && --depth === 0) return src.slice(src.indexOf('{', start) + 1, i);
    }
    return '';
  };
  /** Isi aturan yang daftar selektornya memuat `sel` persis (".pill" ≠ ".pills"). */
  const rule = (src: string, sel: string) =>
    [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) => m[1].split(',').map((x) => x.trim()).includes(sel))?.[2] ?? '';
  const px = (body: string, prop: string) => Number(body.match(new RegExp(`(?:^|[;\\s])${prop}:\\s*(-?\\d+)px`))?.[1]);

  it.each([
    ['jelajahi.module.css', ['.pill', '.chip', '.clear']],
    ['shelf-row.module.css', ['.more']],
  ])('%s: ::before memanjang ke 44px untuk %j', (file, selectors) => {
    const block = mobile(css(file));
    for (const sel of selectors) {
      expect(rule(block, sel)).toMatch(/position:\s*relative/);
      const hit = rule(block, `${sel}::before`);
      expect(hit).toMatch(/position:\s*absolute/);
      expect(hit).toContain('calc((100% - 44px) / 2)');
    }
  });

  it('chip kata kunci panjang: chip maks 100% lebar, label elipsis satu baris, ikon × tidak menyusut', () => {
    const src = css('jelajahi.module.css');
    expect(rule(src, '.chips')).toMatch(/max-width:\s*100%/);
    const chipBodies = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].trim() === '.chip').map((m) => m[2]);
    expect(chipBodies.join('')).toMatch(/max-width:\s*100%/);
    const label = rule(src, '.chipLabel');
    expect(label).toMatch(/text-overflow:\s*ellipsis/);
    expect(label).toMatch(/white-space:\s*nowrap/);
    expect(label).toMatch(/min-width:\s*0/);
    expect(rule(src, '.chip > svg')).toMatch(/flex:\s*none/);
  });

  it('pil genre 36px: ruang atas baris pil cukup untuk perluasan (44 − 36) / 2 tanpa terpotong overflow', () => {
    const src = css('jelajahi.module.css');
    const pill = px(rule(src, '.pill'), 'height');
    const pad = px(rule(mobile(src), '.pills'), 'padding-top');
    const bottom = Number(rule(src, '.pills').match(/padding:\s*0 \d+px (\d+)px/)?.[1]);
    expect(pad).toBeGreaterThanOrEqual((44 - pill) / 2);
    expect(bottom).toBeGreaterThanOrEqual((44 - pill) / 2);
  });
});
