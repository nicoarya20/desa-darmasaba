import { useId } from 'react';
import { PermohonanSteps } from '../../../ppid/_com/PermohonanSteps';
import { AJUKAN_IDE_STEPS, AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import s from './ajukan-ide.module.css';
import PengantarMusyawarah from './PengantarMusyawarah';

/** Kolom kiri Ajukan Ide: tujuan, alur setelah ide dikirim (alur bernomor PPID), lalu pengantar Musyawarah Desa. */
export function IdeAside() {
  const tujuanId = useId();
  return (
    <div className={s.aside}>
      <section aria-labelledby={tujuanId}>
        <h2 id={tujuanId} className={s.asideTitle}>
          {T.tujuanTitle}
        </h2>
        <ul className={s.tujuan}>
          {T.tujuan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <PermohonanSteps title={T.stepsTitle} steps={AJUKAN_IDE_STEPS} />
      <PengantarMusyawarah />
    </div>
  );
}
