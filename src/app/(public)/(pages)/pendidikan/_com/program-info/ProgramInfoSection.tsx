import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import type { ReactNode } from 'react';
import type { ProgramInfoEntry } from './program-info.logic';
import { toProgramInfoContent } from './program-info.logic';
import s from './program-info.module.css';
import { PROGRAM_INFO_TEXT as T } from './program-info.text';
import { ProgramInfoList } from './ProgramInfoList';

/** Entri bagian + render kustom opsional (`content`) yang menggantikan isi bawaan di kerangka yang sama. */
export type ProgramInfoSectionView = ProgramInfoEntry & { content?: ReactNode };

/** Satu bagian: judul CMS (h2) di kiri, isi di kanan (≤734px bertumpuk). */
export function ProgramInfoSection({ section }: { section: ProgramInfoSectionView }) {
  const titleId = `program-info-${section.key}`;
  return (
    <section className={s.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.sectionTitle}>
        {section.title}
      </h2>
      <div className={s.sectionBody}>
        <SectionBody section={section} />
      </div>
    </section>
  );
}

function SectionBody({ section }: { section: ProgramInfoSectionView }) {
  if (section.failed) return <p className={s.note}>{T.sectionError(section.title)}</p>;
  if (section.content !== undefined) return <>{section.content}</>;
  const content = toProgramInfoContent(section.html);
  if (content.kind === 'list') return <ProgramInfoList items={content.items} />;
  // HTML sudah disaring sanitizeRichText (hanya tag teks dasar, tanpa atribut).
  if (content.kind === 'html') return <div className={`${s.prose} ${rt.root}`} dangerouslySetInnerHTML={{ __html: content.html }} />;
  return <p className={s.note}>{T.sectionEmpty(section.title)}</p>;
}
