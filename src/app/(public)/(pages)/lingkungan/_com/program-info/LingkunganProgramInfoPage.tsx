'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import pi from '../../../pendidikan/_com/program-info/program-info.module.css';
import { ProgramInfoBody } from '../../../pendidikan/_com/program-info/ProgramInfoBody';
import type { ProgramInfoSectionView } from '../../../pendidikan/_com/program-info/ProgramInfoSection';
import s from './lingkungan-program-info.module.css';
import { LINGKUNGAN_PROGRAM_INFO_TEXT as T } from './lingkungan-program-info.text';

const noSearch = () => {};

type Props = {
  /** h1 = nama menu. */
  title: string;
  lead: string;
  /** `null` = memuat (kerangka). Urutan = urutan tampil. */
  sections: readonly ProgramInfoSectionView[] | null;
};

/**
 * Halaman teks berisi CMS menu Lingkungan (Edukasi Lingkungan, Konservasi Adat Bali): kerangka Kabar (`.section`, tepi
 * `--edge-gutter`, kepala `KabarListHeader` tanpa cari), isi = bagian bergaris modul program-info Pendidikan.
 */
export function LingkunganProgramInfoPage({ title, lead, sections }: Props) {
  return (
    <div className={`${kabar.section} ${pi.tokens} ${s.page}`} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={title}
        lead={lead}
        searchLabel={T.searchLabel}
        searchPlaceholder=""
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noSearch}
        searchable={false}
      />
      <ProgramInfoBody title={title} sections={sections} />
    </div>
  );
}
