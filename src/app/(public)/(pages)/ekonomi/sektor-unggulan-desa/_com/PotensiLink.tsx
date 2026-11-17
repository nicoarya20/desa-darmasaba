import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { POTENSI_DESA_HREF } from './sektor-unggulan.meta';
import s from './sektor-unggulan.module.css';
import { SEKTOR_UNGGULAN_TEXT as T } from './sektor-unggulan.text';

/** Ubin tautan ke Potensi Desa (foto & cerita); tampil di semua keadaan, juga saat data kosong atau galat. */
export function PotensiLink() {
  return (
    <aside className={s.potensi} aria-label={T.potensiTitle}>
      <p className={s.potensiBody}>{T.potensiBody}</p>
      <Link href={POTENSI_DESA_HREF} className={s.potensiLink}>
        {T.potensiLink}
        <IconChevronRight size={16} stroke={2} aria-hidden />
      </Link>
    </aside>
  );
}
