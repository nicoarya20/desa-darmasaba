import { IconBooks } from '@tabler/icons-react';
import s from './perpus-bagian.module.css';
import { PERPUS_TEXT as T } from './perpus.text';
import { PerpusLink } from './PerpusLink';

/** Panel penutup bergradasi brand dengan ajakan membuka website perpustakaan; hanya dirender bila tautan tersedia. */
export function PerpusPenutup({ href }: { href: string }) {
  return (
    <section className={s.closing} aria-labelledby="perpus-penutup">
      <IconBooks className={s.closingMark} size={220} stroke={1} aria-hidden />
      <div className={s.closingBody}>
        <h2 id="perpus-penutup" className={s.closingTitle}>{T.penutupTitle}</h2>
        <p className={s.closingText}>{T.penutupText}</p>
      </div>
      <div className={s.closingAction}>
        <PerpusLink href={href} variant="light" />
      </div>
    </section>
  );
}
