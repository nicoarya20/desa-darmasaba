import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { formatTanggalKabar } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconPlayerPlayFilled, IconShieldCheck } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { PencegahanItem } from './pencegahan.logic';
import s from './pencegahan.module.css';
import { PENCEGAHAN_TEXT as T } from './pencegahan.text';
import { YoutubeThumb } from './YoutubeThumb';

/** Kartu program gaya kartu kecil Kabar Desa (`.rail.railGrid`): pratinjau video (bila ada), tanggal, judul. */
export function PencegahanCards({ items }: { items: readonly PencegahanItem[] }) {
  return (
    <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-label={T.cardsLabel}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={kabar.card}>
            <span className={kabar.cardPhoto}>
              {item.videoId ? (
                <YoutubeThumb
                  key={item.videoId}
                  videoId={item.videoId}
                  className={`${kabar.photoImg} ${s.cardThumb}`}
                  fallback={<CardFallback />}
                  wrap={(img) => (
                    <>
                      {img}
                      <span className={s.cardPlay} aria-hidden>
                        <IconPlayerPlayFilled size={16} />
                      </span>
                    </>
                  )}
                />
              ) : (
                <CardFallback />
              )}
            </span>
            <span className={kabar.cardBody}>
              <p className={kabar.meta}>
                <time dateTime={new Date(item.createdAt).toISOString()}>{formatTanggalKabar(item.createdAt)}</time>
              </p>
              <h3 className={kabar.cardTitle}>
                {item.title}
                {item.videoId ? <span className={l.srOnly}> ({T.adaVideo})</span> : null}
              </h3>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CardFallback() {
  return (
    <span className={kabar.photoFallback} aria-hidden>
      <IconShieldCheck size={40} stroke={1.25} />
    </span>
  );
}

/** Kerangka memuat: sorotan (opsional) + `cards` kartu kecil. */
export function PencegahanPlaceholder({ sorotan, cards }: { sorotan: boolean; cards: number }) {
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
