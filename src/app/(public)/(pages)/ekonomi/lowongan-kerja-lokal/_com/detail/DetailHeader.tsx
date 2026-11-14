import { initialsOf } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic';
import { IconBuilding, IconCalendarEvent, IconCash, IconClipboardText, IconMapPin } from '@tabler/icons-react';
import type { Ref } from 'react';
import { formatGaji, formatTanggalTayang, tanggalTayangIso } from '../lowongan-card.logic';
import { LOWONGAN_CARD_TEXT as C } from '../lowongan-card.text';
import c from '../lowongan-card.module.css';
import { LOWONGAN_FILTER_TEXT as F } from '../lowongan-filter.text';
import { KontakAksi } from './KontakAksi';
import s from './lowongan-detail.module.css';
import { LOWONGAN_DETAIL_TEXT as T } from './lowongan-detail.text';
import type { LowonganDetail } from './lowongan-detail.types';

const PILL_ICON = { size: 16, stroke: 1.75, 'aria-hidden': true } as const;

type Props = { data: LowonganDetail; aksiRef?: Ref<HTMLDivElement> };

/**
 * Kepala kartu detail gaya Welcome to the Jungle: ubin inisial 64px, `h1` posisi, pemberi kerja, aksi kontak
 * (kanan atas; ≤734px di bawah judul), lalu pil tipe · gaji · lokasi kerja dengan tanggal tayang di kanan.
 */
export function DetailHeader({ data, aksiRef }: Props) {
  const inisial = initialsOf(data.pemberiKerja);
  const tanggal = formatTanggalTayang(data.tayangMs);
  const tanggalIso = tanggalTayangIso(data.tayangMs);

  return (
    <header className={s.head}>
      <div className={s.logo} aria-hidden="true">
        {inisial || <IconBuilding size={28} stroke={1.75} className={s.logoIcon} />}
      </div>
      <div className={s.headText}>
        <h1 className={s.title}>{data.posisi}</h1>
        {data.pemberiKerja && <p className={s.employer}>{data.pemberiKerja}</p>}
      </div>
      <div className={s.headAksi}>
        <KontakAksi ref={aksiRef} kontak={data.kontak} variant="inline" />
      </div>

      <div className={s.meta}>
        <ul className={`${c.pills} ${s.pills}`} aria-label={T.infoLabel}>
          {data.tipe && (
            <li className={c.pill}>
              <IconClipboardText {...PILL_ICON} />
              <span>{data.tipe}</span>
            </li>
          )}
          <li className={c.pill} data-muted={data.gaji === null || undefined}>
            <IconCash {...PILL_ICON} />
            <span>{data.gaji === null ? C.gajiKosong : C.gajiPerBulan(formatGaji(data.gaji))}</span>
          </li>
          {/* `diDesa` ditebak dari alamat; tanpa alamat tidak ada yang bisa ditebak, jadi pil tidak tampil. */}
          {data.lokasi && (
            <li className={c.pill}>
              <IconMapPin {...PILL_ICON} />
              <span>{data.diDesa ? F.lokasi.desa : F.lokasi.luar}</span>
            </li>
          )}
        </ul>
        {tanggal && tanggalIso && (
          <p className={c.date} title={T.tayangLabel}>
            <IconCalendarEvent {...PILL_ICON} />
            <time dateTime={tanggalIso}>{tanggal}</time>
          </p>
        )}
      </div>
    </header>
  );
}
