import s from './katalog-grid.module.css';

type Props = {
  title: string;
  description?: string;
  /** Pil aksi tampil hanya bila label dan handler sama-sama ada. */
  actionLabel?: string;
  onAction?: () => void;
};

/** Panel keadaan kosong katalog (data kosong atau hasil saring kosong). */
export function KatalogEmpty({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className={s.empty}>
      <p className={s.emptyTitle}>{title}</p>
      {description && <p className={s.emptyText}>{description}</p>}
      {actionLabel && onAction && (
        <button type="button" className={s.emptyAction} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
