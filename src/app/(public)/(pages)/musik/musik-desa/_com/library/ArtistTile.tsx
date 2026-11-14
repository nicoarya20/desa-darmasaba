import { Link } from 'next-view-transitions';
import type { CSSProperties } from 'react';
import { artistInitials } from './musik-library.logic';
import { MUSIK_TEXT as T } from './musik-library.text';
import { COVER_GRADIENTS, pickFromPalette } from './musik-palette';
import type { Artist } from './musik.types';
import s from './artist-tile.module.css';

type Common = { artist: Artist; size?: 'lg' | 'sm' };
/** Mode tautan (beranda → Jelajahi) atau mode tombol pilih (baris artis di Jelajahi). */
type Props = Common & ({ href: string } | { pressed: boolean; onToggle: (artist: Artist) => void });

/** Ubin artis lingkaran: sampul lagu terbaru artis atau inisial, nama, dan jumlah lagu. */
export function ArtistTile(props: Props) {
  const { artist, size = 'lg' } = props;
  const style: CSSProperties = { background: pickFromPalette(COVER_GRADIENTS, artist.key) };
  const content = (
    <>
      <span className={s.avatar} style={style} aria-hidden="true">
        {artist.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- sampul kecil dari MinIO via /api, pola situs memakai <img> lazy
          <img src={artist.coverUrl} alt="" loading="lazy" decoding="async" className={s.img} />
        ) : (
          <span className={s.initials}>{artistInitials(artist.nama)}</span>
        )}
      </span>
      <span className={s.name}>{artist.nama}</span>
      {size === 'lg' ? <span className={s.count}>{T.jumlahLagu(artist.jumlahLagu)}</span> : null}
    </>
  );

  if ('href' in props) {
    return (
      <Link href={props.href} className={s.tile} data-size={size}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={s.tile}
      data-size={size}
      aria-pressed={props.pressed}
      onClick={() => props.onToggle(artist)}
    >
      {content}
    </button>
  );
}
