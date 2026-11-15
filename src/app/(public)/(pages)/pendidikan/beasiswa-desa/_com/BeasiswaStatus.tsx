import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';

/** Kerangka ubin berdenyut selama data dimuat (`aria-busy`, label untuk pembaca layar). */
export function TileSkeleton({ count, label }: { count: number; label: string }) {
  return (
    <div className={s.grid} role="status" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${s.tile} ${s.skeleton}`} />
      ))}
    </div>
  );
}

/** Kotak pesan kosong/galat; `onRetry` menampilkan tombol "Coba lagi". */
export function TileMessage({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className={s.message} role={onRetry ? 'alert' : undefined}>
      <p className={s.messageText}>{text}</p>
      {onRetry && (
        <button type="button" className={s.retry} onClick={onRetry}>
          {T.retry}
        </button>
      )}
    </div>
  );
}
