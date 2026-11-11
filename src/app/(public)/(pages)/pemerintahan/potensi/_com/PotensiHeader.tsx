import { POTENSI_FILTERS, type PotensiFilter } from "./potensi.logic";
import s from "./potensi-header.module.css";
import { POTENSI_TEXT } from "./potensi.text";

type Props = {
  filter: PotensiFilter;
  counts: Record<PotensiFilter, number> | null;
  onFilter: (filter: PotensiFilter) => void;
};

/** Kepala halaman Potensi: judul, pengantar, lalu tombol pil saring (Semua/Potensi/Wisata) beserta jumlahnya. */
export function PotensiHeader({ filter, counts, onFilter }: Props) {
  return (
    <header className={s.header}>
      <h1 className={s.title}>{POTENSI_TEXT.title}</h1>
      <p className={s.lead}>{POTENSI_TEXT.lead}</p>
      <div className={s.filters} role="group" aria-label={POTENSI_TEXT.filterLabel}>
        {POTENSI_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            className={s.chip}
            aria-pressed={filter === key}
            disabled={counts === null}
            onClick={() => onFilter(key)}
          >
            {POTENSI_TEXT.filters[key]}
            {counts ? <span className={s.count}>{counts[key]}</span> : null}
          </button>
        ))}
      </div>
    </header>
  );
}
