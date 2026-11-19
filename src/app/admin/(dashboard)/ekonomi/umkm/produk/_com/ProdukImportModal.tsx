'use client';
import { useProxy } from 'valtio/utils';
import imporProduk from '../../../../_state/ekonomi/umkm/umkmState/produk-impor';
import { ImporModal } from '../../_com/import/ImporModal';
import { unduhTemplateProduk } from '../_lib/produk-impor.logic';
import { ProdukImportBody } from './ProdukImportBody';

type Props = { opened: boolean; onClose: () => void };

/** Modal impor CSV Produk UMKM: berkas diparse di browser, pratinjau dry-run server, lalu impor semua-atau-tidak-sama-sekali. */
export function ProdukImportModal({ opened, onClose }: Props) {
  const state = useProxy(imporProduk);

  return (
    <ImporModal opened={opened} onClose={onClose} judul="Impor Produk dari CSV" mengimpor={state.tahap === 'mengimpor'} onReset={() => imporProduk.reset()}>
      {(tutup) => (
        <ProdukImportBody
          mode={state.mode}
          tahap={state.tahap}
          hasil={state.hasil}
          pratinjau={state.pratinjau}
          error={state.error}
          onMode={(m) => void imporProduk.ubahMode(m)}
          onBerkas={(f) => void imporProduk.pilihBerkas(f)}
          onTemplate={unduhTemplateProduk}
          onBatal={tutup}
          onImpor={async () => {
            if (await imporProduk.kirim()) onClose();
          }}
        />
      )}
    </ImporModal>
  );
}
