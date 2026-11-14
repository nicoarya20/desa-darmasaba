import { IconX } from '@tabler/icons-react';
import { hasActiveFilter, type JelajahiFilter, type JelajahiParams } from './musik-jelajahi.logic';
import { MUSIK_TEXT as T } from './musik-library.text';
import s from './jelajahi.module.css';

type Props = {
  count: number;
  filter: JelajahiFilter;
  update: (change: (current: JelajahiParams) => JelajahiParams) => void;
};

/** Judul hasil "n lagu" + chip filter aktif (masing-masing bisa dilepas) + "Hapus filter". */
export function JelajahiResultHead({ count, filter, update }: Props) {
  const chips = [
    filter.q ? { id: 'q', label: T.kataKunci(filter.q), clear: (p: JelajahiParams) => ({ ...p, q: '' }) } : null,
    filter.genre ? { id: 'genre', label: filter.genre.label, clear: (p: JelajahiParams) => ({ ...p, genre: null }) } : null,
    filter.artis ? { id: 'artis', label: filter.artis.nama, clear: (p: JelajahiParams) => ({ ...p, artis: null }) } : null,
  ].filter((chip) => chip !== null);

  return (
    <div className={s.resultHead}>
      <h2 className={s.resultTitle}>{T.jumlahLagu(count)}</h2>
      {hasActiveFilter(filter) ? (
        <div className={s.chips}>
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={s.chip}
              aria-label={T.hapusChip(chip.label)}
              onClick={() => update(chip.clear)}
            >
              {chip.label}
              <IconX size={14} aria-hidden="true" />
            </button>
          ))}
          <button type="button" className={s.clear} onClick={() => update(() => ({ q: '', genre: null, artis: null }))}>
            {T.hapusFilter}
          </button>
        </div>
      ) : null}
    </div>
  );
}
