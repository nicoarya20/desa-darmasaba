import colors from '@/con/colors';
import { Button } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { PINJAM_TEXT as T } from './peminjaman.text';
import { formatTanggal, LAMA_PINJAM_HARI, tambahHari } from './peminjamanForm';
import s from './pinjam.module.css';

type Props = { tanggalAmbil: string; telp: string; onClose: () => void };

/** Layar terima kasih setelah permintaan pinjam terkirim: langkah berikutnya + ringkasan tanggal. */
export function PinjamSukses({ tanggalAmbil, telp, onClose }: Props) {
  return (
    <div className={s.sukses} role="status">
      <IconCircleCheck size={48} stroke={1.5} className={s.suksesIcon} aria-hidden="true" />
      <h3 className={s.suksesTitle}>{T.suksesTitle}</h3>
      <p className={s.suksesDesc}>
        {T.suksesDesc} <span className={s.nowrap}>(+62{telp})</span>
      </p>
      <dl className={s.ringkasan}>
        <div>
          <dt>{T.suksesAmbil}</dt>
          <dd>{formatTanggal(tanggalAmbil)}</dd>
        </div>
        <div>
          <dt>{T.suksesBatas}</dt>
          <dd>{formatTanggal(tambahHari(tanggalAmbil, LAMA_PINJAM_HARI))}</dd>
        </div>
      </dl>
      <Button radius="xl" size="md" color={colors['blue-button']} onClick={onClose} className={s.selesai}>
        {T.selesai}
      </Button>
    </div>
  );
}
