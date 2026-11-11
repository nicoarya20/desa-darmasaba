import { Image } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { htmlToPlainText, type PotensiItem } from "./potensi.logic";
import s from "./potensi.module.css";
import { POTENSI_TEXT } from "./potensi.text";

type Props = { item: PotensiItem; onOpen: (item: PotensiItem) => void };

/** Kartu potensi: foto + kategori + judul kiri bawah, deskripsi singkat di bawahnya; seluruh kartu membuka overlay detail. */
export function PotensiCard({ item, onOpen }: Props) {
  const deskripsi = htmlToPlainText(item.deskripsi);
  const kategori = item.kategori?.nama;

  return (
    <article className={s.card}>
      <div className={s.media}>
        {item.image?.link ? (
          <Image src={item.image.link} alt="" className={s.mediaImage} loading="lazy" decoding="async" />
        ) : null}
        <span className={s.mediaShade} aria-hidden />
        {kategori ? <span className={s.badge}>{kategori}</span> : null}
        <h2 className={s.cardTitle}>{item.name}</h2>
      </div>
      <div className={s.body}>
        {deskripsi ? <p className={s.excerpt}>{deskripsi}</p> : null}
        <button
          type="button"
          className={s.detailButton}
          aria-label={POTENSI_TEXT.detailLabel(item.name)}
          aria-haspopup="dialog"
          onClick={() => onOpen(item)}
        >
          {POTENSI_TEXT.detail}
          <IconArrowRight size={16} aria-hidden />
        </button>
      </div>
    </article>
  );
}
