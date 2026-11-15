import { IconCertificate, IconHome, IconMail } from '@tabler/icons-react';
import { BEASISWA_SYARAT_ID } from './beasiswa.meta';
import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';

const SYARAT_ICONS = [IconHome, IconCertificate, IconMail] as const;

/** Syarat pendaftaran (3 ubin ikon); target anchor `#syarat` (tombol "Syarat dan alur", alamat lama). */
export function BeasiswaSyarat() {
  return (
    <section id={BEASISWA_SYARAT_ID} className={s.section} aria-labelledby="beasiswa-syarat">
      <h2 id="beasiswa-syarat" className={s.sectionTitle}>{T.syaratTitle}</h2>
      <ul className={s.grid} role="list">
        {T.syarat.map((item, i) => {
          const Icon = SYARAT_ICONS[i % SYARAT_ICONS.length];
          return (
            <li key={item.title} className={s.tile}>
              <span className={s.tileIcon}><Icon size={28} stroke={1.6} aria-hidden /></span>
              <h3 className={s.tileTitle}>{item.title}</h3>
              <p className={s.tileText}>{item.desc}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Alur seleksi bernomor tanpa tanggal + catatan jadwal; bagian sendiri tepat setelah Syarat. */
export function BeasiswaAlur() {
  return (
    <section className={s.section} aria-labelledby="beasiswa-alur">
      <h2 id="beasiswa-alur" className={s.sectionTitle}>{T.alurTitle}</h2>
      {/* role="list": Safari membuang semantik daftar saat list-style dihapus. */}
      <ol className={`${s.grid} ${s.gridSteps}`} role="list">
        {T.alur.map((step, i) => (
          <li key={step.title} className={s.tile}>
            <span className={s.stepNumber} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={s.tileTitle}>{step.title}</h3>
            <p className={s.tileText}>{step.desc}</p>
          </li>
        ))}
      </ol>
      <p className={s.note}>{T.jadwalNote}</p>
    </section>
  );
}
