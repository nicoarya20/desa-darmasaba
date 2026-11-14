'use client';

import { IconMusic } from '@tabler/icons-react';
import { ArtistTile } from './ArtistTile';
import { GenreTile } from './GenreTile';
import { MusikEmpty } from './MusikEmpty';
import { MusikHeading } from './MusikHeading';
import { MusikSkeleton } from './MusikSkeleton';
import { ShelfRow } from './ShelfRow';
import { TrackCard } from './TrackCard';
import { TrackRow } from './TrackRow';
import { MUSIK_JELAJAHI_PATH } from '../app/musik-nav.meta';
import { jelajahiHref } from './musik-jelajahi.logic';
import { MUSIK_TEXT as T } from './musik-library.text';
import { useMusikLibrary, type MusikLibrary } from './use-musik-library';
import c from './track-card.module.css';

/** Jumlah kartu rak "Terbaru" (API sudah mengurutkan lagu terbaru dulu). */
export const TERBARU_LIMIT = 12;
/** Jumlah baris "Semua lagu" di beranda (3 kolom × 4); sisanya lewat "Lihat semua". */
export const SEMUA_LIMIT = 12;

type View = Pick<MusikLibrary, 'tracks' | 'artists' | 'genres' | 'isLoading' | 'currentId' | 'isPlaying' | 'onPlay'>;

/** Beranda Musik: rak Terbaru, Semua lagu, Artis desa, Genre. Rak tanpa isi tidak dirender. */
export function MusikHomeView({ tracks, artists, genres, isLoading, currentId, isPlaying, onPlay }: View) {
  const heading = <MusikHeading title={T.homeTitle} lead={T.homeLead} />;
  if (isLoading) {
    return (
      <div>
        {heading}
        <MusikSkeleton />
      </div>
    );
  }
  if (!tracks.length) {
    return (
      <div>
        {heading}
        <MusikEmpty icon={<IconMusic size={40} stroke={1.5} />} title={T.kosongTitle} body={T.kosongBody} />
      </div>
    );
  }

  const state = (id: string) => ({ active: id === currentId, playing: id === currentId && isPlaying, onPlay });
  return (
    <div>
      {heading}
      <ShelfRow title={T.shelfTerbaru} href={MUSIK_JELAJAHI_PATH} layout="scroll">
        {tracks.slice(0, TERBARU_LIMIT).map((t) => (
          <li key={t.id} className={c.item}>
            <TrackCard track={t} {...state(t.id)} />
          </li>
        ))}
      </ShelfRow>
      <ShelfRow title={T.shelfSemua} href={MUSIK_JELAJAHI_PATH} layout="grid">
        {tracks.slice(0, SEMUA_LIMIT).map((t) => (
          <li key={t.id}>
            <TrackRow track={t} {...state(t.id)} />
          </li>
        ))}
      </ShelfRow>
      {artists.length ? (
        <ShelfRow title={T.shelfArtis} href={MUSIK_JELAJAHI_PATH} layout="scroll">
          {artists.map((a) => (
            <li key={a.key}>
              <ArtistTile artist={a} href={jelajahiHref({ artis: a.key })} />
            </li>
          ))}
        </ShelfRow>
      ) : null}
      {genres.length ? (
        <ShelfRow title={T.shelfGenre} href={MUSIK_JELAJAHI_PATH} layout="scroll">
          {genres.map((g) => (
            <li key={g.key}>
              <GenreTile genre={g} />
            </li>
          ))}
        </ShelfRow>
      ) : null}
    </div>
  );
}

/** Beranda Musik Desa; data dari `useMusic()` (dirender `page.tsx` milik kerangka app). */
export function MusikHome() {
  return <MusikHomeView {...useMusikLibrary()} />;
}
