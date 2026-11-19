import { DIMENSI_IDM, type IndeksDesaRecord } from '@/lib/indeks-desa';
import { barStyle, formatSkor } from './indeks-desa.logic';
import { INDEKS_DESA_TEXT as T } from './indeks-desa.text';
import s from './indeks-desa.module.css';

/** Ringkasan tahun terbaru: skor IDM + status, lalu tiga kartu dimensi (IKS, IKE, IKL) dengan batang skor 0-1. */
export function IndeksDesaRingkasan({ latest }: { latest: IndeksDesaRecord }) {
  return (
    <>
      <section className={s.hero} aria-labelledby="idm-latest-title">
        <h2 id="idm-latest-title" className={s.heroTitle}>{T.latestTitle(latest.tahun)}</h2>
        <div className={s.heroBody}>
          <p className={s.heroScore}>
            <span className={s.label}>{T.skorIdmLabel}</span>
            <span className={s.bigNumber}>{formatSkor(latest.skorIdm)}</span>
          </p>
          <p className={s.heroStatus}>
            <span className={s.label}>{T.statusLabel}</span>
            <span className={s.pill}>{latest.status}</span>
          </p>
        </div>
        {latest.catatan ? (
          <p className={s.catatan}>
            <span className={s.label}>{T.catatanLabel}: </span>
            {latest.catatan}
          </p>
        ) : null}
      </section>

      <section className={s.block} aria-labelledby="idm-dimensi-title">
        <h2 id="idm-dimensi-title" className={s.blockTitle}>{T.dimensiTitle}</h2>
        <p className={s.blockCaption}>{T.dimensiCaption(latest.tahun)}</p>
        <ul className={s.cards}>
          {DIMENSI_IDM.map((dimensi) => (
            <li key={dimensi.key} className={s.card}>
              <p className={s.cardCode}>{dimensi.singkatan}</p>
              <p className={s.cardName}>{dimensi.nama}</p>
              <p className={s.cardValue}>{formatSkor(latest[dimensi.key])}</p>
              <div className={s.track} aria-hidden>
                <div className={s.fill} style={barStyle(latest[dimensi.key])} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
