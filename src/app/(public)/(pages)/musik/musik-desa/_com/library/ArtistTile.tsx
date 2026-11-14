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

/** Ubin artis lingkaran: sampul lagu terbaru artis di atas inisial (cadangan bila sampul gagal), nama, jumlah lagu. */
export function ArtistTile(props: Props) {
  const { artist, size = 'lg' } = props;
  const style: CSSProperties = { background: pickFromPalette(COVER_GRADIENTS, artist.key) };
  const content = (
    <>
      <span className={s.avatar} style={style} aria-hidden="true">
        {/* Inisial selalu ada di bawah sampul: bila gambar gagal dimuat (alt kosong → tak tergambar), inisial yang
            tampil, bukan lingkaran kosong. Tanpa state onError, jadi retry gambar global (ImageErrorRetryMount) tetap jalan. */}
        <span className={s.initials}>{artistInitials(artist.nama)}</span>
        {artist.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- sampul kecil dari MinIO via /api, pola situs memakai <img> lazy
          <img src={artist.coverUrl} alt="" loading="lazy" decoding="async" className={s.img} />
        ) : null}
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
