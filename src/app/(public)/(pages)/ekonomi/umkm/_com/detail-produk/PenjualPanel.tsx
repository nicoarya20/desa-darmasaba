import { IconMapPin } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { inisialNama } from '../detail-umkm/detail-umkm.logic';
import { tokoHref } from '../katalog/katalog-card.logic';
import { emptyParams, katalogHref } from '../katalog/katalog-params.logic';
import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import type { DetailPenjual } from './detail-produk.types';
import s from './info.module.css';

const TITLE_ID = 'penjual-judul';

type Props = { penjual: DetailPenjual; alamat: string | null };

/**
 * Panel penjual: inisial UMKM (API detail belum mengirim foto UMKM, docs/BACKEND-TODO.md P2), nama, pemilik,
 * alamat, dan tautan ke katalog yang disaring per toko.
 */
export function PenjualPanel({ penjual, alamat }: Props) {
  return (
    <section className={s.panelLine} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {T.penjual}
      </h2>
      <div className={s.seller}>
        <span className={s.avatar} aria-hidden="true">
          {inisialNama(penjual.nama)}
        </span>
        <div className={s.sellerBody}>
          <Link href={tokoHref(penjual.id)} className={s.sellerName}>
            {penjual.nama}
          </Link>
          {penjual.pemilik && <p className={s.sellerMeta}>{T.pemilik(penjual.pemilik)}</p>}
          {alamat && (
            <p className={s.sellerAddress}>
              <IconMapPin size={16} stroke={1.75} aria-hidden="true" />
              <span>{alamat}</span>
            </p>
          )}
        </div>
      </div>
      <Link href={katalogHref({ ...emptyParams('produk'), toko: [penjual.id] })} className={s.sellerLink}>
        {T.lihatProdukToko}
      </Link>
    </section>
  );
}
