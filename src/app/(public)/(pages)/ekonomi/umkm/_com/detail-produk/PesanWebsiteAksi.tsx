'use client';
import { Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { PesananModal } from '../PesananModal';
import type { DetailProduk } from './detail-produk.types';
import s from './info.module.css';
import { usePesananProduk } from './use-pesanan-produk';

/**
 * Tombol "Pesan Sekarang" + modal pesanan lama. Hanya dirender saat `UMKM_PESANAN_TERCATAT` true
 * (src/lib/umkm-pesanan.ts); selama false warga diarahkan ke WhatsApp penjual.
 */
export function PesanWebsiteAksi({ produk, onTercatat }: { produk: DetailProduk; onTercatat: () => void }) {
  const p = usePesananProduk(produk, onTercatat);

  return (
    <>
      <Button
        leftSection={<IconShoppingCart />}
        disabled={produk.stok === 0}
        onClick={p.open}
        className={s.cta}
        fullWidth
      >
        Pesan Sekarang
      </Button>
      <PesananModal
        opened={p.modalOpen}
        onClose={p.close}
        satuan={produk.satuan}
        stok={produk.stok}
        form={p.form}
        onFormChange={p.setForm}
        error={p.error}
        loading={p.loading}
        onSubmit={p.submit}
        ordered={p.ordered}
      />
    </>
  );
}
