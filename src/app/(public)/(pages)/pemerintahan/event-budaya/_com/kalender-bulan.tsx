'use client';
import { warnaKategoriEvent } from '@/lib/agenda-desa';
import { KALENDER_LAJUR_MAKS, varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import {
  acaraPadaHari,
  batasBulan,
  formatHari,
  mingguBulan,
  NAMA_HARI,
  rentangHari,
  singkat,
  susunMinggu,
  tanggalDariHari,
  teksTanggalAcara,
  tersembunyiPerHari,
  type AgendaItem,
  type BulanKe,
} from './kalender.logic';
import type { AgendaDetail } from './agenda-detail-modal';
import { KepalaSelBali, LabelWuku, RerainanSel } from './kalender-bali';
import type { BaliBulan } from './kalender-bali.logic';
import s from './kalender.module.css';

type Props = {
  bulan: BulanKe;
  items: AgendaItem[];
  hariIni: number;
  bali: BaliBulan;
  tampilRerainan: boolean;
  onBuka: (detail: AgendaDetail) => void;
};

/** Baris grid minggu: 1 tanggal, 2 rerainan, 3.. lajur acara, lalu "+N lainnya". */
const BARIS_RERAINAN = 2;
const BARIS_LAJUR_PERTAMA = 3;

/**
 * Tampilan bulan desktop/tablet (pola Outlook): 7 kolom Minggu–Sabtu, tanggal hari ini dalam lingkaran
 * biru, acara = blok pucat bergaris tebal warna kategori, acara beberapa hari = pita melintang.
 * Lapisan Bali: wuku di tepi kiri tiap minggu, nama hari Bali + ikon bulan di kepala sel, rerainan
 * sebagai teks kecil di bawah tanggal. Tanggal mana pun dalam bulan membuka modal hari (agenda + wariga).
 */
export function KalenderBulan({ bulan, items, hariIni, bali, tampilRerainan, onBuka }: Props) {
  const batas = batasBulan(bulan);
  const bukaHari = (hari: number) => onBuka({ judul: formatHari(hari), items: acaraPadaHari(items, hari), hari });

  return (
    <div className={s.month}>
      <div className={s.weekdays} aria-hidden>
        {NAMA_HARI.map((nama, i) => (
          <span key={nama} data-minggu={i === 0 || undefined}>
            <span className={s.wdLong}>{nama}</span>
            <span className={s.wdShort}>{singkat(nama)}</span>
          </span>
        ))}
      </div>
      {mingguBulan(bulan).map((minggu) => {
        const segmen = susunMinggu(minggu, items, batas);
        const tersembunyi = tersembunyiPerHari(segmen, KALENDER_LAJUR_MAKS);
        const wuku = bali.hari.get(minggu[0])?.wuku;
        return (
          <div key={minggu[0]} className={s.week}>
            {wuku && <LabelWuku wuku={wuku} />}
            {minggu.map((hari, kolom) => {
              const luar = hari < batas.awal || hari > batas.akhir;
              const { tanggal } = tanggalDariHari(hari);
              const info = bali.hari.get(hari);
              return (
                <div
                  key={hari}
                  className={s.day}
                  style={{ gridColumn: kolom + 1 }}
                  data-luar={luar || undefined}
                  data-hari-ini={hari === hariIni || undefined}
                  data-minggu={kolom === 0 || undefined}
                >
                  <div className={s.dayHead}>
                    {luar ? (
                      <span className={s.dayNum}>{tanggal}</span>
                    ) : (
                      <button type="button" className={s.dayNum} onClick={() => bukaHari(hari)} aria-label={formatHari(hari)}>
                        {tanggal}
                      </button>
                    )}
                    {info && !luar && <KepalaSelBali info={info} tampilBulan={tampilRerainan} />}
                  </div>
                </div>
              );
            })}
            {minggu.map((hari, kolom) => {
              const list = bali.rerainan.get(hari);
              return list ? (
                <RerainanSel
                  key={`bali-${hari}`}
                  list={list}
                  style={{ gridColumn: kolom + 1, gridRow: BARIS_RERAINAN }}
                  onClick={() => bukaHari(hari)}
                />
              ) : null;
            })}
            {segmen
              .filter((g) => g.lajur < KALENDER_LAJUR_MAKS)
              .map((g) => (
                <button
                  key={g.item.id}
                  type="button"
                  className={s.event}
                  style={{
                    ...varWarnaKategori(warnaKategoriEvent(g.item.kategori)),
                    gridColumn: `${g.kolom + 1} / span ${g.panjang}`,
                    gridRow: g.lajur + BARIS_LAJUR_PERTAMA,
                  }}
                  data-panjang={g.panjang > 1 || undefined}
                  data-lanjut-kiri={g.lanjutKiri || undefined}
                  data-lanjut-kanan={g.lanjutKanan || undefined}
                  data-lewat={rentangHari(g.item).selesai < hariIni || undefined}
                  aria-label={`${g.item.nama}, ${teksTanggalAcara(g.item)}`}
                  onClick={() => onBuka({ judul: null, items: [g.item] })}
                >
                  {g.item.nama}
                </button>
              ))}
            {tersembunyi.map((n, kolom) =>
              n > 0 ? (
                <button
                  key={`lain-${minggu[kolom]}`}
                  type="button"
                  className={s.more}
                  style={{ gridColumn: kolom + 1, gridRow: KALENDER_LAJUR_MAKS + BARIS_LAJUR_PERTAMA }}
                  onClick={() => bukaHari(minggu[kolom])}
                >
                  {AGENDA_TEXT.kalender.lainnya(n)}
                </button>
              ) : null,
            )}
          </div>
        );
      })}
    </div>
  );
}
