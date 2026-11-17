import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
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
      <Link href={POTENSI_DESA_HREF} className={`${s.potensiLink} ${r.trigger}`}>
        <span className={r.cta} data-text={T.potensiLink}>
          {T.potensiLink}
        </span>
        <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
      </Link>
    </aside>
  );
}
