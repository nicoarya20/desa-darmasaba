'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { LayananSection } from './LayananSection';
import { OSS_STEPS, stepNumber, type LayananSingleton } from './layanan.logic';
import { LAYANAN_SINGLETON_ID, OSS_URL } from './layanan.meta';
import page from './layanan.module.css';
import s from './layanan-info.module.css';
import { LAYANAN_TEXT } from './layanan.text';

const T = LAYANAN_TEXT.oss;

/** Bagian Perizinan Berusaha (OSS): deskripsi dari admin, alur pendaftaran NIB (statis), tautan ke oss.go.id. */
function PelayananPerizinanBerusaha() {
  const snap = useSnapshot(stateLayananDesa.pelayananPerizinanBerusaha.findById);

  // `findById.data` tetap null saat gagal, jadi selesai-memuat dilacak terpisah agar tidak tertukar dengan "kosong".
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let alive = true;
    void stateLayananDesa.pelayananPerizinanBerusaha.findById
      .load(LAYANAN_SINGLETON_ID)
      .finally(() => {
        if (alive) setSettled(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const data = snap.data as LayananSingleton | null;

  return (
    <LayananSection
      title={T.title}
      lead={T.lead}
      meta={data ? <LayananWaktuBiayaBadge estimasiWaktu={data.estimasiWaktu} biaya={data.biaya} /> : null}
    >
      {!settled && !data ? (
        <span className={s.cardPlaceholder} aria-hidden />
      ) : data?.deskripsi ? (
        // HTML dari editor admin (sumber tepercaya, pola sama dengan bagian lain halaman ini).
        <div className={s.richText} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
      ) : (
        <p className={page.empty}>{T.empty}</p>
      )}

      <h3 className={s.subTitle}>{T.stepsTitle}</h3>
      <ol className={s.steps}>
        {OSS_STEPS.map((step, index) => (
          <li key={step.title} className={s.step}>
            <span className={s.stepNumber} aria-hidden>
              {stepNumber(index)}
            </span>
            <h4 className={s.stepTitle}>{step.title}</h4>
            <p className={s.stepText}>{step.description}</p>
          </li>
        ))}
      </ol>

      <div className={s.ossFooter}>
        <p className={s.note}>{T.note}</p>
        <a className={s.cta} href={OSS_URL} target="_blank" rel="noopener noreferrer">
          {T.cta}
          <IconArrowUpRight size={18} aria-hidden />
        </a>
      </div>
    </LayananSection>
  );
}

export default PelayananPerizinanBerusaha;
