import s from './equalizer-bars.module.css';

/**
 * Ikon 3 bar equalizer (dekoratif, aria-hidden): bergerak saat `playing`, diam saat jeda dan saat
 * prefers-reduced-motion. Warna = currentColor; ukuran lewat `--eq-size` (bawaan 16px) di pembungkus.
 */
export function EqualizerBars({ playing }: { playing: boolean }) {
  return (
    <span className={s.eq} data-playing={playing} aria-hidden="true">
      <span className={s.bar} />
      <span className={s.bar} />
      <span className={s.bar} />
    </span>
  );
}
