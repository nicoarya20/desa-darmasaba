'use client';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { AGENDA_TEXT } from './agenda.text';
import type { AgendaDetail } from './agenda-detail-modal';
import { AgendaDaftarBulan, idHariDaftar } from './agenda-daftar-bulan';
import { baliBulan, judulSasih, lapisanBali } from './kalender-bali.logic';
import { KalenderBulan } from './kalender-bulan';
import { KalenderRingkas } from './kalender-ringkas';
import {
  acaraDalamBulan,
  acaraPadaHari,
  batasBulan,
  formatHari,
  judulBulan,
  samaBulan,
  type AgendaItem,
  type BulanKe,
} from './kalender.logic';
import s from './kalender.module.css';

const T = AGENDA_TEXT.kalender;

type Props = {
  bulan: BulanKe;
  bulanIni: BulanKe;
  /** Arah pindah bulan terakhir (animasi geser): 1 maju, -1 mundur, 0 tanpa gerak. */
  arah: number;
  /** Acara tahun bulan ini, sudah disaring kategori; null = sedang dimuat. */
  items: AgendaItem[] | null;
  error: boolean;
  hariIni: number;
  now: Date;
  /** Legenda "Rerainan Bali" aktif. */
  tampilRerainan: boolean;
  onGeser: (delta: number) => void;
  onHariIni: () => void;
  onMuatUlang: () => void;
  onBuka: (detail: AgendaDetail) => void;
  /** Loncat ke kelompok hari di daftar ponsel. */
  onPilihHari: (hari: number) => void;
};

/**
 * Panel kalender: bilah alat (Hari ini, ‹ ›, judul bulan + sasih/Çaka) + kalender bulan (desktop) /
 * ringkas + daftar (ponsel). Hitungan Bali dibuat sekali per bulan tampil.
 */
export function AgendaKalender(p: Props) {
  const { tahun, bulan } = p.bulan;
  const judul = judulBulan(p.bulan);
  const bulanIni = useMemo(() => (p.items ? acaraDalamBulan(p.items, { tahun, bulan }) : null), [p.items, tahun, bulan]);
  const peta = useMemo(() => baliBulan({ tahun, bulan }), [tahun, bulan]);
  const sasih = useMemo(() => judulSasih(peta, batasBulan({ tahun, bulan })), [peta, tahun, bulan]);
  const bali = useMemo(
    () => lapisanBali(peta, { tahun, bulan }, bulanIni ?? [], p.tampilRerainan),
    [peta, tahun, bulan, bulanIni, p.tampilRerainan],
  );
  const bukaHari = (hari: number) => p.onBuka({ judul: formatHari(hari), items: acaraPadaHari(bulanIni ?? [], hari), hari });
  // Kalender ringkas: hari yang ada di daftar → loncat ke sana; selain itu langsung buka modal hari.
  const pilihRingkas = (hari: number) =>
    document.getElementById(idHariDaftar(hari)) ? p.onPilihHari(hari) : bukaHari(hari);

  return (
    <section className={s.panel} aria-label={T.label}>
      <div className={s.toolbar}>
        <button type="button" className={s.todayBtn} onClick={p.onHariIni} disabled={samaBulan(p.bulan, p.bulanIni)}>
          {T.hariIni}
        </button>
        <div className={s.navs}>
          <button type="button" className={s.navBtn} onClick={() => p.onGeser(-1)} aria-label={T.sebelumnya}>
            <IconChevronLeft size={20} stroke={2} aria-hidden />
          </button>
          <button type="button" className={s.navBtn} onClick={() => p.onGeser(1)} aria-label={T.berikutnya}>
            <IconChevronRight size={20} stroke={2} aria-hidden />
          </button>
        </div>
        <div className={s.monthHead} aria-live="polite">
          <h2 className={s.monthTitle}>{judul}</h2>
          <p className={s.monthBali}>{sasih}</p>
        </div>
        {bulanIni && <span className={s.monthCount}>{T.jumlahBulan(bulanIni.length)}</span>}
      </div>

      {p.error ? (
        <div className={s.state}>
          <p>{T.galat}</p>
          <button type="button" className={s.todayBtn} onClick={p.onMuatUlang}>
            {T.muatUlang}
          </button>
        </div>
      ) : !p.items || !bulanIni ? (
        <div className={s.loading} aria-busy="true" aria-label={T.memuat} />
      ) : (
        <div key={judul} className={s.body} data-arah={p.arah}>
          <div className={s.desktopOnly}>
            <KalenderBulan
              bulan={p.bulan}
              items={bulanIni}
              hariIni={p.hariIni}
              bali={bali}
              tampilRerainan={p.tampilRerainan}
              onBuka={p.onBuka}
            />
          </div>
          <div className={s.mobileOnly}>
            <KalenderRingkas bulan={p.bulan} items={bulanIni} hariIni={p.hariIni} bali={bali} onPilihHari={pilihRingkas} />
            <AgendaDaftarBulan
              bulan={p.bulan}
              items={bulanIni}
              hariIni={p.hariIni}
              now={p.now}
              bali={bali}
              onPilih={(item) => p.onBuka({ judul: null, items: [item] })}
              onBukaHari={bukaHari}
            />
          </div>
          {bulanIni.length === 0 && <p className={s.empty}>{T.kosong(judul)}</p>}
        </div>
      )}
    </section>
  );
}
