'use client';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { KATALOG_BASE_HREF, KATALOG_BRAND_VARS } from '../katalog/katalog-filter.meta';
import s from './detail-produk.module.css';
import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import type { DetailProduk } from './detail-produk.types';
import { DetailProdukStatus } from './DetailProdukStatus';
import { ProdukDeskripsi } from './ProdukDeskripsi';
import { ProdukGaleri } from './ProdukGaleri';
import { ProdukInfo } from './ProdukInfo';
import { ProdukSerupa } from './ProdukSerupa';
import { UlasanSection } from './UlasanSection';
import { useDetailProduk } from './use-detail-produk';

/**
 * Halaman detail produk UMKM gaya Decathlon: tautan kembali, grid galeri + info menempel (deskripsi di bawah galeri),
 * lalu Ulasan dan Produk serupa. Pemesanan lewat WhatsApp penjual; stok tidak ditampilkan.
 */
export function DetailProdukView({ id }: { id: string }) {
  const { state, reload } = useDetailProduk(id);

  return (
    <div className={s.page} style={KATALOG_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={s.inner}>
        <Link href={KATALOG_BASE_HREF} className={s.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden="true" />
          {T.backToList}
        </Link>
        {state.status === 'ready' ? (
          <DetailBody produk={state.data} onReload={reload} />
        ) : (
          <DetailProdukStatus status={state.status} onRetry={reload} />
        )}
      </div>
    </div>
  );
}

function DetailBody({ produk, onReload }: { produk: DetailProduk; onReload: () => void }) {
  return (
    <>
      <div className={s.grid}>
        <div className={s.galeri}>
          <ProdukGaleri fotos={produk.fotos} />
        </div>
        <div className={s.info}>
          <ProdukInfo produk={produk} onTercatat={onReload} />
        </div>
        <div className={s.deskripsiArea}>
          <ProdukDeskripsi html={produk.deskripsiHtml} />
        </div>
      </div>
      <UlasanSection />
      <ProdukSerupa
        current={{ id: produk.id, kategoriNama: produk.kategori?.nama ?? null, umkmId: produk.penjual?.id ?? null }}
      />
    </>
  );
}
