import type { HitungMundur } from './kalender.logic';
import s from './agenda-panel.module.css';

/** Pil hitung mundur ("Besok", "8 hari lagi", "Hari ini"); warnanya mengikuti kedekatan acara. */
export function AgendaHitungPil({ hitung }: { hitung: HitungMundur }) {
  return (
    <span className={s.hitung} data-nada={hitung.nada}>
      {hitung.teks}
    </span>
  );
}
