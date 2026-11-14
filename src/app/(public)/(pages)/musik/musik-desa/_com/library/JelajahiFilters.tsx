import { ArtistTile } from './ArtistTile';
import type { JelajahiFilter, JelajahiParams } from './musik-jelajahi.logic';
import { MUSIK_TEXT as T } from './musik-library.text';
import type { Artist, Genre } from './musik.types';
import s from './jelajahi.module.css';

type Props = {
  genres: readonly Genre[];
  artists: readonly Artist[];
  filter: JelajahiFilter;
  update: (change: (current: JelajahiParams) => JelajahiParams) => void;
};

/** Baris pil genre (satu pilihan, "Semua" = lepas) dan baris artis (pilih lagi = lepas). */
export function JelajahiFilters({ genres, artists, filter, update }: Props) {
  const setGenre = (key: string | null) => update((p) => ({ ...p, genre: key }));
  const toggleArtist = (a: Artist) => update((p) => ({ ...p, artis: p.artis === a.key ? null : a.key }));

  return (
    <>
      {genres.length ? (
        <div className={s.pills} role="group" aria-label={T.genreLabel}>
          <button type="button" className={s.pill} aria-pressed={!filter.genre} onClick={() => setGenre(null)}>
            {T.semuaGenre}
          </button>
          {genres.map((g) => (
            <button
              key={g.key}
              type="button"
              className={s.pill}
              aria-pressed={filter.genre?.key === g.key}
              onClick={() => setGenre(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
      ) : null}
      {artists.length ? (
        <ul className={s.artists} aria-label={T.artisLabel}>
          {artists.map((a) => (
            <li key={a.key}>
              <ArtistTile artist={a} size="sm" pressed={filter.artis?.key === a.key} onToggle={toggleArtist} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
