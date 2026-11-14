import type { Artist, Genre, Track } from './musik.types';
import { MUSIK_JELAJAHI_PATH } from '../app/musik-nav.meta';
import { normalizeKey } from './musik-library.logic';

/** Keadaan Jelajahi di URL: `q` (kata kunci), `genre` & `artis` (satu kunci masing-masing). */
export type JelajahiParams = { q: string; genre: string | null; artis: string | null };

type Reader = { get(name: string): string | null };

/** Baca params dari URL. Kunci dinormalkan; kosong → null. Kunci tak dikenal disaring di `resolveJelajahi`. */
export function parseJelajahiParams(search: Reader): JelajahiParams {
  const key = (name: string) => normalizeKey(search.get(name) ?? '') || null;
  return { q: search.get('q')?.trim() ?? '', genre: key('genre'), artis: key('artis') };
}

/** URL Jelajahi untuk params; nilai kosong tidak ditulis. */
export function jelajahiHref(p: Partial<JelajahiParams>): string {
  const search = new URLSearchParams();
  if (p.q) search.set('q', p.q);
  if (p.genre) search.set('genre', p.genre);
  if (p.artis) search.set('artis', p.artis);
  const query = search.toString();
  return query ? `${MUSIK_JELAJAHI_PATH}?${query}` : MUSIK_JELAJAHI_PATH;
}

/** Filter yang benar-benar berlaku: kunci genre/artis yang tidak ada di pustaka diabaikan. */
export type JelajahiFilter = { q: string; genre: Genre | null; artis: Artist | null };

export function resolveJelajahi(p: JelajahiParams, genres: readonly Genre[], artists: readonly Artist[]): JelajahiFilter {
  return {
    q: p.q,
    genre: genres.find((g) => g.key === p.genre) ?? null,
    artis: artists.find((a) => a.key === p.artis) ?? null,
  };
}

/** Params URL dari filter yang sudah di-resolve: kunci genre/artis yang tidak dikenal pustaka hilang dari URL. */
export function toJelajahiParams(f: JelajahiFilter): JelajahiParams {
  return { q: f.q, genre: f.genre?.key ?? null, artis: f.artis?.key ?? null };
}

/**
 * Bungkus perubahan params supaya dijalankan atas params yang sudah di-resolve: URL hasilnya ditulis ulang
 * tanpa kunci genre/artis sampah (`?genre=rock` yang tidak ada di pustaka), alih-alih membawanya terus.
 */
export function withKnownKeys(
  change: (current: JelajahiParams) => JelajahiParams,
  genres: readonly Genre[],
  artists: readonly Artist[],
): (current: JelajahiParams) => JelajahiParams {
  return (current) => change(toJelajahiParams(resolveJelajahi(current, genres, artists)));
}

/** Kata kunci dipecah per kata (huruf kecil); semua kata harus muncul di judul/artis/genre. */
function matchesQuery(t: Track, words: readonly string[]): boolean {
  if (!words.length) return true;
  const haystack = `${t.judul} ${t.artis} ${t.genre ?? ''}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Saring lagu dengan filter yang sudah di-resolve; urutan pustaka dipertahankan. */
export function filterTracks(tracks: readonly Track[], f: JelajahiFilter): Track[] {
  const words = normalizeKey(f.q).split(' ').filter(Boolean);
  return tracks.filter(
    (t) =>
      (!f.genre || t.genreKey === f.genre.key) &&
      (!f.artis || t.artisKey === f.artis.key) &&
      matchesQuery(t, words),
  );
}

/**
 * Artis yang layak dipilih di baris artis: saat genre aktif hanya artis yang punya lagu di genre itu, supaya
 * memilih artis tidak berujung 0 lagu. Artis terpilih tetap tampil walau tidak cocok, supaya bisa dilepas.
 * Urutan `artists` dipertahankan.
 */
export function visibleArtists(artists: readonly Artist[], tracks: readonly Track[], f: JelajahiFilter): Artist[] {
  if (!f.genre) return [...artists];
  const genreKey = f.genre.key;
  const inGenre = new Set(tracks.filter((t) => t.genreKey === genreKey).map((t) => t.artisKey));
  return artists.filter((a) => inGenre.has(a.key) || a.key === f.artis?.key);
}

/** Ada filter aktif (yang dikenali) selain kosong. */
export const hasActiveFilter = (f: JelajahiFilter) => Boolean(f.q || f.genre || f.artis);
