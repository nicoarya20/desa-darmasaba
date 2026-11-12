'use client';
import { labelKategoriEvent, warnaKategoriEvent } from '@/lib/agenda-desa';
import { NAMA_BULAN } from '@/lib/agenda-desa-waktu';
import { IconCalendarPlus, IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import { AgendaHitungPil } from './agenda-hitung';
import { HariIniBali } from './kalender-bali';
import { hariBali } from './kalender-bali.logic';
import {
  formatHari,
  hariWita,
  hitungMundur,
  rentangHari,
  singkat,
  tanggalDariHari,
  teksTanggalAcara,
  type AgendaItem,
} from './kalender.logic';
import s from './agenda-mendatang.module.css';
import panel from './agenda-panel.module.css';

const T = AGENDA_TEXT.mendatang;

type Props = {
  data: { items: AgendaItem[]; total: number } | null;
  error: boolean;
  now: Date;
  /** Legenda "Rerainan Bali" aktif → tampilkan juga rerainan berikutnya. */
  tampilRerainan: boolean;
  onPilih: (item: AgendaItem) => void;
};

/** Panel "Acara mendatang": tanggal hari ini (+ tanggal Bali), sorotan acara terdekat dengan hitung mundur besar, lalu daftar berikutnya. */
export function AgendaMendatang({ data, error, now, tampilRerainan, onPilih }: Props) {
  const [sorotan, ...lainnya] = data?.items ?? [];
  const sisa = data ? Math.max(0, data.total - data.items.length) : 0;

  return (
    <section className={s.panel} aria-labelledby="agenda-mendatang-judul">
      <p className={s.today}>
        <span className={s.todayLabel}>{AGENDA_TEXT.hariIni}</span>
        <span>{formatHari(hariWita(now))}</span>
        <HariIniBali info={hariBali(hariWita(now))} tampilRerainan={tampilRerainan} />
      </p>
      <h2 id="agenda-mendatang-judul" className={s.panelTitle}>
        {T.title}
      </h2>

      {error ? (
        <p className={s.note}>{T.galat}</p>
      ) : !data ? (
        <div className={s.skeleton} style={{ height: 148 }} aria-hidden />
      ) : !sorotan ? (
        <div className={s.kosong}>
          <span className={s.kosongIkon}>
            <IconCalendarPlus size={26} stroke={1.5} aria-hidden />
          </span>
          <p className={s.kosongJudul}>{T.kosongJudul}</p>
          <p className={s.kosongIsi}>{T.kosongIsi}</p>
        </div>
      ) : (
        <>
          <Sorotan item={sorotan} now={now} onPilih={onPilih} />
          {lainnya.length > 0 && (
            <ul className={s.rows}>
              {lainnya.map((item) => (
                <li key={item.id}>
                  <Baris item={item} now={now} onPilih={onPilih} />
                </li>
              ))}
            </ul>
          )}
          {sisa > 0 && <p className={s.note}>{T.lainnya(sisa)}</p>}
        </>
      )}
    </section>
  );
}

function Sorotan({ item, now, onPilih }: { item: AgendaItem; now: Date; onPilih: (item: AgendaItem) => void }) {
  const hitung = hitungMundur(item, now);
  return (
    <button
      type="button"
      className={s.sorotan}
      style={varWarnaKategori(warnaKategoriEvent(item.kategori))}
      onClick={() => onPilih(item)}
    >
      <span className={s.sorotanLabel}>{T.terdekat}</span>
      <span className={s.sorotanHitung} data-nada={hitung.nada}>
        <span className={s.sorotanUtama}>{hitung.utama}</span>
        {hitung.keterangan && <span className={s.sorotanKet}>{hitung.keterangan}</span>}
      </span>
      <span className={s.sorotanKategori}>{labelKategoriEvent(item.kategori)}</span>
      <span className={s.sorotanNama}>{item.nama}</span>
      <span className={s.sorotanMeta}>{teksTanggalAcara(item)}</span>
      {item.lokasi && (
        <span className={s.sorotanMeta}>
          <IconMapPin size={15} stroke={1.75} aria-hidden />
          {item.lokasi}
        </span>
      )}
    </button>
  );
}

function Baris({ item, now, onPilih }: { item: AgendaItem; now: Date; onPilih: (item: AgendaItem) => void }) {
  const { tanggal, bulan } = tanggalDariHari(rentangHari(item).mulai);
  return (
    <button
      type="button"
      className={s.row}
      style={varWarnaKategori(warnaKategoriEvent(item.kategori))}
      onClick={() => onPilih(item)}
    >
      <span className={s.rowDate} aria-hidden>
        <span className={s.rowMonth}>{singkat(NAMA_BULAN[bulan - 1])}</span>
        <span className={s.rowDay}>{tanggal}</span>
      </span>
      <span className={s.rowText}>
        <span className={s.rowName}>{item.nama}</span>
        <span className={panel.srOnly}>{teksTanggalAcara(item)}</span>
        <AgendaHitungPil hitung={hitungMundur(item, now)} />
      </span>
      <IconChevronRight className={s.rowChevron} size={18} stroke={1.75} aria-hidden />
    </button>
  );
}
