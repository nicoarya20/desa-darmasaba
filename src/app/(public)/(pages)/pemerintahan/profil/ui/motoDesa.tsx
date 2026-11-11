'use client'
import { ProfilCard } from '../_com/ProfilCard';
import { PROFIL_TEXT } from '../_com/profil.text';
import s from './moto.module.css';

const T = PROFIL_TEXT.moto;

/** Section Moto Desa: lima nilai SIGAP — tiap huruf berdampingan dengan nilainya — lalu kalimat komitmen. */
function MotoDesa() {
  return (
    <ProfilCard title={T.title}>
      <ol className={s.values}>
        {T.values.map((value) => (
          <li key={value.letter} className={s.value}>
            {/* Huruf hanya penanda visual akronim; nilainya sudah terbaca dari judul. */}
            <span className={s.letter} aria-hidden="true">{value.letter}</span>
            <div className={s.text}>
              <h3 className={s.valueTitle}>{value.title}</h3>
              <p className={s.valueBody}>{value.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={s.quote}>
        {T.quoteBefore}
        <strong>{T.quoteMark}</strong>
        {T.quoteAfter}
      </p>
    </ProfilCard>
  );
}

export default MotoDesa;
