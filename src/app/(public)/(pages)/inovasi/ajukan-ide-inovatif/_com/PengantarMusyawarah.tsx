import { Link } from 'next-view-transitions';
import { useId } from 'react';
import s from './ajukan-ide.module.css';
import {
  PENGANTAR_MUSYAWARAH_JUDUL,
  PENGANTAR_MUSYAWARAH_LINKS,
  PENGANTAR_MUSYAWARAH_TEKS,
} from './pengantar-musyawarah.const';

/** Blok info: ide warga dapat dibawa ke Musyawarah Desa / Musrenbangdes, beserta tautan terkait (tanpa kartu). */
export default function PengantarMusyawarah() {
  const titleId = useId();
  return (
    <section className={s.musyawarah} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.musyawarahTitle}>
        {PENGANTAR_MUSYAWARAH_JUDUL}
      </h2>
      <p className={s.musyawarahText}>{PENGANTAR_MUSYAWARAH_TEKS}</p>
      <ul className={s.links}>
        {PENGANTAR_MUSYAWARAH_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={s.link}>
              {link.label} <span aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
