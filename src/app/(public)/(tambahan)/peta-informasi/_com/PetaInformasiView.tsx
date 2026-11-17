import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { Link } from 'next-view-transitions';
import type { PetaInformasiGroup } from '../_lib/petaInformasi';
import { PETA_INFORMASI_TEXT } from './peta-informasi.text';
import s from './peta-informasi.module.css';

const TITLE_ID = 'peta-informasi-judul';

/** id subjudul kelompok, dari nama menu (nama grup sudah unik setelah digabung). */
const groupHeadingId = (name: string) => `peta-grup-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

/**
 * Tampilan gaya apple.com/sitemap: judul kecil bergaris bawah, lalu tiap menu = subjudul h2 + daftar
 * tautan, mengalir turun di 3 kolom (1 kolom di ponsel). Tanpa saring/hitungan (keputusan user).
 */
export default function PetaInformasiView({ groups }: { groups: readonly PetaInformasiGroup[] }) {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <header className={s.head}>
          <h1 id={TITLE_ID} className={s.title}>
            {PETA_INFORMASI_TEXT.title}
          </h1>
        </header>
        <nav aria-labelledby={TITLE_ID} className={s.nav}>
          <ul className={s.groups}>
            {groups.map((group) => {
              const headingId = groupHeadingId(group.name);
              return (
                <li key={group.name} className={s.group}>
                  <h2 id={headingId} className={s.groupTitle}>
                    {group.name}
                  </h2>
                  <ul aria-labelledby={headingId} className={s.links}>
                    {group.pages.map((page) => (
                      <li key={page.href} className={s.item}>
                        <Link href={page.href} className={`${s.link} ${r.trigger}`}>
                          <span className={r.cta} data-text={page.label}>
                            {page.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
