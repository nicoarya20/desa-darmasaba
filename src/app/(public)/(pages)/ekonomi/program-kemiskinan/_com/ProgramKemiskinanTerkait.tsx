import { IconChartBar, IconHeartHandshake } from '@tabler/icons-react';
import { EkonomiTerkait } from '../../_com/terkait/EkonomiTerkait';
import { KESEJAHTERAAN_HREF, PENDUDUK_MISKIN_HREF } from './program-kemiskinan.meta';
import s from './program-kemiskinan.module.css';
import { PROGRAM_KEMISKINAN_TEXT as T } from './program-kemiskinan.text';

/** Dua ubin tautan silang (Jumlah Penduduk Miskin, Kesejahteraan Masyarakat); tampil di semua keadaan muat. */
export function ProgramKemiskinanTerkait() {
  return (
    <div className={s.terkait}>
      <EkonomiTerkait
        href={PENDUDUK_MISKIN_HREF}
        icon={<IconChartBar size={32} />}
        title={T.pendudukMiskin.title}
        text={T.pendudukMiskin.text}
        aksi={T.pendudukMiskin.aksi}
        label={`${T.terkaitListLabel}: ${T.pendudukMiskin.title}`}
      />
      <EkonomiTerkait
        href={KESEJAHTERAAN_HREF}
        icon={<IconHeartHandshake size={32} />}
        title={T.kesejahteraan.title}
        text={T.kesejahteraan.text}
        aksi={T.kesejahteraan.aksi}
        label={`${T.terkaitListLabel}: ${T.kesejahteraan.title}`}
      />
    </div>
  );
}
