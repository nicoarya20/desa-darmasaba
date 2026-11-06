import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import { isWideCard, type PrestasiCard } from "./prestasi.logic";
import s from "./prestasi.module.css";
import { PRESTASI_TEXT } from "./prestasi.text";

type Props = {
  cards: readonly PrestasiCard[];
  loading: boolean;
  placeholderCount: number;
};

/** Grid 2 kolom prestasi terbaru; seluruh tile = tautan ke detail, judul di kiri bawah foto. */
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
      {cards.map((card, i) => (
        <li key={card.id} className={isWideCard(i, cards.length) ? s.wide : undefined}>
          <Link href={card.href} className={s.card}>
            {card.imageUrl ? (
              <Image src={card.imageUrl} alt="" className={s.cardImage} loading="lazy" decoding="async" />
            ) : null}
            <span className={s.cardShade} aria-hidden />
            <h3 className={s.cardTitle}>{card.name}</h3>
          </Link>
        </li>
      ))}
    </ul>
  );
}
