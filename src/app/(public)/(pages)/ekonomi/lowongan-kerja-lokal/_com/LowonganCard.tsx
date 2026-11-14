import { initialsOf } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic';
import {
  IconArrowRight,
  IconBuilding,
  IconCalendarEvent,
  IconCash,
  IconClipboardText,
  IconMapPin,
} from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { formatGaji, formatTanggalTayang, lowonganHref, tanggalTayangIso } from './lowongan-card.logic';
import { LOWONGAN_CARD_TEXT as T } from './lowongan-card.text';
import type { Lowongan } from './lowongan.types';
import s from './lowongan-card.module.css';

const PILL_ICON = { size: 16, stroke: 1.75, 'aria-hidden': true } as const;

/**
 * Kartu baris lowongan gaya Welcome to the Jungle: ubin inisial pemberi kerja, posisi, ringkasan, pil info, tanggal tayang.
 * Seluruh kartu satu tautan (judul, diperluas `::after`) ke halaman detail; "Lihat detail" hanya penanda visual.
 */
export function LowonganCard({ lowongan }: { lowongan: Lowongan }) {
  const inisial = initialsOf(lowongan.pemberiKerja);
  const tanggal = formatTanggalTayang(lowongan.tayangMs);
  const tanggalIso = tanggalTayangIso(lowongan.tayangMs);

  return (
    <article className={s.card}>
      <div className={s.head}>
        <div className={s.logo} aria-hidden="true">
          {inisial || <IconBuilding size={24} stroke={1.75} className={s.logoIcon} />}
        </div>
        <div className={s.headText}>
          <h3 className={s.title}>
            <Link href={lowonganHref(lowongan.id)} className={s.link}>
              {lowongan.posisi}
            </Link>
          </h3>
          {lowongan.pemberiKerja && <p className={s.employer}>{lowongan.pemberiKerja}</p>}
        </div>
      </div>

      {lowongan.ringkasan && <p className={s.summary}>{lowongan.ringkasan}</p>}

      <ul className={s.pills}>
        {lowongan.tipe && (
          <li className={s.pill}>
            <IconClipboardText {...PILL_ICON} />
            <span>{lowongan.tipe}</span>
          </li>
        )}
        <li className={s.pill} data-muted={lowongan.gaji === null || undefined}>
          <IconCash {...PILL_ICON} />
          <span>{lowongan.gaji === null ? T.gajiKosong : T.gajiPerBulan(formatGaji(lowongan.gaji))}</span>
        </li>
        {lowongan.lokasi && (
          <li className={s.pill} data-clip="true" title={lowongan.lokasi}>
            <IconMapPin {...PILL_ICON} />
            <span>{lowongan.lokasi}</span>
          </li>
        )}
      </ul>

      <div className={s.foot}>
        <span className={s.cta} aria-hidden="true">
          {T.lihatDetail}
          <IconArrowRight size={16} stroke={1.75} />
        </span>
        {tanggal && tanggalIso && (
          <p className={s.date}>
            <IconCalendarEvent {...PILL_ICON} />
            <time dateTime={tanggalIso}>{tanggal}</time>
          </p>
        )}
      </div>
    </article>
  );
}
