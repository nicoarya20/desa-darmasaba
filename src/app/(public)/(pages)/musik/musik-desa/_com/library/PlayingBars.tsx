import s from './playing-bars.module.css';

/** Ikon equalizer kecil penanda lagu yang sedang dipilih; bergerak hanya saat diputar (diam bila jeda). */
export function PlayingBars({ playing }: { playing: boolean }) {
  return (
    <span className={s.bars} data-playing={playing} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
