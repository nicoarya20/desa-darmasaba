import { isPathHidden } from '@/app/(public)/_com/menu-visibility.logic';
import { IconBriefcase, IconHeartHandshake, IconSchool } from '@tabler/icons-react';
import type { ReactNode } from 'react';
// Hutang teknis: ubin milik menu Ekonomi diimpor lintas menu (keputusan brief: jangan dipindah di branch ini).
import { EkonomiTerkait } from '../../../ekonomi/_com/terkait/EkonomiTerkait';
import s from './frame.module.css';
import { KEPENDUDUKAN_TEXT } from './kependudukan.text';

const T = KEPENDUDUKAN_TEXT.terkait;

type Tautan = { href: string; icon: ReactNode; title: string; text: string };

const TAUTAN: readonly Tautan[] = [
  { href: '/ekonomi/jumlah-penduduk-miskin', icon: <IconHeartHandshake size={32} />, title: T.miskinTitle, text: T.miskinText },
  { href: '/ekonomi/demografi-pekerjaan', icon: <IconBriefcase size={32} />, title: T.pekerjaanTitle, text: T.pekerjaanText },
  { href: '/pendidikan/data-pendidikan', icon: <IconSchool size={32} />, title: T.pendidikanTitle, text: T.pendidikanText },
];

/** Ubin tautan ke data penduduk di menu lain; halaman yang submenunya disembunyikan admin tidak ditautkan. */
export function KependudukanTerkait({ hiddenHrefs }: { hiddenHrefs: readonly string[] }) {
  const tautan = TAUTAN.filter((t) => !isPathHidden(t.href, hiddenHrefs));
  if (tautan.length === 0) return null;
  return (
    <div className={s.terkait}>
      {tautan.map((t) => (
        <EkonomiTerkait key={t.href} href={t.href} icon={t.icon} title={t.title} text={t.text} aksi={T.aksi} label={T.label(t.title)} />
      ))}
    </div>
  );
}
