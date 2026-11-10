import { VisuallyHidden } from '@mantine/core';
import type { DasarHukumItem } from './dasar-hukum.logic';
import s from './dasar-hukum.module.css';

type Props = { items: DasarHukumItem[] };

/** Daftar bernomor dasar hukum: penanda peraturan tebal, perihal di baris bawahnya. */
export function DasarHukumList({ items }: Props) {
  return (
    <ol className={s.list}>
      {items.map((item, i) => (
        <li key={i} className={s.item}>
          <div className={s.text}>
            <span className={s.nomor}>{item.nomor}</span>
            {item.perihal && (
              <span className={s.perihal}>
                {/* "tentang" disembunyikan secara visual saja agar pembaca layar tetap membaca kalimat utuh. */}
                <VisuallyHidden> tentang </VisuallyHidden>
                {item.perihal}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
