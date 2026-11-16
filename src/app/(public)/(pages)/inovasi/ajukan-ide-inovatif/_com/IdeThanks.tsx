import { InovasiFormCard } from '../../_com/InovasiFormCard';
import { AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import s from './ajukan-ide.module.css';

/** Keadaan terima kasih di tempat formulir setelah kirim sukses; fokus pindah ke judul agar terbaca pembaca layar. */
export function IdeThanks({ onAgain }: { onAgain: () => void }) {
  return (
    <InovasiFormCard title={T.thanksTitle} lead={T.thanksText} focusTitle>
      <div>
        <button type="button" className={s.again} onClick={onAgain}>
          {T.again} <span aria-hidden>›</span>
        </button>
      </div>
    </InovasiFormCard>
  );
}
