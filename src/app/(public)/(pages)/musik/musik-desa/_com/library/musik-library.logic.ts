import type { Musik } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import type { Artist, Genre, Track } from './musik.types';

/** Kunci teks bebas: spasi dirapikan, huruf kecil. Teks kosong → ''. */
export function normalizeKey(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Teks dirapikan spasinya (tanpa ubah huruf). */
const tidy = (raw: string) => raw.trim().replace(/\s+/g, ' ');

/** Huruf pertama kapital, sisanya apa adanya ("pop bali" → "Pop bali"). */
const capitalizeFirst = (raw: string) => raw.charAt(0).toUpperCase() + raw.slice(1);

/**
 * Durasi teks dari admin ("05:18", "1:02:03") → "5:18" / "1:02:03". Kosong, bentuk lain, detik ≥ 60,
 * atau total 0 (admin belum mengisi) → null supaya UI tidak menulis "0:00" palsu.
 */
export function formatDurasi(raw: string | null | undefined): string | null {
  const text = raw?.trim() ?? '';
  if (!/^\d{1,3}(:\d{1,2}){1,2}$/.test(text)) return null;
  const parts = text.split(':').map(Number);
  const [secs, mins = 0, hours = 0] = [...parts].reverse();
  if (secs >= 60 || (parts.length === 3 && mins >= 60)) return null;
  const total = hours * 3600 + mins * 60 + secs;
  return total > 0 ? formatTime(total) : null;
}

/** Adapter murni Musik (context) → Track siap tampil. */
export function toTrack(m: Musik): Track {
  const artis = tidy(m.artis ?? '');
  const genre = m.genre ? tidy(m.genre) : '';
  return {
    id: m.id,
    judul: tidy(m.judul ?? ''),
    artis,
    artisKey: normalizeKey(artis),
    genre: genre || null,
    genreKey: genre ? normalizeKey(genre) : null,
    tahun: m.tahunRilis ?? null,
    durasi: formatDurasi(m.durasi),
    coverUrl: m.coverImage?.link || null,
    playable: Boolean(m.audioFile?.link),
    source: m,
  };
}

/** Urutan dihitung terbanyak dulu, lalu nama A-Z (stabil antar render). */
const byCountThenName = <T extends { jumlahLagu: number }>(name: (item: T) => string) => (a: T, b: T) =>
  b.jumlahLagu - a.jumlahLagu || name(a).localeCompare(name(b), 'id');

/**
 * Artis diturunkan dari teks `artis` (belum ada model artis). Kolaborasi ("A & B") satu artis apa adanya.
 * `tracks` diasumsikan terbaru dulu (API mengurutkan createdAt desc) → sampul = lagu terbaru artis yang bersampul.
 */
export function deriveArtists(tracks: readonly Track[]): Artist[] {
  const map = new Map<string, Artist>();
  for (const t of tracks) {
    if (!t.artisKey) continue;
    const found = map.get(t.artisKey);
    if (found) {
      found.jumlahLagu += 1;
      found.coverUrl ??= t.coverUrl;
    } else {
      map.set(t.artisKey, { key: t.artisKey, nama: t.artis, jumlahLagu: 1, coverUrl: t.coverUrl });
    }
  }
  return [...map.values()].sort(byCountThenName((a) => a.nama));
}

/** Genre dari teks `genre`, tanpa beda huruf ("Pop" = "pop"); label = tulisan pertama ditemui, huruf awal kapital. */
export function deriveGenres(tracks: readonly Track[]): Genre[] {
  const map = new Map<string, Genre>();
  for (const t of tracks) {
    if (!t.genreKey || !t.genre) continue;
    const found = map.get(t.genreKey);
    if (found) found.jumlahLagu += 1;
    else map.set(t.genreKey, { key: t.genreKey, label: capitalizeFirst(t.genre), jumlahLagu: 1 });
  }
  return [...map.values()].sort(byCountThenName((g) => g.label));
}

/**
 * Samakan teks genre tiap lagu dengan label genre turunannya ("pop" → "Pop"), supaya tabel, pil, dan ubin
 * menulis genre yang sama. Lagu tanpa genre atau kunci yang tidak ada di `genres` dibiarkan.
 */
export function withGenreLabels(tracks: readonly Track[], genres: readonly Genre[]): Track[] {
  const labels = new Map(genres.map((g) => [g.key, g.label]));
  return tracks.map((t) => {
    const label = t.genreKey ? labels.get(t.genreKey) : undefined;
    return label && label !== t.genre ? { ...t, genre: label } : t;
  });
}

/** Inisial artis untuk ubin tanpa sampul ("Kadek Wira & Darmasaba Band" → "KW"). */
export function artistInitials(nama: string): string {
  const words = nama.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';
}

/**
 * Arti klik pada lagu di pustaka. Lagu yang sedang dipilih & bisa diputar → 'toggle' (jeda/lanjut, bukan ulang dari
 * 0:00). Selain itu → 'play': diserahkan ke mesin (`playSong`), termasuk lagu tanpa audio. Mesin yang menolaknya dan
 * memberi tahu pengunjung (toast milik mesin); pustaka tidak menganggap lagu itu menjadi lagu saat ini.
 */
export function playIntent(track: Pick<Track, 'id' | 'playable'>, currentId: string | null): 'toggle' | 'play' {
  return track.id === currentId && track.playable ? 'toggle' : 'play';
}
