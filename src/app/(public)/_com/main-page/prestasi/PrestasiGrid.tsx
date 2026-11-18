import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import { responsiveImageProps } from "../../responsive-image.logic";
import { isWideCard, type PrestasiItem } from "./prestasi.logic";
import s from "./prestasi.module.css";
import { PRESTASI_TEXT } from "./prestasi.text";

/**
 * `sizes` foto (prestasi.module.css): ≤734px 1 kolom rasio 4:3; di atasnya 2 kolom 16:10, kartu "wide" (ganjil
 * terakhir) selebar baris rasio 21:9. Foto 16:9 `object-fit: cover` mengikuti TINGGI kotak bila kotaknya lebih
 * kotak dari 16:9, jadi lebar yang dibutuhkan lebih besar dari lebar kotak (4:3 → 134vw, 16:10 → +11%).
 */
const CARD_SIZES = "(max-width: 734px) 134vw, 56vw";
const WIDE_CARD_SIZES = "(max-width: 734px) 134vw, 100vw";

type Props = {
  cards: readonly PrestasiItem[];
  loading: boolean;
  placeholderCount: number;
};

/** Grid 2 kolom prestasi & penghargaan; seluruh tile = tautan ke detail, judul di kiri bawah foto. */
export function PrestasiGrid({ cards, loading, placeholderCount }: Props) {
  if (loading && cards.length === 0) {
    return (
      <ul className={s.grid} aria-busy="true" aria-label={PRESTASI_TEXT.loading}>
        {Array.from({ length: placeholderCount }, (_, i) => (
          <li key={i} className={s.placeholder} aria-hidden />
        ))}
      </ul>
    );
  }

  if (cards.length === 0) return null;

  return (
    <ul className={s.grid} aria-label={PRESTASI_TEXT.gridLabel}>
      {cards.map((card, i) => {
        const wide = isWideCard(i, cards.length);
        return (
          <li key={`${card.source}-${card.id}`} className={wide ? s.wide : undefined}>
            <Link href={card.href} className={s.card}>
              {card.imageUrl ? (
                <Image
                  alt=""
                  className={s.cardImage}
                  {...responsiveImageProps(card.imageUrl, wide ? WIDE_CARD_SIZES : CARD_SIZES)}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <span className={s.cardShade} aria-hidden />
              <h3 className={s.cardTitle}>{card.name}</h3>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
