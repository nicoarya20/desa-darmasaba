'use client';
import colors from '@/con/colors';
import type { CSSProperties, ReactNode } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from '../../../ppid/_com/PpidHeader';
import frame from '../page-frame/page-frame.module.css';
import s from './program-info.module.css';
import { ProgramInfoBody } from './ProgramInfoBody';
import type { ProgramInfoSectionView } from './ProgramInfoSection';

export type { ProgramInfoSectionView } from './ProgramInfoSection';

const BRAND_VARS = { '--brand': colors['blue-button'] } as CSSProperties;

type Props = {
  /** h1 = nama menu. */
  title: string;
  lead: string;
  /** `null` = memuat (kerangka). Urutan = urutan tampil. */
  sections: readonly ProgramInfoSectionView[] | null;
  /** Slot di antara kepala dan bagian (mis. panel info praktis); hanya dirender setelah data siap. */
  before?: ReactNode;
};

/**
 * Halaman program berisi CMS (Pendidikan) dalam kerangka bersama page-frame: tombol kembali, kepala PPID
 * (judul + pengantar), lalu bagian berlabel bergaris (judul kiri | isi kanan) tanpa kartu.
 */
export function ProgramInfoPage({ title, lead, sections, before }: Props) {
  return (
    <div className={`${frame.frame} ${s.page}`} style={BRAND_VARS}>
      <div className={`${frame.inner} ${s.layout}`}>
        <BackButton />
        <PpidHeader title={title} lead={lead} />
        <ProgramInfoBody title={title} sections={sections} before={before} />
      </div>
    </div>
  );
}
