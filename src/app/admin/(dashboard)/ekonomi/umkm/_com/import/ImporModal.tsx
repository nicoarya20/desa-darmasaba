'use client';
import { Modal, Text } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = {
  opened: boolean;
  onClose: () => void;
  judul: string;
  mengimpor: boolean;
  /** Dipanggil saat modal ditutup (bukan saat sedang mengimpor): bersihkan state impor. */
  onReset: () => void;
  /** Isi modal; menerima fungsi tutup agar tombol Batal memakai aturan kunci yang sama. */
  children: (tutup: () => void) => ReactNode;
};

/** Pembungkus modal impor CSV: tidak bisa ditutup selama mengimpor. Dipakai impor UMKM dan Produk. */
export function ImporModal({ opened, onClose, judul, mengimpor, onReset, children }: Props) {
  const tutup = () => {
    if (mengimpor) return;
    onReset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={tutup}
      title={<Text fw="bold">{judul}</Text>}
      size="lg"
      centered
      closeOnClickOutside={!mengimpor}
      closeOnEscape={!mengimpor}
      withCloseButton={!mengimpor}
    >
      {children(tutup)}
    </Modal>
  );
}
