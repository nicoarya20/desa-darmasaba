'use client';
import colors from '@/con/colors';
import { Skeleton } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from '../../../ppid/_com/PpidHeader';
import frame from '../page-frame/page-frame.module.css';
import { programInfoOverall } from './program-info.logic';
import s from './program-info.module.css';
import { PROGRAM_INFO_TEXT as T } from './program-info.text';
import { ProgramInfoSection, type ProgramInfoSectionView } from './ProgramInfoSection';

export type { ProgramInfoSectionView } from './ProgramInfoSection';

const BRAND_VARS = { '--brand': colors['blue-button'] } as CSSProperties;
const SKELETON_SECTIONS = 2;
const SKELETON_ROWS = 4;

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
        {sections === null ? (
          <ProgramInfoSkeleton label={T.loading(title)} />
        ) : (
          <Body title={title} sections={sections} before={before} />
        )}
      </div>
    </div>
  );
}

function Body({ title, sections, before }: { title: string; sections: readonly ProgramInfoSectionView[]; before?: ReactNode }) {
  // Slot `before` (panel berisi) sudah tampil → jangan ciutkan ke satu kalimat halaman; pesan per bagian saja.
  const overall = before ? 'sections' : programInfoOverall(sections);
  if (overall === 'sections' && sections.length === 0) return <>{before}</>;
  return (
    <>
      {before}
      {overall === 'sections' ? (
        <div className={s.sections}>
          {sections.map((section) => (
            <ProgramInfoSection key={section.key} section={section} />
          ))}
        </div>
      ) : (
        <p className={s.pageNote}>{overall === 'error' ? T.pageError(title) : T.pageEmpty(title)}</p>
      )}
    </>
  );
}

/** Kerangka selama memuat: bagian bergaris dengan judul dan baris abu. */
function ProgramInfoSkeleton({ label }: { label: string }) {
  return (
    <div className={s.sections} role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: SKELETON_SECTIONS }, (_, i) => (
        <div key={i} className={s.section}>
          <Skeleton h={28} w="70%" radius="sm" />
          <div className={s.skeletonRows}>
            {Array.from({ length: SKELETON_ROWS }, (_, j) => (
              <Skeleton key={j} h={22} radius="sm" w={j === SKELETON_ROWS - 1 ? '45%' : '85%'} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
