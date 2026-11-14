// @vitest-environment node
// Pustaka Musik Desa: adapter Musik → Track, turunan artis & genre, saring Jelajahi dari URL.
import { describe, expect, it } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';
import {
  artistInitials,
  deriveArtists,
  deriveGenres,
  formatDurasi,
  normalizeKey,
  toTrack,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';
import {
  filterTracks,
  hasActiveFilter,
  jelajahiHref,
  parseJelajahiParams,
  resolveJelajahi,
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

describe('palet', () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('setiap warna ubin genre kontras ≥ 4.5 dengan teks putih', () => {
    for (const color of GENRE_COLORS) expect(contrast(color, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('sampul cadangan terang: ikon/inisial --m-muted (#6e6e73) kontras ≥ 3 di kedua ujung gradasi', () => {
    for (const tone of COVER_TONES.flat()) expect(contrast(tone, '#6e6e73')).toBeGreaterThanOrEqual(3);
    expect(COVER_GRADIENTS[0]).toBe('linear-gradient(135deg, #e5f2fa 0%, #b8daef 100%)');
  });

  it('pilihan deterministik per seed', () => {
    expect(hashSeed('pop')).toBe(hashSeed('pop'));
    expect(pickFromPalette(GENRE_COLORS, 'pop')).toBe(pickFromPalette(GENRE_COLORS, 'pop'));
    expect(normalizeKey('  Pop   Bali ')).toBe('pop bali');
  });
});
