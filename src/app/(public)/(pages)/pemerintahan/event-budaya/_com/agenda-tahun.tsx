'use client';
import { hitungAgendaPerBulan, NAMA_BULAN } from '@/lib/agenda-desa-waktu';
import { AGENDA_TEXT } from './agenda.text';
import { singkat, type AgendaItem, type BulanKe } from './kalender.logic';
import s from './agenda-panel.module.css';

const T = AGENDA_TEXT.tahun;
const TINGKAT_SEDANG = 2;
const TINGKAT_RAMAI = 4;

/** Tingkat warna sel bulan: 0 kosong, 1 ada, 2 beberapa, 3 ramai. */
export const tingkatBulan = (n: number) => (n === 0 ? 0 : n < TINGKAT_SEDANG ? 1 : n < TINGKAT_RAMAI ? 2 : 3);

type Props = {
  tahun: number;
  items: AgendaItem[] | null;
  bulanAktif: BulanKe;
  bulanIni: BulanKe;
  onPilih: (b: BulanKe) => void;
};

/** Ringkasan setahun: 12 sel bulan berwarna sesuai jumlah acara; klik membuka bulan itu di kalender. */
export function AgendaTahun({ tahun, items, bulanAktif, bulanIni, onPilih }: Props) {
  const jumlah = items ? hitungAgendaPerBulan(items, tahun) : null;
  const total = items?.length ?? 0;

  return (
    <section className={s.year} aria-label={T.label(tahun)}>
      <div className={s.yearHead}>
        <h2 className={s.legendTitle}>{T.title(tahun)}</h2>
        {items && <span className={s.yearTotal}>{T.jumlah(total)}</span>}
      </div>
      <ol className={s.yearGrid}>
        {NAMA_BULAN.map((nama, i) => {
          const bulan = i + 1;
          const n = jumlah?.[i] ?? 0;
          const aktif = bulanAktif.tahun === tahun && bulanAktif.bulan === bulan;
          return (
            <li key={nama}>
              <button
                type="button"
                className={s.yearCell}
                data-tingkat={jumlah ? tingkatBulan(n) : undefined}
                data-sekarang={bulanIni.tahun === tahun && bulanIni.bulan === bulan || undefined}
                aria-current={aktif ? 'date' : undefined}
                aria-label={`${nama} ${tahun}: ${AGENDA_TEXT.kalender.jumlahBulan(n)}`}
                onClick={() => onPilih({ tahun, bulan })}
              >
                <span className={s.yearMonth}>{singkat(nama)}</span>
                <span className={s.yearCount}>{jumlah ? (n > 0 ? n : '–') : ''}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
