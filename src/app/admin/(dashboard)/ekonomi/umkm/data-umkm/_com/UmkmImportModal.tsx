'use client';
import { useProxy } from 'valtio/utils';
import imporUmkm from '../../../../_state/ekonomi/umkm/umkmState/umkm-impor';
import { ImporModal } from '../../_com/import/ImporModal';
import { unduhTemplateUmkm } from '../_lib/umkm-impor.logic';
import { UmkmImportBody } from './UmkmImportBody';

type Props = { opened: boolean; onClose: () => void };

/** Modal impor CSV Data UMKM: berkas diparse di browser, pratinjau dry-run server, lalu impor semua-atau-tidak-sama-sekali. */
export function UmkmImportModal({ opened, onClose }: Props) {
  const state = useProxy(imporUmkm);

  return (
    <ImporModal opened={opened} onClose={onClose} judul="Impor UMKM dari CSV" mengimpor={state.tahap === 'mengimpor'} onReset={() => imporUmkm.reset()}>
      {(tutup) => (
        <UmkmImportBody
          mode={state.mode}
          tahap={state.tahap}
          hasil={state.hasil}
          pratinjau={state.pratinjau}
          error={state.error}
          onMode={(m) => void imporUmkm.ubahMode(m)}
          onBerkas={(f) => void imporUmkm.pilihBerkas(f)}
          onTemplate={unduhTemplateUmkm}
          onBatal={tutup}
          onImpor={async () => {
            if (await imporUmkm.kirim()) onClose();
          }}
        />
      )}
    </ImporModal>
  );
}
