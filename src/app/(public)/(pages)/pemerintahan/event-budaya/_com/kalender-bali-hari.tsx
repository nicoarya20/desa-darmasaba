'use client';
import { AGENDA_TEXT } from './agenda.text';
import { BarisRerainan, IkonBulan } from './kalender-bali';
import { faseBulan, hariBali, namaHariBali, saringRerainan, teksTanggalSasih } from './kalender-bali.logic';
import { warigaHari } from './kalender-bali.wariga';
import type { AgendaItem } from './kalender.logic';
import s from './kalender-bali.module.css';

const T = AGENDA_TEXT.bali;

type Props = {
  hari: number;
  /** Agenda desa di hari itu (yang tampil) — rerainan bernama sama disembunyikan. */
  agenda: readonly AgendaItem[];
  tampilRerainan: boolean;
};

/** Bagian Bali di modal hari: ringkasan (hari Bali, wuku, sasih), rerainan, lalu wariga lengkap. */
export function BaliHariIsi({ hari, agenda, tampilRerainan }: Props) {
  const info = hariBali(hari);
  const rerainan = tampilRerainan ? saringRerainan(info.rerainan, agenda) : [];
  const fase = faseBulan(info);

  return (
    <section className={s.modalBali} aria-label={T.wariga}>
      <p className={s.modalRingkas}>
        {fase && <IkonBulan fase={fase} size={14} />}
        <span>
          {namaHariBali(info)} · {T.wuku} {info.wuku} · {teksTanggalSasih(info)}, Sasih {info.sasih} · Çaka {info.saka}
        </span>
      </p>

      {rerainan.length > 0 && (
        <div className={s.modalBlok}>
          <h3 className={s.modalJudul}>{T.rerainan}</h3>
          <ul className={s.modalRerainan}>
            {rerainan.map((r) => (
              <li key={r.nama}>
                <BarisRerainan r={r} ikonBulan />
              </li>
            ))}
          </ul>
          <p className={s.modalCatatan}>{T.catatan}</p>
        </div>
      )}

      <div className={s.modalBlok}>
        <h3 className={s.modalJudul}>{T.wariga}</h3>
        {warigaHari(hari).map((k) => (
          <div key={k.judul} className={s.wariga}>
            <h4 className={s.warigaJudul}>{k.judul}</h4>
            <dl className={s.warigaGrid}>
              {k.baris.map((b) => (
                <div key={b.label}>
                  <dt>{b.label}</dt>
                  <dd>{b.nilai}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
