// @vitest-environment node
// Pustaka Musik Desa: adapter Musik → Track, turunan artis & genre, saring Jelajahi dari URL.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';
import {
  artistInitials,
  deriveArtists,
  deriveGenres,
  formatDurasi,
  normalizeKey,
  toTrack,
  withGenreLabels,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';
import {
  filterTracks,
  hasActiveFilter,
  jelajahiHref,
  parseJelajahiParams,
  resolveJelajahi,
  visibleArtists,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-jelajahi.logic';
import { COVER_GRADIENTS, COVER_TONES, GENRE_COLORS, hashSeed, pickFromPalette } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-palette';

// test-only: bentuk Musik dari API.
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'x', link });
const musik = (over: Partial<Musik> = {}): Musik => ({
  id: 'm1',
  judul: 'Tari Pendet',
  artis: 'Sekaa Gong Darmasaba',
  deskripsi: null,
  durasi: '05:18',
  genre: 'Gamelan Tradisional',
  tahunRilis: 2024,
  audioFile: file('/api/a.mp3'),
  coverImage: file('/api/c.jpg'),
  isActive: true,
  ...over,
});
const search = (q: string) => new URLSearchParams(q);

describe('formatDurasi', () => {
  it.each([
    ['05:18', '5:18'],
    ['5:07', '5:07'],
    ['00:45', '0:45'],
    ['1:02:03', '1:02:03'],
    [' 12:00 ', '12:00'],
  ])('%s → %s', (raw, out) => expect(formatDurasi(raw)).toBe(out));

  it.each(['', '   ', 'abc', '5', '5:60', '1:60:00', '00:00', '5.18'])('tak terbaca/kosong %j → null', (raw) =>
    expect(formatDurasi(raw)).toBeNull(),
  );

  it('null/undefined → null', () => {
    expect(formatDurasi(null)).toBeNull();
    expect(formatDurasi(undefined)).toBeNull();
  });
});

describe('toTrack', () => {
  it('memetakan semua field, kunci huruf kecil dan spasi rapi', () => {
    const m = musik({ artis: '  Kadek   Wira ', genre: ' Pop  Bali ' });
    expect(toTrack(m)).toEqual({
      id: 'm1',
      judul: 'Tari Pendet',
      artis: 'Kadek Wira',
      artisKey: 'kadek wira',
      genre: 'Pop Bali',
      genreKey: 'pop bali',
      tahun: 2024,
      durasi: '5:18',
      coverUrl: '/api/c.jpg',
      playable: true,
      source: m,
    });
  });

  it('tanpa sampul, audio, genre, tahun → null / tidak bisa diputar', () => {
    const t = toTrack(musik({ coverImage: null, audioFile: null, genre: null, tahunRilis: null, durasi: '' }));
    expect(t).toMatchObject({ coverUrl: null, playable: false, genre: null, genreKey: null, tahun: null, durasi: null });
  });

  it('link kosong dianggap tidak ada; genre spasi saja → null', () => {
    const t = toTrack(musik({ coverImage: file(''), audioFile: file(''), genre: '   ' }));
    expect(t).toMatchObject({ coverUrl: null, playable: false, genre: null, genreKey: null });
  });
});

describe('deriveGenres', () => {
  it('"Pop" dan "pop" satu kunci; label tulisan pertama, huruf awal kapital; terbanyak dulu', () => {
    const tracks = [
      musik({ id: 'a', genre: 'pop' }),
      musik({ id: 'b', genre: 'Pop' }),
      musik({ id: 'c', genre: 'jazz' }),
      musik({ id: 'd', genre: null }),
    ].map(toTrack);
    expect(deriveGenres(tracks)).toEqual([
      { key: 'pop', label: 'Pop', jumlahLagu: 2 },
      { key: 'jazz', label: 'Jazz', jumlahLagu: 1 },
    ]);
  });

  it('jumlah sama → urut label A-Z', () => {
    const tracks = [musik({ id: 'a', genre: 'Pop Bali' }), musik({ id: 'b', genre: 'Jazz' })].map(toTrack);
    expect(deriveGenres(tracks).map((g) => g.label)).toEqual(['Jazz', 'Pop Bali']);
  });
});

describe('withGenreLabels', () => {
  it('teks genre tiap lagu diganti label turunan ("pop" → "Pop"); tanpa genre dibiarkan', () => {
    const raw = [
      musik({ id: 'a', genre: 'Pop' }),
      musik({ id: 'b', genre: 'pop' }),
      musik({ id: 'c', genre: 'POP ' }),
      musik({ id: 'd', genre: null }),
    ].map(toTrack);
    const tracks = withGenreLabels(raw, deriveGenres(raw));
    expect(tracks.map((t) => t.genre)).toEqual(['Pop', 'Pop', 'Pop', null]);
    expect(tracks.map((t) => t.genreKey)).toEqual(['pop', 'pop', 'pop', null]);
    expect(tracks[0]).toBe(raw[0]); // sudah sama → objek tidak disalin
  });
});

describe('deriveArtists', () => {
  it('kolaborasi satu artis apa adanya; nama beda huruf digabung; sampul = lagu terbaru bersampul', () => {
    const tracks = [
      musik({ id: 'a', artis: 'Kadek Wira & Darmasaba Band', coverImage: null }),
      musik({ id: 'b', artis: 'kadek wira & darmasaba band', coverImage: file('/api/b.jpg') }),
      musik({ id: 'c', artis: 'Kadek Wira', coverImage: file('/api/c.jpg') }),
    ].map(toTrack);
    expect(deriveArtists(tracks)).toEqual([
      { key: 'kadek wira & darmasaba band', nama: 'Kadek Wira & Darmasaba Band', jumlahLagu: 2, coverUrl: '/api/b.jpg' },
      { key: 'kadek wira', nama: 'Kadek Wira', jumlahLagu: 1, coverUrl: '/api/c.jpg' },
    ]);
  });

  it('artis kosong dilewati; semua tanpa sampul → coverUrl null', () => {
    const tracks = [musik({ id: 'a', artis: '  ' }), musik({ id: 'b', artis: 'Ayu', coverImage: null })].map(toTrack);
    expect(deriveArtists(tracks)).toEqual([{ key: 'ayu', nama: 'Ayu', jumlahLagu: 1, coverUrl: null }]);
  });

  it('inisial dua kata pertama yang diawali huruf/angka', () => {
    expect(artistInitials('Kadek Wira & Darmasaba Band')).toBe('KW');
    expect(artistInitials('ayu')).toBe('A');
    expect(artistInitials('&')).toBe('?');
  });
});

describe('Jelajahi: params URL', () => {
  it('dibaca dan dinormalkan; kosong → null', () => {
    expect(parseJelajahiParams(search('q=%20tari%20&genre=POP&artis=Kadek%20%20Wira'))).toEqual({
      q: 'tari',
      genre: 'pop',
      artis: 'kadek wira',
    });
    expect(parseJelajahiParams(search(''))).toEqual({ q: '', genre: null, artis: null });
  });

  it('href menulis hanya nilai terisi, kunci ber-encode', () => {
    expect(jelajahiHref({})).toBe('/musik/musik-desa/jelajahi');
    expect(jelajahiHref({ q: 'tari bali', genre: 'pop', artis: 'kadek wira & band' })).toBe(
      '/musik/musik-desa/jelajahi?q=tari+bali&genre=pop&artis=kadek+wira+%26+band',
    );
    const round = parseJelajahiParams(new URL(`http://x${jelajahiHref({ artis: 'kadek wira & band' })}`).searchParams);
    expect(round.artis).toBe('kadek wira & band');
  });
});

describe('Jelajahi: saring', () => {
  const tracks = [
    musik({ id: 'a', judul: 'Tari Pendet', artis: 'Sekaa Gong', genre: 'Gamelan' }),
    musik({ id: 'b', judul: 'Senja di Sawah', artis: 'Kadek Wira', genre: 'Pop' }),
    musik({ id: 'c', judul: 'Tari Baris', artis: 'Kadek Wira', genre: 'pop' }),
  ].map(toTrack);
  const genres = deriveGenres(tracks);
  const artists = deriveArtists(tracks);
  const run = (q: string) => filterTracks(tracks, resolveJelajahi(parseJelajahiParams(search(q)), genres, artists));
  const ids = (q: string) => run(q).map((t) => t.id);

  it('tanpa filter → semua, urutan pustaka', () => {
    expect(ids('')).toEqual(['a', 'b', 'c']);
  });

  it('q tanpa beda huruf, semua kata harus muncul di judul/artis/genre', () => {
    expect(ids('q=TARI')).toEqual(['a', 'c']);
    expect(ids('q=tari kadek')).toEqual(['c']);
    expect(ids('q=pop')).toEqual(['b', 'c']);
    expect(ids('q=tari zzz')).toEqual([]);
  });

  it('genre (tanpa beda huruf) + artis + q digabung (AND)', () => {
    expect(ids('genre=Pop')).toEqual(['b', 'c']);
    expect(ids('genre=pop&artis=kadek%20wira&q=baris')).toEqual(['c']);
    expect(ids('genre=gamelan&artis=kadek%20wira')).toEqual([]);
  });

  it('kunci genre/artis tak dikenal diabaikan (bukan mengosongkan hasil)', () => {
    const f = resolveJelajahi(parseJelajahiParams(search('genre=rock&artis=anonim')), genres, artists);
    expect(f).toEqual({ q: '', genre: null, artis: null });
    expect(hasActiveFilter(f)).toBe(false);
    expect(ids('genre=rock&artis=anonim')).toEqual(['a', 'b', 'c']);
  });
});

describe('Jelajahi: artis yang bisa dipilih', () => {
  const tracks = [
    musik({ id: 'a', artis: 'Sekaa Gong', genre: 'Gamelan' }),
    musik({ id: 'b', artis: 'Kadek Wira', genre: 'Pop' }),
    musik({ id: 'c', artis: 'Ayu', genre: 'pop' }),
    musik({ id: 'd', artis: 'Kadek Wira', genre: 'Jazz' }),
  ].map(toTrack);
  const genres = deriveGenres(tracks);
  const artists = deriveArtists(tracks);
  const keys = (q: string) =>
    visibleArtists(artists, tracks, resolveJelajahi(parseJelajahiParams(search(q)), genres, artists)).map((a) => a.key);

  it('tanpa genre → semua artis, urutan asli', () => {
    expect(keys('')).toEqual(artists.map((a) => a.key));
    expect(keys('q=tari')).toEqual(artists.map((a) => a.key));
  });

  it('genre aktif (tanpa beda huruf) → hanya artis yang punya lagu di genre itu', () => {
    expect(keys('genre=POP')).toEqual(['kadek wira', 'ayu']);
    expect(keys('genre=gamelan')).toEqual(['sekaa gong']);
  });

  it('artis terpilih tetap tampil walau tidak punya lagu di genre itu', () => {
    expect(keys('genre=gamelan&artis=ayu')).toEqual(['ayu', 'sekaa gong']);
  });

  it('genre tak dikenal diabaikan → semua artis', () => {
    expect(keys('genre=rock')).toHaveLength(3);
  });
});

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('palet', () => {
  it('setiap warna ubin genre kontras ≥ 4.5 dengan teks putih', () => {
    for (const color of GENRE_COLORS) expect(contrast(color, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('sampul cadangan terang: ikon/inisial --m-muted (#515154) kontras ≥ 3 di kedua ujung gradasi', () => {
    for (const tone of COVER_TONES.flat()) expect(contrast(tone, '#515154')).toBeGreaterThanOrEqual(3);
    expect(COVER_GRADIENTS[0]).toBe('linear-gradient(135deg, #e5f2fa 0%, #b8daef 100%)');
  });

  it('pilihan deterministik per seed', () => {
    expect(hashSeed('pop')).toBe(hashSeed('pop'));
    expect(pickFromPalette(GENRE_COLORS, 'pop')).toBe(pickFromPalette(GENRE_COLORS, 'pop'));
    expect(normalizeKey('  Pop   Bali ')).toBe('pop bali');
  });
});

// Penjaga kontras CSS pustaka (audit WCAG putaran 2): dibaca dari berkas sumber, bukan dari browser.
describe('CSS pustaka: kontras teks', () => {
  const dir = path.join(process.cwd(), 'src/app/(public)/(pages)/musik/musik-desa/_com/library');
  const cssFiles = readdirSync(dir).filter((f) => f.endsWith('.module.css'));
  const css = (f: string) => readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  /** Aturan paling dalam: [selektor, isi]; @media luar ikut terlewati karena kurung kurawalnya. */
  const rules = (src: string) =>
    [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]] as const);

  it('lagu tanpa audio: opacity hanya di sampul (.cover/.media), tidak pada baris atau teks', () => {
    const files = ['track-row.module.css', 'track-table.module.css', 'track-card.module.css'];
    const dimmed = files.flatMap((f) =>
      rules(css(f))
        .filter(([sel, body]) => sel.includes("[data-playable='false']") && /(^|[;\s])opacity\s*:/.test(body))
        .map(([sel]) => sel),
    );
    expect(dimmed).toEqual([
      ".row[data-playable='false'] .cover",
      ".row[data-playable='false'] .cover",
      ".card[data-playable='false'] .media",
    ]);
  });

  it('lagu tanpa audio: judul muted, teks sekunder subtle (warna token, bukan opacity)', () => {
    for (const f of ['track-row.module.css', 'track-table.module.css']) {
      const map = new Map(rules(css(f)));
      expect(map.get(".row[data-playable='false'] .title")).toContain('var(--m-muted');
    }
    expect(new Map(rules(css('track-row.module.css'))).get(".row[data-playable='false'] .artist")).toContain('var(--m-subtle');
    expect(new Map(rules(css('track-table.module.css'))).get(".row[data-playable='false'] .sub")).toContain('var(--m-subtle');
  });

  it('nilai cadangan --m-muted/--m-subtle ≥ 4.5:1 di putih dan #f5f5f7', () => {
    const fallbacks = cssFiles.flatMap((f) => [...css(f).matchAll(/var\(--m-(?:muted|subtle),\s*(#[0-9a-f]{6})\)/gi)].map((m) => m[1]));
    expect(fallbacks.length).toBeGreaterThan(0);
    for (const hex of new Set(fallbacks)) {
      expect(contrast(hex, '#ffffff')).toBeGreaterThanOrEqual(4.5);
      expect(contrast(hex, '#f5f5f7')).toBeGreaterThanOrEqual(4.5);
    }
  });
});
