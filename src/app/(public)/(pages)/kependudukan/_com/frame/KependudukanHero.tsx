import type { DatasetSlice } from '../data/kependudukan-data.types';
import { heroCards, type HeroCard } from './kependudukan-hero.logic';
import s from './hero.module.css';
import { RINGKASAN_ANCHOR } from './kependudukan.meta';
import { KEPENDUDUKAN_TEXT as T } from './kependudukan.text';

const TITLE_ID = 'kependudukan-ringkasan-title';

/** Isi angka satu kartu: nilai + satuan + catatan tahun, atau kalimat kosong/galat, atau kerangka saat memuat. */
function CardValue({ card }: { card: HeroCard }) {
  if (card.status === 'loading') return <span className={s.skeleton} aria-hidden />;
  if (card.status !== 'ready') {
    return <p className={s.missing}>{card.status === 'error' ? T.hero.gagal : T.hero.belumDiisi}</p>;
  }
  return (
    <>
      <p className={s.value}>
        {card.value}
        <span className={s.unit}>{card.unit}</span>
      </p>
      <p className={s.note}>{card.note}</p>
    </>
  );
}

/**
 * Hero `#ringkasan`: empat kartu `#f5f5f7` (total penduduk lebih lebar). Galat cukup ditulis di kartu; tombol
 * "Coba lagi" ada di section datanya (Per Banjar / Dinamika).
 */
export function KependudukanHero({ banjar, dinamika, now = new Date() }: { banjar: DatasetSlice; dinamika: DatasetSlice; now?: Date }) {
  const cards = heroCards(banjar, dinamika, now);
  const busy = cards.some((c) => c.status === 'loading');
  return (
    <section id={RINGKASAN_ANCHOR} aria-labelledby={TITLE_ID} aria-busy={busy || undefined}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {T.hero.title}
      </h2>
      <ul className={s.grid}>
        {cards.map((card) => (
          <li key={card.key} className={s.card} data-status={card.status}>
            <p className={s.label}>{card.label}</p>
            <CardValue card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
