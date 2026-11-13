'use client';
import { labelKategoriEvent, warnaKategoriEvent } from '@/lib/agenda-desa';
import { IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import { AgendaHitungPil } from './agenda-hitung';
import { BarisRerainan } from './kalender-bali';
import { gabungDaftarHari, namaHariBali, type BaliBulan } from './kalender-bali.logic';
import {
  formatHari,
  hitungMundur,
  kelompokPerHari,
  NAMA_HARI,
  rentangHari,
  singkat,
  tanggalDariHari,
  teksTanggalAcara,
  type AgendaItem,
  type BulanKe,
} from './kalender.logic';
import bs from './kalender-bali.module.css';
import s from './kalender-ponsel.module.css';

/** id elemen kelompok hari di daftar (target loncat dari kalender ringkas). */
export const idHariDaftar = (hari: number) => `agenda-hari-${hari}`;

type Props = {
  bulan: BulanKe;
  items: AgendaItem[];
  hariIni: number;
  now: Date;
  bali: BaliBulan;
  onPilih: (item: AgendaItem) => void;
  /** Buka modal hari (agenda + rerainan + wariga). */
  onBukaHari: (hari: number) => void;
};

/**
 * Daftar bulan per hari (ponsel): kolom tanggal kiri; di kanan baris hari Bali (wewaran · wuku → modal
 * wariga), rerainan, lalu kartu acara pucat bergaris warna kategori. Hari tanpa acara ikut bila ada rerainan.
 */
export function AgendaDaftarBulan({ bulan, items, hariIni, now, bali, onPilih, onBukaHari }: Props) {
  const daftar = gabungDaftarHari(kelompokPerHari(items, bulan), bali.rerainan);
  if (daftar.length === 0) return null;

  return (
    <ol className={s.list}>
      {daftar.map(({ hari, items: acara, rerainan }) => {
        const { tanggal, hariMinggu } = tanggalDariHari(hari);
        const info = bali.hari.get(hari);
        return (
          <li key={hari} id={idHariDaftar(hari)} className={s.group}>
            <span
              className={s.groupDate}
              data-hari-ini={hari === hariIni || undefined}
              data-minggu={hariMinggu === 0 || undefined}
              aria-hidden
            >
              <span className={s.groupWd}>{singkat(NAMA_HARI[hariMinggu])}</span>
              <span className={s.groupNum}>{tanggal}</span>
            </span>
            <div className={s.groupItems}>
              {info && (
                <button
                  type="button"
                  className={bs.baliBaris}
                  onClick={() => onBukaHari(hari)}
                  aria-label={`${AGENDA_TEXT.bali.wariga} ${formatHari(hari)}: ${namaHariBali(info)}, ${AGENDA_TEXT.bali.wuku} ${info.wuku}`}
                >
                  <span>
                    {namaHariBali(info)} · {AGENDA_TEXT.bali.wuku} {info.wuku}
                  </span>
                  <span className={bs.baliLink} aria-hidden>
                    {AGENDA_TEXT.bali.lihatWariga}
                    <IconChevronRight size={16} stroke={2} />
                  </span>
                </button>
              )}
              {rerainan.length > 0 && (
                <ul className={bs.daftarRerainan}>
                  {rerainan.map((r) => (
                    <li key={r.nama}>
                      <BarisRerainan r={r} ikonBulan />
                    </li>
                  ))}
                </ul>
              )}
              {acara.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={s.card}
                  style={varWarnaKategori(warnaKategoriEvent(item.kategori))}
                  data-lewat={rentangHari(item).selesai < hariIni || undefined}
                  onClick={() => onPilih(item)}
                >
                  <span className={s.cardKategori}>{labelKategoriEvent(item.kategori)}</span>
                  <span className={s.cardNama}>{item.nama}</span>
                  <span className={s.cardTanggal}>{teksTanggalAcara(item)}</span>
                  {item.lokasi && (
                    <span className={s.cardLokasi}>
                      <IconMapPin size={14} stroke={1.75} aria-hidden />
                      {item.lokasi}
                    </span>
                  )}
                  {rentangHari(item).selesai >= hariIni && <AgendaHitungPil hitung={hitungMundur(item, now)} />}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
