import { Image } from '@mantine/core';
import { IconMapPin, IconShoppingBag, IconUser } from '@tabler/icons-react';
import { inisialNama } from '../detail-produk/detail-produk.view.logic';
import { HubungiPenjualButton } from '../HubungiPenjualButton';
import { DETAIL_TOKO_TEXT as T } from './detail-toko.text';
import type { DetailToko } from './detail-toko.types';
import s from './toko-header.module.css';

const ICON = { size: 16, stroke: 1.75, 'aria-hidden': true } as const;

/**
 * Kepala toko: foto persegi (tanpa foto → inisial), kategori usaha, nama, pemilik · alamat · jumlah produk,
 * deskripsi (HTML sudah disanitasi adapter), dan tombol WhatsApp dengan pesan umum tentang toko.
 */
export function TokoHeader({ toko }: { toko: DetailToko }) {
  const jumlah = toko.produk.length;
  return (
    <header className={s.header}>
      <div className={s.foto}>
        {toko.fotoUrl ? (
          <Image src={toko.fotoUrl} alt={toko.nama} className={s.fotoImg} decoding="async" />
        ) : (
          <span className={s.inisial} aria-hidden="true">
            {inisialNama(toko.nama)}
          </span>
        )}
      </div>
      <div className={s.body}>
        {toko.kategori && <p className={s.kategori}>{toko.kategori.nama}</p>}
        <h1 className={s.nama}>{toko.nama}</h1>
        <ul className={s.meta}>
          {toko.pemilik && (
            <li className={s.metaItem}>
              <IconUser {...ICON} />
              <span className={s.srOnly}>{T.pemilik}: </span>
              <span>{toko.pemilik}</span>
            </li>
          )}
          {toko.alamat && (
            <li className={s.metaItem}>
              <IconMapPin {...ICON} />
              <span className={s.srOnly}>{T.alamat}: </span>
              <span>{toko.alamat}</span>
            </li>
          )}
          {jumlah > 0 && (
            <li className={s.metaItem}>
              <IconShoppingBag {...ICON} />
              <span>{T.jumlahProduk(jumlah)}</span>
            </li>
          )}
        </ul>
        {toko.deskripsiHtml && <div className={s.deskripsi} dangerouslySetInnerHTML={{ __html: toko.deskripsiHtml }} />}
        <div className={s.cta}>
          <HubungiPenjualButton kontak={toko.kontak} umkmNama={toko.nama} />
        </div>
      </div>
    </header>
  );
}
