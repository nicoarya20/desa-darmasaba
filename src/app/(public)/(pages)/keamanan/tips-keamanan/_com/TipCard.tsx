import { Image } from '@mantine/core';
import type { Tip } from './tips-keamanan.logic';
import s from './tips-keamanan.module.css';

/**
 * Satu ubin tips. Desktop 2 kolom: kiri foto (bila ada) atau judul, kanan judul + isi; isi selalu di kolom kanan agar
 * butir semua tips sejajar. Tanpa foto → tanpa placeholder. Isi = HTML editor admin (tepercaya, seperti halaman lama).
 */
export function TipCard({ tip }: { tip: Tip }) {
  const title = <h3 className={s.title}>{tip.title}</h3>;
  const hasBody = Boolean(tip.imageUrl || tip.html);

  return (
    <li className={hasBody ? s.tip : `${s.tip} ${s.tipSolo}`}>
      {tip.imageUrl ? (
        <figure className={s.photo}>
          <Image src={tip.imageUrl} alt="" className={s.photoImg} loading="lazy" decoding="async" />
        </figure>
      ) : (
        <div className={s.aside}>{title}</div>
      )}
      {hasBody ? (
        <div className={s.body}>
          {tip.imageUrl ? title : null}
          {tip.html ? <div className={s.content} dangerouslySetInnerHTML={{ __html: tip.html }} /> : null}
        </div>
      ) : null}
    </li>
  );
}
