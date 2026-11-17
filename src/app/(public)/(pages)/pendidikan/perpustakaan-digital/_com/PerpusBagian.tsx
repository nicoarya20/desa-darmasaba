import { IconClock, IconSearch, IconStar } from '@tabler/icons-react';
import s from './perpus-bagian.module.css';
import { PERPUS_CARA_ID } from './perpus.meta';
import { PERPUS_TEXT as T } from './perpus.text';

const FITUR_ICONS = [IconClock, IconSearch, IconStar] as const;

/** Tiga hal yang tersedia di website perpustakaan (ubin berikon). */
export function PerpusFitur() {
  return (
    <section className={s.section} aria-labelledby="perpus-fitur">
      <div className={s.sectionHead}>
        <h2 id="perpus-fitur" className={s.sectionTitle}>{T.fiturTitle}</h2>
        <p className={s.sectionLead}>{T.fiturLead}</p>
      </div>
      {/* role="list": Safari membuang semantik daftar saat list-style dihapus. */}
      <ul className={s.grid} role="list">
        {T.fitur.map((item, i) => {
          const Icon = FITUR_ICONS[i % FITUR_ICONS.length];
          return (
            <li key={item.title} className={s.tile}>
              <span className={s.iconCircle}><Icon size={24} stroke={1.75} aria-hidden /></span>
              <h3 className={s.tileTitle}>{item.title}</h3>
              <p className={s.tileText}>{item.desc}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Langkah bernomor 01–03; target anchor `#cara-membaca` (tombol kedua di kepala). */
export function PerpusLangkah() {
  return (
    <section id={PERPUS_CARA_ID} className={s.section} aria-labelledby="perpus-langkah">
      <h2 id="perpus-langkah" className={s.sectionTitle}>{T.langkahTitle}</h2>
      <ol className={s.grid} role="list">
        {T.langkah.map((step, i) => (
          <li key={step.title} className={s.tile}>
            <span className={s.stepNumber} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={s.tileTitle}>{step.title}</h3>
            <p className={s.tileText}>{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
