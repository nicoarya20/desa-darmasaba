import { PotensiCard } from "./PotensiCard";
import type { PotensiItem } from "./potensi.logic";
import s from "./potensi.module.css";
import { POTENSI_TEXT } from "./potensi.text";

const PLACEHOLDER_COUNT = 6;

type Props = { items: readonly PotensiItem[]; loading: boolean; onOpen: (item: PotensiItem) => void };

/** Grid kartu potensi (3/2/1 kolom); kerangka abu selama memuat. Daftar kosong ditangani pemanggil. */
export function PotensiGrid({ items, loading, onOpen }: Props) {
  if (loading) {
    return (
      <ul className={s.grid} aria-busy="true" aria-label={POTENSI_TEXT.loading}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <li key={i} aria-hidden>
            <span className={s.placeholder} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={s.grid} aria-label={POTENSI_TEXT.gridLabel}>
      {items.map((item) => (
        <li key={item.id}>
          <PotensiCard item={item} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}
