'use client';
import { useMemo } from 'react';
import { RERAINAN_SEL_MAKS } from './kalender-bali.meta';
import { AGENDA_TEXT } from './agenda.text';
import {
  faseBulan,
  namaHariBali,
  rerainanBerikutnya,
  teksSelisihHari,
  teksTanggalSasih,
  type FaseBulan,
  type HariBali,
  type Rerainan,
} from './kalender-bali.logic';
import s from './kalender-bali.module.css';

const T = AGENDA_TEXT.bali;

/** Ikon bulan: purnama = cakram kuning penuh, tilem = cakram gelap bercincin. */
export function IkonBulan({ fase, size = 12, className }: { fase: FaseBulan; size?: number; className?: string }) {
  return (
    <svg className={className ? `${s.bulan} ${className}` : s.bulan} data-fase={fase} width={size} height={size} viewBox="0 0 12 12" role="img" aria-label={T[fase]}>
      <circle cx="6" cy="6" r="5" />
    </svg>
  );
}

/**
 * Satu baris rerainan: penanda (belah ketupat penuh = hari raya besar, garis = rutin, ikon = purnama/tilem) + nama.
 * Nama dibungkus span sendiri: teks lepas di dalam flex jadi flex item anonim yang tak bisa diberi elipsis.
 */
export function BarisRerainan({ r, ikonBulan = false }: { r: Rerainan; ikonBulan?: boolean }) {
  const fase = ikonBulan ? r.bulan : null;
  return (
    <span className={s.rr} data-tingkat={r.tingkat} data-ikon={fase ? true : undefined}>
      {fase && <IkonBulan fase={fase} size={11} />}
      <span className={s.rrNama}>{r.nama}</span>
    </span>
  );
}

/** Rerainan di sel kalender bulan desktop: maksimal beberapa baris, sisanya "+N rerainan". */
export function RerainanSel({ list, onClick, style }: { list: Rerainan[]; onClick: () => void; style: React.CSSProperties }) {
  const lebih = list.length > RERAINAN_SEL_MAKS;
  const terlihat = lebih ? list.slice(0, RERAINAN_SEL_MAKS - 1) : list;
  return (
    <button type="button" className={s.sel} style={style} onClick={onClick} title={list.map((r) => r.nama).join(' · ')}>
      {terlihat.map((r) => (
        <BarisRerainan key={r.nama} r={r} />
      ))}
      {lebih && <span className={s.selLebih}>{T.lainnya(list.length - terlihat.length)}</span>}
    </button>
  );
}

/**
 * Kepala sel desktop: ikon bulan menempel di sudut angka tanggal (tanpa makan lebar) + nama hari Bali,
 * mis. "Wraspati Pon" — turun ke 2 baris bila sel sempit, disembunyikan bila satu kata pun tak muat.
 */
export function KepalaSelBali({ info, tampilBulan }: { info: HariBali; tampilBulan: boolean }) {
  const fase = faseBulan(info);
  return (
    <>
      {tampilBulan && fase && <IkonBulan fase={fase} size={10} className={s.lencana} />}
      <span className={s.kepala}>
        <span className={s.wewaran}>{namaHariBali(info)}</span>
      </span>
    </>
  );
}

/** Label wuku tegak di tepi kiri baris minggu (wuku selalu berganti hari Minggu = Redite). */
export function LabelWuku({ wuku }: { wuku: string }) {
  return (
    <span className={s.wuku}>
      <span className={s.wukuKata}>{T.wuku}</span> {wuku}
    </span>
  );
}

/** Penanda Bali di kalender ringkas ponsel: ikon bulan, atau belah ketupat untuk hari raya besar. */
export function TandaRingkas({ info, rerainan }: { info: HariBali; rerainan: Rerainan[] | undefined }) {
  if (!rerainan?.length) return null;
  const fase = rerainan.some((r) => r.bulan) ? faseBulan(info) : null;
  if (fase) return <IkonBulan fase={fase} size={9} />;
  return rerainan.some((r) => r.tingkat === 'besar') ? <span className={s.tanda} /> : null;
}

/** Baris Bali di kartu "Hari ini": tanggal Bali + rerainan besar berikutnya. */
export function HariIniBali({ info, tampilRerainan }: { info: HariBali; tampilRerainan: boolean }) {
  const berikut = useMemo(() => (tampilRerainan ? rerainanBerikutnya(info.hari) : null), [info.hari, tampilRerainan]);
  return (
    <span className={s.hariIni}>
      <span>
        {namaHariBali(info)} · {T.wuku} {info.wuku} · {teksTanggalSasih(info)}, Sasih {info.sasih}
      </span>
      {berikut && (
        <span className={s.berikut}>
          {T.berikutnya}: <strong>{berikut.nama}</strong> · {teksSelisihHari(berikut.selisih)}
        </span>
      )}
    </span>
  );
}
