'use client';
import kabarList from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import type { KategoriEvent } from '@/lib/agenda-desa';
import { useMemo, useState } from 'react';
import { AGENDA_TEXT } from './_com/agenda.text';
import { AgendaDetailModal, type AgendaDetail } from './_com/agenda-detail-modal';
import { AgendaKalender } from './_com/agenda-kalender';
import { AgendaKategori } from './_com/agenda-kategori';
import { AgendaMendatang } from './_com/agenda-mendatang';
import { AgendaTahun } from './_com/agenda-tahun';
import { idHariDaftar } from './_com/agenda-daftar-bulan';
import { bulanDariHari, geserBulan, hariWita, kategoriTersedia, rentangHari, saringKategori, type BulanKe } from './_com/kalender.logic';
import { useAgendaMendatang, useAgendaTahun } from './_com/use-agenda-data';
import s from './_com/kalender.module.css';

/** Halaman publik "Agenda & Kalender Desa" (route lama /pemerintahan/event-budaya tetap dipakai). */
function AgendaKalenderDesaPage() {
  const now = useMemo(() => new Date(), []);
  const hariIni = hariWita(now);
  const bulanIni = useMemo(() => bulanDariHari(hariIni), [hariIni]);
  const [bulan, setBulan] = useState<BulanKe>(bulanIni);
  const [arah, setArah] = useState(0);
  const [tersembunyi, setTersembunyi] = useState<string[]>([]);
  const [tampilRerainan, setTampilRerainan] = useState(true);
  const [detail, setDetail] = useState<AgendaDetail | null>(null);

  const tahun = useAgendaTahun(bulan.tahun);
  const mendatang = useAgendaMendatang();
  const tampil = useMemo(() => (tahun.items ? saringKategori(tahun.items, tersembunyi) : null), [tahun.items, tersembunyi]);

  const keBulan = (tujuan: BulanKe) => {
    const beda = tujuan.tahun * 12 + tujuan.bulan - (bulan.tahun * 12 + bulan.bulan);
    setArah(Math.sign(beda));
    setBulan(tujuan);
  };

  const toggleKategori = (k: KategoriEvent) =>
    setTersembunyi((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  const lompatKeHari = (hari: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(idHariDaftar(hari))?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className={s.page} style={KABAR_BRAND_VARS}>
      <header className={kabarList.header}>
        <BackButton />
        <div className={kabarList.intro}>
          <h1 className={kabarList.title}>{AGENDA_TEXT.title}</h1>
          <p className={kabarList.lead}>{AGENDA_TEXT.lead}</p>
        </div>
      </header>

      <div className={s.layout}>
        <div className={s.side}>
          <div className={s.areaUpcoming}>
            <AgendaMendatang
              data={mendatang.data}
              error={mendatang.error}
              now={now}
              tampilRerainan={tampilRerainan}
              onPilih={(item) => {
                keBulan(bulanDariHari(Math.max(rentangHari(item).mulai, hariIni)));
                setDetail({ judul: null, items: [item] });
              }}
            />
          </div>
          <div className={s.areaLegend}>
            <AgendaKategori
              tersedia={kategoriTersedia(tahun.items ?? [])}
              tersembunyi={tersembunyi}
              onToggle={toggleKategori}
              tampilRerainan={tampilRerainan}
              onToggleRerainan={() => setTampilRerainan((v) => !v)}
            />
          </div>
          <div className={s.areaYear}>
            <AgendaTahun tahun={bulan.tahun} items={tampil} bulanAktif={bulan} bulanIni={bulanIni} onPilih={keBulan} />
          </div>
        </div>
        <div className={s.areaMain}>
          <AgendaKalender
            bulan={bulan}
            bulanIni={bulanIni}
            arah={arah}
            items={tampil}
            error={tahun.error}
            hariIni={hariIni}
            now={now}
            tampilRerainan={tampilRerainan}
            onGeser={(d) => keBulan(geserBulan(bulan, d))}
            onHariIni={() => keBulan(bulanIni)}
            onMuatUlang={tahun.muatUlang}
            onBuka={setDetail}
            onPilihHari={lompatKeHari}
          />
        </div>
      </div>

      <AgendaDetailModal detail={detail} now={now} tampilRerainan={tampilRerainan} onClose={() => setDetail(null)} />
    </div>
  );
}

export default AgendaKalenderDesaPage;
