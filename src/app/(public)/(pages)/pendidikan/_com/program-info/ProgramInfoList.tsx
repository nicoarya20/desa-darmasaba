import type { ProgramInfoItem } from './program-info.logic';
import s from './program-info.module.css';

/** Daftar butir CMS: baris bergaris dengan titik brand; istilah "X:" ditebalkan, teks lain apa adanya. */
export function ProgramInfoList({ items }: { items: readonly ProgramInfoItem[] }) {
  return (
    <ul className={s.list}>
      {items.map((item, i) => (
        <li key={i} className={s.item}>
          {item.term ? (
            <>
              <strong className={s.term}>{item.term}:</strong> {item.text}
            </>
          ) : (
            item.text
          )}
        </li>
      ))}
    </ul>
  );
}
