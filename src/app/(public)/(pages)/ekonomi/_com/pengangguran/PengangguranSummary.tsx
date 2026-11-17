import { formatPercent } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';
import {
  arahPerubahan,
  namaPeriode,
  perubahanBulan,
  porsi,
  type PengangguranBulan,
  type Perubahan,
} from './pengangguran.logic';
import { SERI_WARNA } from './pengangguran.meta';
import s from './pengangguran.module.css';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

const ARAH_ICON = { naik: IconArrowUpRight, turun: IconArrowDownRight, tetap: IconArrowRight } as const;
const ARAH_TEXT = { naik: T.naik, turun: T.turun, tetap: T.tetap } as const;

/** "Turun 80 orang (22,9%) dari Januari 2026" / "Sama dengan Januari 2026"; persen hilang bila bulan lalu 0. */
export function perubahanText(p: Perubahan): string {
  const arah = arahPerubahan(p.selisih);
  if (arah === 'tetap') return `${T.tetap} ${namaPeriode(p.dari)}`;
  const persen = p.persen === null ? '' : ` (${formatPercent(Math.abs(p.persen))})`;
  return `${ARAH_TEXT[arah]} ${formatJumlah(Math.abs(p.selisih))} ${T.orang}${persen} ${T.dariBulan(namaPeriode(p.dari))}`;
}

type Props = { rows: readonly PengangguranBulan[]; latest: PengangguranBulan };

/** Tiga kartu bulan terbaru: jumlah + perubahan dari bulan kalender sebelumnya, lalu terdidik & tidak terdidik + porsi. */
export function PengangguranSummary({ rows, latest }: Props) {
  const perubahan = perubahanBulan(rows, latest);
  const Arah = perubahan ? ARAH_ICON[arahPerubahan(perubahan.selisih)] : null;
  const bagian = [
    { key: 'terdidik', label: T.jumlah.terdidik, value: latest.terdidik, color: SERI_WARNA.terdidik },
    { key: 'tidakTerdidik', label: T.jumlah.tidakTerdidik, value: latest.tidakTerdidik, color: SERI_WARNA.tidakTerdidik },
  ];

  return (
    <ul className={s.summary} aria-label={T.jumlah.summaryLabel}>
      <li className={s.card}>
        <p className={s.cardLabel}>{T.jumlah.totalLabel(namaPeriode(latest))}</p>
        <p className={s.cardValue}>
          {formatJumlah(latest.total)} <span className={s.unit}>{T.orang}</span>
        </p>
        <p className={s.cardNote}>
          {Arah ? <Arah size={16} stroke={2} aria-hidden /> : null}
          {perubahan ? perubahanText(perubahan) : T.jumlah.tanpaPembanding}
        </p>
      </li>
      {bagian.map((b) => {
        const share = porsi(b.value, latest.total);
        return (
          <li key={b.key} className={s.card}>
            <p className={s.cardLabel}>{b.label}</p>
            <p className={s.cardValue}>
              {formatJumlah(b.value)} <span className={s.unit}>{T.orang}</span>
            </p>
            {share === null ? null : (
              <p className={s.cardNote}>
                <span className={s.swatch} style={{ background: b.color }} aria-hidden />
                {T.porsi(formatPercent(share))}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
