import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Image } from '@mantine/core';
import { IconDevices } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { DesaDigitalItem } from './desa-digital.logic';
import s from './desa-digital.module.css';
import { DESA_DIGITAL_TEXT as T } from './desa-digital.text';

/** Foto layanan (dekoratif: judul kartu sudah menamai isinya); tanpa foto → ikon pengganti. */
export function DesaDigitalPhoto({ url }: { url?: string }) {
  if (!url) {
    return (
      <span className={kabar.photoFallback} aria-hidden>
        <IconDevices size={40} stroke={1.25} />
      </span>
    );
  }
  return <Image src={url} alt="" className={kabar.photoImg} loading="lazy" decoding="async" />;
}

/** Kartu layanan gaya kartu kecil Kabar Desa (`.rail.railGrid`): foto 16:10, judul, ringkasan 2 baris; tanpa tanggal. */
export function DesaDigitalCards({ items }: { items: readonly DesaDigitalItem[] }) {
  return (
    <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-label={T.cardsLabel}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={kabar.card}>
            <span className={kabar.cardPhoto}>
              <DesaDigitalPhoto url={item.imageUrl} />
            </span>
            <span className={kabar.cardBody}>
              <h3 className={kabar.cardTitle}>{item.title}</h3>
              {item.summary ? <span className={s.cardSummary}>{item.summary}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Kerangka memuat: sorotan (opsional) + `cards` kartu kecil. */
export function DesaDigitalPlaceholder({ sorotan, cards }: { sorotan: boolean; cards: number }) {
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
