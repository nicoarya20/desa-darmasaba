import { formatPercent, formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { formatJumlah, latestUpdate } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';
import { arahPerubahan, perubahanTahun, type PendudukMiskinTahun, type PerubahanTahun } from './penduduk-miskin.logic';
import s from './penduduk-miskin.module.css';
import { PENDUDUK_MISKIN_TEXT as T } from './penduduk-miskin.text';

const ARAH_ICON = { naik: IconArrowUpRight, turun: IconArrowDownRight, tetap: IconArrowRight } as const;
const ARAH_TEXT = { naik: T.naik, turun: T.turun, tetap: T.tetap } as const;

/** "Turun 385 orang (98,7%) dari 2025" / "Sama dengan 2025"; persen hilang bila pembanding 0. */
export function perubahanText(p: PerubahanTahun): string {
  const arah = arahPerubahan(p.selisih);
  if (arah === 'tetap') return `${T.tetap} ${p.dari}`;
  const persen = p.persen === null ? '' : ` (${formatPercent(Math.abs(p.persen))})`;
  return `${ARAH_TEXT[arah]} ${formatJumlah(Math.abs(p.selisih))} ${T.orang}${persen} ${T.dari(p.dari)}`;
}

type Props = { rows: readonly PendudukMiskinTahun[]; latest: PendudukMiskinTahun & { jumlah: number } };

/** Kartu tahun terbaru: jumlah + perubahan dari tahun terisi sebelumnya (bukan jumlah lintas tahun), lalu tanggal data. */
export function PendudukMiskinSummary({ rows, latest }: Props) {
  const perubahan = perubahanTahun(rows, latest);
  const Arah = perubahan ? ARAH_ICON[arahPerubahan(perubahan.selisih)] : null;
  const updated = latestUpdate(rows);
  return (
    <div className={s.card}>
      <h2 className={s.cardLabel}>{T.summaryLabel(latest.tahun)}</h2>
      <p className={s.cardValue}>
        {formatJumlah(latest.jumlah)} <span className={s.unit}>{T.orang}</span>
      </p>
      <p className={s.cardNote}>
        {Arah ? <Arah size={16} stroke={2} aria-hidden /> : null}
        {perubahan ? perubahanText(perubahan) : T.tanpaPembanding}
      </p>
      {updated ? <p className={s.updated}>{T.updated(formatTanggal(updated))}</p> : null}
    </div>
  );
}
