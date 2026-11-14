import { Link } from 'next-view-transitions';
import { jelajahiHref } from './musik-jelajahi.logic';
import { GENRE_COLORS, pickFromPalette } from './musik-palette';
import type { Genre } from './musik.types';
import s from './genre-tile.module.css';

/** Ubin genre persegi panjang berwarna tetap (dari hash kunci) → Jelajahi tersaring genre itu. */
export function GenreTile({ genre }: { genre: Genre }) {
  return (
    <Link
      href={jelajahiHref({ genre: genre.key })}
      className={s.tile}
      style={{ backgroundColor: pickFromPalette(GENRE_COLORS, genre.key) }}
    >
      <span className={s.label}>{genre.label}</span>
    </Link>
  );
}
