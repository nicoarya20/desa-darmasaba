'use client';
import { Skeleton } from '@mantine/core';
import type { ReactNode } from 'react';
import { programInfoOverall } from './program-info.logic';
import s from './program-info.module.css';
import { PROGRAM_INFO_TEXT as T } from './program-info.text';
import { ProgramInfoSection, type ProgramInfoSectionView } from './ProgramInfoSection';

const SKELETON_SECTIONS = 2;
const SKELETON_ROWS = 4;

type Props = {
  /** Nama halaman untuk kalimat keadaan (memuat/kosong/galat). */
  title: string;
  /** `null` = memuat (kerangka). Urutan = urutan tampil. */
  sections: readonly ProgramInfoSectionView[] | null;
  /** Slot sebelum bagian (mis. panel info praktis); hanya dirender setelah data siap. */
  before?: ReactNode;
};

/**
 * Isi halaman program CMS tanpa kerangka halaman: kerangka memuat, bagian bergaris, atau satu kalimat keadaan.
 * Dipakai ProgramInfoPage (kerangka Pendidikan) dan halaman di kerangka lain (Kabar menu Lingkungan); pemakai wajib
 * memasang token `--pi-*` (kelas `.page` atau `.tokens` program-info.module.css) dan `--brand`.
 */
export function ProgramInfoBody({ title, sections, before }: Props) {
  if (sections === null) return <ProgramInfoSkeleton label={T.loading(title)} />;
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
