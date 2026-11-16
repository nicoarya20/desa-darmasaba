import { IconMapper, isIconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import type { CSSProperties } from 'react';
import type { Langkah } from './bank-sampah.logic';
import { STEPS_RAIL_MAX } from './bank-sampah.meta';
import s from './bank-sampah.module.css';
import { BANK_SAMPAH_TEXT as T } from './bank-sampah.text';

const TITLE_ID = 'bank-sampah-langkah-title';
const PLACEHOLDER_STEPS = 5;

/** Bagian "Cara menabung": judul selalu tampil; isi = alur bernomor, kerangka berdenyut, atau kotak kosong/galat. */
export function BankSampahSteps({ state }: { state: LoadState<Langkah[]> }) {
  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.blockTitle}>
        {T.stepsTitle}
      </h2>
      <StepsBody state={state} />
    </section>
  );
}

function StepsBody({ state }: { state: LoadState<Langkah[]> }) {
  if (state.status === 'loading') {
    return (
      <ol className={s.steps} style={railVars(PLACEHOLDER_STEPS)} aria-busy="true" aria-label={T.stepsLoading}>
        {Array.from({ length: PLACEHOLDER_STEPS }, (_, i) => (
          <li key={i} className={`${s.stepPlaceholder} ${kabar.placeholder}`} aria-hidden />
        ))}
      </ol>
    );
  }
  if (state.status === 'error' || state.data.length === 0) {
    return <p className={kabar.empty}>{state.status === 'error' ? T.stepsError : T.stepsEmpty}</p>;
  }

  const steps = state.data;
  const vertical = steps.length > STEPS_RAIL_MAX;
  // Slot ikon dipertahankan (kosong) untuk langkah berikon tak dikenal agar nama langkah tetap sejajar.
  const iconSlot = steps.some((step) => isIconKey(step.icon));
  return (
    // role="list": Safari membuang semantik daftar saat list-style dihapus.
    <ol className={`${s.steps} ${vertical ? s.stepsVertical : ''}`} style={railVars(steps.length)} role="list">
      {steps.map((step, index) => (
        <li key={step.id} className={s.step}>
          <span className={s.stepNumber} aria-hidden>
            {index + 1}
          </span>
          <span className={s.stepBody}>
            {/* Ikon tak dikenal → tanpa ikon (IconMapper sendiri jatuh ke tanda tanya). */}
            {iconSlot ? (
              <span className={s.stepIcon} aria-hidden>
                {isIconKey(step.icon) ? <IconMapper name={step.icon} size={32} color="currentColor" /> : null}
              </span>
            ) : null}
            <span className={s.stepName}>{step.name}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Jumlah kolom rel horizontal desktop (dibatasi STEPS_RAIL_MAX; lebih dari itu kelas vertikal yang berlaku). */
function railVars(count: number): CSSProperties {
  return { '--steps': Math.min(Math.max(count, 1), STEPS_RAIL_MAX) } as CSSProperties;
}
