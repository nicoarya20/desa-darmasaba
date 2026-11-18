import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';
import { toSentenceCase } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { detailHref } from '../_lib/kategori-tab';
import { programHref } from '../_lib/program-folder';
import { judulProgram } from '../_lib/program-judul';

type Props = { programId: string; programName: string; kategori?: string | null; folderName?: string | null };

const ROOT_HREF = '/desa-anti-korupsi';

/** Breadcrumb: Desa Anti Korupsi › kategori › program › folder (teks sentence case; item terakhir bukan tautan). */
export function ProgramBreadcrumb({ programId, programName, kategori, folderName }: Props) {
  const crumbs = [
    { label: 'Desa Anti Korupsi', href: ROOT_HREF },
    ...(kategori ? [{ label: toSentenceCase(kategori), href: detailHref(kategori) }] : []),
    { label: judulProgram(programName).lengkap, href: folderName ? programHref(programId) : null },
    ...(folderName ? [{ label: toSentenceCase(folderName), href: null }] : []),
  ];
  return (
    <Breadcrumbs separator="›" separatorMargin={6} style={{ flexWrap: 'wrap', rowGap: 4 }}>
      {crumbs.map((c, i) =>
        c.href ? (
          <Anchor
            key={i}
            component={Link}
            href={c.href}
            className={r.trigger}
            underline="never"
            fz="sm"
            c="var(--c-brand)"
            lineClamp={1}
            maw={260}
            title={c.label}
          >
            {/* Span inline di dalam kotak lineClamp: elipsis "…" tetap digambar Anchor (warna diam). */}
            <span className={`${r.title} ${r.titleBrand}`}>{c.label}</span>
          </Anchor>
        ) : (
          <Text key={i} fz="sm" c="dimmed" lineClamp={1} maw={260} title={c.label} aria-current="page">
            {c.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}
