import type { JenisProgram } from './jenis-program.logic';
import s from './jenis-program.module.css';

/** Daftar bernomor jenis program: pengantar, lalu nama program tebal dengan butir keterangan abu di bawahnya. */
export function JenisProgramList({ data }: { data: JenisProgram }) {
  return (
    <div>
      {data.pengantar.map((text, i) => (
        <p key={i} className={s.pengantar}>
          {text}
        </p>
      ))}
      <ol className={s.list}>
        {data.items.map((item, i) => (
          <li key={i} className={s.item}>
            <div className={s.text}>
              <span className={s.nama}>{item.nama}</span>
              {item.keterangan.map((ket, j) => (
                <span key={j} className={s.keterangan}>
                  {ket}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
