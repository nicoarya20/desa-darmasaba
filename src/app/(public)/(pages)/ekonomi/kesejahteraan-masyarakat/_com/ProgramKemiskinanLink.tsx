import { IconLifebuoy } from '@tabler/icons-react';
import { EkonomiTerkait } from '../../_com/terkait/EkonomiTerkait';
import { PROGRAM_KEMISKINAN_HREF } from './kesejahteraan.meta';
import { KESEJAHTERAAN_TEXT as T } from './kesejahteraan.text';

/** Tautan silang ke Program Pengentasan Kemiskinan (halaman saudara, sengaja terpisah). */
export function ProgramKemiskinanLink() {
  return (
    <EkonomiTerkait
      href={PROGRAM_KEMISKINAN_HREF}
      icon={<IconLifebuoy size={32} />}
      title={T.terkaitTitle}
      text={T.terkaitText}
      aksi={T.terkaitAksi}
    />
  );
}
