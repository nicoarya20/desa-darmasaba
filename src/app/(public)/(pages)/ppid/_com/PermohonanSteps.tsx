import { useId } from 'react';
import type { PermohonanStep } from './permohonan.meta';
import s from './permohonan.module.css';

type Props = { title: string; steps: readonly PermohonanStep[] };

/** Alur bernomor halaman permohonan PPID (permohonan informasi & keberatan): judul + daftar langkah berurutan. */
export function PermohonanSteps({ title, steps }: Props) {
  const titleId = useId();
  return (
    <section className={s.steps} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.stepsTitle}>{title}</h2>
      {/* role="list": Safari membuang semantik daftar saat list-style dihapus. */}
      <ol className={s.stepList} role="list">
        {steps.map((step, index) => (
          <li key={step.title} className={s.step}>
            <span className={s.stepNumber} aria-hidden>{index + 1}</span>
            <div>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepDesc}>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
