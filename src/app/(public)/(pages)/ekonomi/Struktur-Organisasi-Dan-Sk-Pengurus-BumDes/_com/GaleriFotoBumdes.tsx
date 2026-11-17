'use client';
import { Modal } from '@mantine/core';
import { useState } from 'react';
import type { GaleriFoto } from './bumdes.logic';
import s from './bumdes.module.css';
import { BUMDES_TEXT } from './bumdes.text';

const T = BUMDES_TEXT.galeri;

type Props = {
  foto: readonly GaleriFoto[];
  /** Dipakai sebagai alt/judul modal untuk foto tanpa keterangan. */
  namaBumdes: string;
};

/** Galeri foto profil BUMDes: ubin 4/3/2 kolom, klik foto → modal ukuran penuh berjudul keterangan; kosong → tidak dirender. */
export default function GaleriFotoBumdes({ foto, namaBumdes }: Props) {
  const [aktif, setAktif] = useState<{ foto: GaleriFoto; alt: string } | null>(null);

  if (foto.length === 0) return null;

  const altOf = (item: GaleriFoto, i: number) => item.keterangan ?? T.fotoAlt(namaBumdes, i + 1);

  return (
    <div className={s.galeri} role="group" aria-label={T.label} data-testid="galeri-foto-bumdes">
      <h3 className={s.galeriTitle}>{T.title}</h3>
      <ul className={s.fotoGrid}>
        {foto.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              className={s.foto}
              onClick={() => setAktif({ foto: item, alt: altOf(item, i) })}
              aria-haspopup="dialog"
              aria-label={T.lihat(altOf(item, i))}
              data-testid="galeri-foto-item"
            >
              <span className={s.fotoFrame}>
                <img src={item.image.link} alt={altOf(item, i)} className={s.fotoImg} loading="lazy" />
              </span>
              {item.keterangan ? <span className={s.fotoCaption}>{item.keterangan}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      <Modal
        opened={aktif !== null}
        onClose={() => setAktif(null)}
        size="xl"
        centered
        title={aktif?.alt}
        closeButtonProps={{ 'aria-label': T.tutup }}
        classNames={{ content: s.modalContent, title: s.modalTitle }}
      >
        {aktif ? <img src={aktif.foto.image.link} alt={aktif.alt} className={s.modalImg} /> : null}
      </Modal>
    </div>
  );
}
