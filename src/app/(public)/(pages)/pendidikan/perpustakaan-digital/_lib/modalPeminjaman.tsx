'use client';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { BukuSampul } from '../_com/BukuSampul';
import { PINJAM_TEXT as T } from './peminjaman.text';
import s from './pinjam.module.css';
import { PinjamForm } from './PinjamForm';
import { PinjamSukses } from './PinjamSukses';
import { usePeminjaman } from './use-peminjaman';

/** Buku yang dipinjam (ringkas, untuk kepala modal & payload). */
export type BukuPinjam = { id: string; judul: string; sampul: string | null; kategoriNama: string | null };

export interface ModalPeminjamanProps {
  opened: boolean;
  onClose: () => void;
  buku: BukuPinjam | null;
}

/**
 * Modal "Pinjam buku": kepala buku (sampul kecil, kategori, judul), formulir, lalu layar terima kasih setelah
 * terkirim. Layar ≤734px → layar penuh. Isi dipasang ulang tiap dibuka (Mantine membongkar isi modal tertutup),
 * jadi isian dan status selalu mulai dari kosong.
 */
export default function ModalPeminjaman({ opened, onClose, buku }: ModalPeminjamanProps) {
  const mobile = useMediaQuery('(max-width: 734px)');
  return (
    <Modal
      opened={opened && buku !== null}
      onClose={onClose}
      title={T.title}
      size="lg"
      radius={mobile ? 0 : 18}
      padding="xl"
      fullScreen={mobile}
      classNames={{ title: s.modalTitle, header: s.modalHeader }}
    >
      {buku && <PinjamBody buku={buku} onClose={onClose} />}
    </Modal>
  );
}

function PinjamBody({ buku, onClose }: { buku: BukuPinjam; onClose: () => void }) {
  const form = usePeminjaman(buku.id);
  return (
    <div className={s.body}>
      <div className={s.buku}>
        <div className={s.bukuCover}>
          <BukuSampul src={buku.sampul} alt="" iconSize={24} />
        </div>
        <div className={s.bukuText}>
          {buku.kategoriNama && <p className={s.bukuKategori}>{buku.kategoriNama}</p>}
          <p className={s.bukuJudul}>{buku.judul}</p>
        </div>
      </div>
      {form.status === 'sent' ? (
        <PinjamSukses tanggalAmbil={form.values.tanggalAmbil} telp={form.values.telp} onClose={onClose} />
      ) : (
        <PinjamForm form={form} onCancel={onClose} />
      )}
    </div>
  );
}
