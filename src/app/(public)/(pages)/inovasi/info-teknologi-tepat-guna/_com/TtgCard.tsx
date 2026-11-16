import { Image } from '@mantine/core';
import type { Ttg } from './info-ttg.logic';
import s from './info-ttg.module.css';

/**
 * Satu ubin teknologi tepat guna. Desktop 2 kolom: kiri foto (bila ada) atau judul, kanan judul + isi. Foto rasio asli
 * tanpa dipotong (sebagian foto berisi teks produk) dan disisipkan berpadding, bukan menempel tepi ubin. Tanpa foto →
 * tanpa placeholder. `alt=""`: judul tepat di sebelahnya. Isi = HTML yang sudah dibersihkan `toTtg`.
 */
export function TtgCard({ item }: { item: Ttg }) {
  const title = <h3 className={s.title}>{item.title}</h3>;
  const hasBody = Boolean(item.imageUrl || item.html);

  return (
    <li className={hasBody ? s.item : `${s.item} ${s.itemSolo}`}>
      {item.imageUrl ? (
        <figure className={s.photo}>
          <Image src={item.imageUrl} alt="" className={s.photoImg} loading="lazy" decoding="async" />
        </figure>
      ) : (
        <div className={s.aside}>{title}</div>
      )}
      {hasBody ? (
        <div className={s.body}>
          {item.imageUrl ? title : null}
          {item.html ? <div className={s.content} dangerouslySetInnerHTML={{ __html: item.html }} /> : null}
        </div>
      ) : null}
    </li>
  );
}
