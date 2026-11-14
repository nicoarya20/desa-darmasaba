'use client';
import { UMKM_PESANAN_TERCATAT } from '@/lib/umkm-pesanan';
import { IconStar } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { HubungiPenjualButton } from '../HubungiPenjualButton';
import { LinkTokoOnlineButtons } from '../LinkTokoOnlineButtons';
import { hargaParts, tokoHref } from '../katalog/katalog-card.logic';
import { CaraMemesanPanel } from './CaraMemesanPanel';
import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import type { DetailProduk } from './detail-produk.types';
import s from './info.module.css';
import { PenjualPanel } from './PenjualPanel';
import { PesanWebsiteAksi } from './PesanWebsiteAksi';

type Props = {
  produk: DetailProduk;
  /** Muat ulang produk setelah pesanan website tercatat (stok berubah). */
  onTercatat: () => void;
};

/**
 * Kolom info detail produk: merek · kategori, nama, rating, harga, CTA WhatsApp (atau alur pesanan website saat
 * `UMKM_PESANAN_TERCATAT` true), link toko online, panel Cara memesan dan Penjual. Stok tidak pernah ditampilkan.
 */
export function ProdukInfo({ produk, onTercatat }: Props) {
  const { harga, satuan } = hargaParts(produk);
  const { penjual, kategori } = produk;

  return (
    <div className={s.info}>
      {(penjual || kategori) && (
        <p className={s.brandRow}>
          {penjual && (
            <Link href={tokoHref(penjual.id)} className={s.brand}>
              {penjual.nama}
            </Link>
          )}
          {penjual && kategori && <span aria-hidden="true"> · </span>}
          {kategori && <span>{kategori.nama}</span>}
        </p>
      )}
      {produk.isUnggulan && <span className={s.label}>{T.unggulan}</span>}
      <h1 className={s.title}>{produk.nama}</h1>
      {/* TODO(umkm-rating): rating belum punya sumber data — docs/BACKEND-TODO.md P3 */}
      <a href="#ulasan" className={s.rating}>
        <IconStar size={16} stroke={1.75} aria-hidden="true" />
        <span>{T.ratingKosong}</span>
      </a>
      <p className={s.price}>
        <span className={s.amount}>{harga}</span>
        {satuan && <span className={s.unit}>{satuan}</span>}
      </p>

      <div className={s.actions}>
        {UMKM_PESANAN_TERCATAT ? (
          <PesanWebsiteAksi produk={produk} onTercatat={onTercatat} />
        ) : (
          <HubungiPenjualButton kontak={penjual?.kontak} umkmNama={penjual?.nama} produkNama={produk.nama} />
        )}
        <LinkTokoOnlineButtons links={produk.linkTokoOnline} withLabel />
      </div>

      <CaraMemesanPanel />
      {penjual && <PenjualPanel penjual={penjual} alamat={produk.alamat} />}
    </div>
  );
}
