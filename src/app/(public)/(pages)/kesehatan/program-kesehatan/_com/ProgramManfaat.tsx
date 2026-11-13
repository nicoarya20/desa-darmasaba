import { IconBarbell, IconOld, IconUsersGroup, type Icon } from '@tabler/icons-react';
import s from './program.module.css';
import { MANFAAT_TEXT as T } from './program.text';

const TITLE_ID = 'program-manfaat-title';

const ICONS: Record<(typeof T.items)[number]['key'], Icon> = {
  bugar: IconBarbell,
  kebersamaan: IconUsersGroup,
  lansia: IconOld,
};

/** "Manfaat Program Kesehatan": 3 ubin statis (ikon garis + judul + teks), isi sama dengan halaman lama. */
export function ProgramManfaat() {
  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <div className={s.blockHead}>
        <h2 id={TITLE_ID} className={s.blockTitle}>
          {T.title}
        </h2>
        <p className={s.blockLead}>{T.lead}</p>
      </div>
      <ul className={s.manfaat}>
        {T.items.map((item) => {
          const ItemIcon = ICONS[item.key];
          return (
            <li key={item.key} className={s.manfaatTile}>
              <ItemIcon className={s.manfaatIcon} size={32} stroke={1.5} aria-hidden />
              <h3 className={s.manfaatTitle}>{item.title}</h3>
              <p className={s.manfaatDesc}>{item.desc}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
