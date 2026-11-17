import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { Image } from '@mantine/core';
import { IconHeartHandshake } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { KesejahteraanItem } from './kesejahteraan.logic';
import s from './kesejahteraan.module.css';
import { KESEJAHTERAAN_TEXT as T } from './kesejahteraan.text';

/** Foto program (dekoratif: judul kartu sudah menamai isinya); tanpa foto → ikon pengganti, bukan gambar "No image". */
function KesejahteraanPhoto({ url }: { url?: string }) {
  if (!url) {
    return (
      <span className={kabar.photoFallback} aria-hidden>
        <IconHeartHandshake size={40} stroke={1.25} />
      </span>
    );
  }
  return <Image src={url} alt="" className={kabar.photoImg} loading="lazy" decoding="async" />;
}

/** Kartu program gaya kartu kecil Kabar Desa (`.rail.railGrid`): foto/ikon 16:10, judul, ringkasan 2 baris; tanpa tanggal. */
export function KesejahteraanCards({ items }: { items: readonly KesejahteraanItem[] }) {
  return (
    <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-label={T.cardsLabel}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={`${kabar.card} ${r.trigger}`}>
            <span className={kabar.cardPhoto}>
              <KesejahteraanPhoto url={item.imageUrl} />
            </span>
            <span className={kabar.cardBody}>
              <h3 className={kabar.cardTitle}>
                <span className={r.title}>{item.title}</span>
              </h3>
              {item.summary ? <span className={s.cardSummary}>{item.summary}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Kerangka memuat: sorotan (opsional) + `cards` kartu kecil. */
export function KesejahteraanPlaceholder({ sorotan, cards }: { sorotan: boolean; cards: number }) {
  return (
    <div className={s.stack} aria-busy="true" aria-label={T.loading}>
      {sorotan ? <div className={`${kabar.featured} ${kabar.placeholder}`} aria-hidden /> : null}
      <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-hidden>
        {Array.from({ length: cards }, (_, i) => (
          <li key={i} className={`${kabar.card} ${kabar.placeholder}`} />
        ))}
      </ul>
    </div>
  );
}
