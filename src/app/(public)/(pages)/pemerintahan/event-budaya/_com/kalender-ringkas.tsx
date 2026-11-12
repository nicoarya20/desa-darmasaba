'use client';
import { KATEGORI_EVENT_COLOR } from '@/lib/agenda-desa';
import { KALENDER_TITIK_MAKS, varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import {
  acaraPadaHari,
  batasBulan,
  formatHari,
  kategoriPerHari,
  mingguBulan,
  NAMA_HARI,
  singkat,
  tanggalDariHari,
  type AgendaItem,
  type BulanKe,
} from './kalender.logic';
import { TandaRingkas } from './kalender-bali';
import type { BaliBulan } from './kalender-bali.logic';
import s from './kalender-ponsel.module.css';

type Props = {
  bulan: BulanKe;
  items: AgendaItem[];
  hariIni: number;
  bali: BaliBulan;
  /** Ketuk tanggal mana pun dalam bulan (loncat ke daftar, atau buka modal hari bila tak ada di daftar). */
  onPilihHari: (hari: number) => void;
};

/**
 * Kalender bulan ringkas untuk ponsel: angka tanggal + titik warna kategori, tanpa teks acara.
 * Penanda Bali cukup ikon purnama/tilem atau belah ketupat hari raya besar; wuku & wewaran ada di daftar/modal.
 */
export function KalenderRingkas({ bulan, items, hariIni, bali, onPilihHari }: Props) {
  const batas = batasBulan(bulan);
  const titik = kategoriPerHari(items, bulan);

  return (
    <div className={s.mini}>
      <div className={s.miniHead} aria-hidden>
        {NAMA_HARI.map((nama, i) => (
          <span key={nama} data-minggu={i === 0 || undefined}>
            {singkat(nama)}
          </span>
        ))}
      </div>
      <div className={s.miniGrid}>
        {mingguBulan(bulan)
          .flat()
          .map((hari) => {
            const luar = hari < batas.awal || hari > batas.akhir;
            const kategori = luar ? [] : (titik.get(hari) ?? []);
            const { tanggal, hariMinggu } = tanggalDariHari(hari);
            const info = bali.hari.get(hari);
            const rerainan = bali.rerainan.get(hari);
            const attrs = {
              className: s.miniDay,
              'data-luar': luar || undefined,
              'data-hari-ini': hari === hariIni || undefined,
              'data-minggu': hariMinggu === 0 || undefined,
              'data-ada': kategori.length > 0 || undefined,
            };
            const isi = (
              <>
                <span className={s.miniNum}>{tanggal}</span>
                <span className={s.miniDots} aria-hidden>
                  {kategori.slice(0, KALENDER_TITIK_MAKS).map((k) => (
                    <span key={k} className={s.miniDot} style={varWarnaKategori(KATEGORI_EVENT_COLOR[k])} />
                  ))}
                  {info && <TandaRingkas info={info} rerainan={rerainan} />}
                </span>
              </>
            );
            return !luar ? (
              <button
                key={hari}
                type="button"
                {...attrs}
                aria-label={[
                  `${formatHari(hari)}: ${AGENDA_TEXT.kalender.jumlahBulan(acaraPadaHari(items, hari).length)}`,
                  ...(rerainan ?? []).map((r) => r.nama),
                ].join(', ')}
                onClick={() => onPilihHari(hari)}
              >
                {isi}
              </button>
            ) : (
              <span key={hari} {...attrs} aria-hidden={luar || undefined}>
                {isi}
              </span>
            );
          })}
      </div>
    </div>
  );
}
