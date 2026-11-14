'use client';
import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import type { JennaProviderDTO } from '@/lib/jenna/types';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { PROTOCOL_LABEL } from './protocol';

type Props = {
  provider: Pick<JennaProviderDTO, 'slot' | 'protocol'>;
  /** Slot ini dipakai chat publik saat ini (protokol aktif & Jenna aktif). */
  live: boolean;
  disabled: boolean;
  onCleared: () => void;
};

/** Tombol "Hapus API key" + konfirmasi. Hanya dirender saat slot punya API key tersimpan. */
export function JennaProviderKeyDelete({ provider, live, disabled, onCleared }: Props) {
  const snap = useSnapshot(jennaState);
  const [confirming, setConfirming] = useState(false);
  const { slot, protocol } = provider;
  const deleting = snap.saving === slot;

  const confirm = async () => {
    const result = await jennaState.clearProviderKey(slot);
    setConfirming(false);
    if (result) onCleared();
  };

  return (
    <>
      <Button
        variant="light"
        color="red"
        leftSection={<IconTrash size={16} />}
        onClick={() => setConfirming(true)}
        disabled={disabled}
      >
        Hapus API key
      </Button>
      <ConfirmModal
        opened={confirming}
        title="Hapus API key?"
        message={
          `API key ${PROTOCOL_LABEL[protocol]} akan dihapus dari server dan hasil tes koneksi direset. Base URL dan model tetap tersimpan.` +
          (live
            ? ' Provider ini sedang melayani chat publik: Jenna berhenti menjawab di website publik sampai API key disimpan lagi.'
            : '')
        }
        confirmLabel="Hapus API key"
        confirmColor="red"
        loading={deleting}
        onConfirm={() => void confirm()}
        onClose={() => !deleting && setConfirming(false)}
      />
    </>
  );
}
