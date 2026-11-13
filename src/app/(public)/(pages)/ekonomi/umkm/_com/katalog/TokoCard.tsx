import { IconBuildingStore, IconMapPin, IconUser } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { alamatTampil, fotoSrc, tokoHref } from './katalog-card.logic';
import { KATALOG_CARD_TEXT as T } from './katalog-card.text';
import type { KatalogToko } from './katalog.types';
import { KatalogMedia } from './KatalogMedia';
import s from './toko-card.module.css';

type Props = { toko: KatalogToko; jumlahProduk?: number };

/** Kartu UMKM (toko) gaya Decathlon: seluruh kartu satu tautan ke detail UMKM. */
export function TokoCard({ toko, jumlahProduk }: Props) {
  const pemilik = toko.pemilik.trim();

  return (
    <Link href={tokoHref(toko.id)} className={s.card}>
      <KatalogMedia
        src={fotoSrc(toko.imageUrl)}
        alt={toko.nama}
        fallback={<IconBuildingStore size={40} stroke={1.5} />}
      />
      <div className={s.body}>
        {toko.kategori && <p className={s.kategori}>{toko.kategori.nama}</p>}
        <h3 className={s.name}>{toko.nama}</h3>
        {pemilik && (
          <p className={s.pemilik}>
            <IconUser size={14} stroke={1.75} aria-hidden="true" />
            <span>{pemilik}</span>
          </p>
        )}
        <p className={s.alamat}>
          <IconMapPin size={14} stroke={1.75} aria-hidden="true" />
          <span>{alamatTampil(toko.alamat)}</span>
        </p>
        {jumlahProduk !== undefined && <p className={s.count}>{T.jumlahProduk(jumlahProduk)}</p>}
      </div>
    </Link>
  );
}
